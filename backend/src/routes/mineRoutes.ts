import { Router } from 'express';
import { MineController } from '../controllers/mineController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Apply global JWT verification guard
router.use(authenticateJWT);

router.post('/', requireRole(['Admin', 'Manager']), MineController.createMine);
router.get('/', MineController.getAllMines);
router.get('/:id', MineController.getMineById);
router.put('/:id', requireRole(['Admin', 'Manager']), MineController.updateMine);
router.post('/:id/telemetry', requireRole(['Admin', 'Manager', 'Supervisor']), MineController.updateEnvironmentalData);

export default router;
