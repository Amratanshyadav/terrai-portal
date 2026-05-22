import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, ITokenPayload } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { User } from '../models/User';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_key';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// Token generation utilities
export const generateAccessToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY as jwt.SignOptions['expiresIn'] });
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY as jwt.SignOptions['expiresIn'] });
};

// JWT Authentication Middleware
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access token is missing or malformed'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as ITokenPayload;
    
    // Check if user is still active in the database
    const user = await User.findById(decoded.id).select('isActive');
    if (!user || !user.isActive) {
      return next(new UnauthorizedError('User account is inactive or deleted'));
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token has expired'));
    }
    next(new UnauthorizedError('Invalid access token'));
  }
};

// RBAC Role Verification Middleware
export const requireRole = (allowedRoles: ('Admin' | 'Manager' | 'Supervisor' | 'Worker')[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
};
