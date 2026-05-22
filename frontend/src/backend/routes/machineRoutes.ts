import { Router } from 'express';
import { MachineController } from '../controllers/machineController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Apply global JWT verification guard
router.use(authenticateJWT);

router.post('/', requireRole(['Admin', 'Manager']), MachineController.createMachine);
router.get('/', MachineController.getAllMachines);
router.get('/:id', MachineController.getMachineById);

// Telemetry and Maintenance logs
router.post('/:id/telemetry', requireRole(['Admin', 'Manager', 'Supervisor']), MachineController.updateTelemetry);
router.post('/:id/refuel', requireRole(['Admin', 'Manager', 'Supervisor']), MachineController.recordFuelLog);
router.post('/:id/maintenance', requireRole(['Admin', 'Manager', 'Supervisor']), MachineController.recordMaintenanceLog);

export default router;
