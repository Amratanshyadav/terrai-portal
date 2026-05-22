import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public Rate-Limited Auth Paths
router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

// Protected Auth Paths
router.get('/me', authenticateJWT, AuthController.getCurrentUser);
router.put('/role', authenticateJWT, AuthController.updateRole);

export default router;
