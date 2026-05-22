import { Router } from 'express';
import authRoutes from './authRoutes';
import workerRoutes from './workerRoutes';
import paymentRoutes from './paymentRoutes';
import vehicleRoutes from './vehicleRoutes';
import dieselRoutes from './dieselRoutes';

const router = Router();

// Mount all operational ledger pathways
router.use('/auth', authRoutes);
router.use('/workers', workerRoutes);
router.use('/payments', paymentRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/diesel', dieselRoutes);

export default router;
