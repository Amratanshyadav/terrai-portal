import { Router } from 'express';
import { AiController } from '../controllers/aiController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Apply global JWT verification guard
router.use(authenticateJWT);

// Chatbot assistant
router.post('/chat', AiController.handleChat);
router.get('/chat/history', AiController.getChatHistory);

// Forecasting and Alerts
router.get('/forecast', requireRole(['Admin', 'Manager', 'Supervisor']), AiController.getProductionForecast);
router.get('/alerts', requireRole(['Admin', 'Manager', 'Supervisor']), AiController.getAlerts);
router.put('/alerts/:id/resolve', requireRole(['Admin', 'Manager', 'Supervisor']), AiController.resolveAlert);

export default router;
