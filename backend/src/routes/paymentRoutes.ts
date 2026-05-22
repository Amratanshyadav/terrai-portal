import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Apply global JWT verification guard
router.use(authenticateJWT);

router.post('/', PaymentController.createPayment);
router.get('/', PaymentController.getAllPayments);
router.get('/worker/:workerId', PaymentController.getPaymentsByWorker);

export default router;
