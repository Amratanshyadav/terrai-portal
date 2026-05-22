import { Router } from 'express';
import { VehicleController } from '../controllers/vehicleController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Apply global JWT verification guard
router.use(authenticateJWT);

router.post('/check-in', VehicleController.checkInVehicle);
router.post('/check-out', VehicleController.checkOutVehicle);
router.get('/', VehicleController.getAllVehicleLogs);

export default router;
