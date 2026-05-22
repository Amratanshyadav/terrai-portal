import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { AuthenticatedRequest, ITokenPayload } from '../types';
import { registerSchema, loginSchema } from '../validators/authValidator';

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key';

export class AuthController {
  /**
   * Register a new user in the platform.
   */
  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request input
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return next(new BadRequestError('Validation failed', validation.error.errors));
      }

      const { email, password, firstName, role } = validation.data;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new BadRequestError('Email address is already registered'));
      }

      // Create new user
      const user = new User({
        email,
        passwordHash: password, // Pre-save hook will hash this
        firstName,
        role,
      });

      await user.save();

      // Log registration audit trail
      const audit = new AuditLog({
        userId: user._id,
        action: 'USER_REGISTRATION',
        entity: 'User',
        entityId: user._id,
        details: `User registration completed for ${email} with role: ${role}`,
        ipAddress: req.ip,
      });
      await audit.save();

      res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: { user },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Log into the platform and obtain access & refresh tokens.
   */
  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return next(new BadRequestError('Validation failed', validation.error.errors));
      }

      const { email, password } = validation.data;

      // Find user
      const user = await User.findOne({ email }).select('+passwordHash');
      if (!user || !(await user.comparePassword(password))) {
        return next(new UnauthorizedError('Invalid email or password'));
      }

      if (!user.isActive) {
        return next(new UnauthorizedError('Your account is currently disabled. Please contact the administrator.'));
      }

      // Generate tokens
      const payload: ITokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      // Log login audit trail
      const audit = new AuditLog({
        userId: user._id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user._id,
        details: `Successful login from ${email}`,
        ipAddress: req.ip,
      });
      await audit.save();

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Request a new access token using a valid refresh token.
   */
  static async refresh(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return next(new BadRequestError('Refresh token is required'));
      }

      // Find user by refresh token
      const user = await User.findOne({ refreshToken });
      if (!user || !user.isActive) {
        return next(new UnauthorizedError('Invalid or expired session refresh token'));
      }

      // Verify JWT refresh token
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as ITokenPayload;
        
        // Ensure token matches current user
        if (decoded.id !== user._id.toString()) {
          return next(new UnauthorizedError('Token identity mismatch'));
        }

        const payload: ITokenPayload = {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };

        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        // Rotate refresh token
        user.refreshToken = newRefreshToken;
        await user.save();

        res.status(200).json({
          status: 'success',
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        });
      } catch (err: any) {
        return next(new UnauthorizedError('Invalid refresh token session'));
      }
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Log out of the platform, discarding active refresh tokens.
   */
  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return next(new BadRequestError('Refresh token is required for logout session clearance'));
      }

      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();

        // Audit log
        const audit = new AuditLog({
          userId: user._id,
          action: 'USER_LOGOUT',
          entity: 'User',
          entityId: user._id,
          details: `User logout completed for ${user.email}`,
          ipAddress: req.ip,
        });
        await audit.save();
      }

      res.status(200).json({
        status: 'success',
        message: 'Successfully logged out',
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Get active logged in user profile.
   */
  static async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication session not identified'));
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return next(new UnauthorizedError('User account not found'));
      }

      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update active user's operational role.
   */
  static async updateRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication session not identified'));
      }

      const { role } = req.body;
      if (!role || !['Admin', 'Manager', 'Supervisor', 'Worker'].includes(role)) {
        return next(new BadRequestError('Invalid operational role provided'));
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return next(new UnauthorizedError('User account not found'));
      }

      user.role = role;
      await user.save();

      // Audit log
      const audit = new AuditLog({
        userId: user._id,
        action: 'UPDATE_ROLE',
        entity: 'User',
        entityId: user._id,
        details: `Updated operational role to: ${role}`,
        ipAddress: req.ip,
      });
      await audit.save();

      res.status(200).json({
        status: 'success',
        message: 'Operational role updated successfully',
        data: { user },
      });
    } catch (err: any) {
      next(err);
    }
  }
}
