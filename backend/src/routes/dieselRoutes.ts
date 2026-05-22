import { Router } from 'express';
import { DieselController } from '../controllers/dieselController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Apply global JWT verification guard
router.use(authenticateJWT);

router.post('/', DieselController.createFuelLog);
router.get('/', DieselController.getAllFuelLogs);

export default router;
