import { Router } from 'express';
import { WorkerController } from '../controllers/workerController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Apply global JWT verification guard
router.use(authenticateJWT);

router.post('/', WorkerController.createWorker);
router.get('/', WorkerController.getAllWorkers);
router.get('/:id', WorkerController.getWorkerById);
router.put('/:id', WorkerController.updateWorker);
router.delete('/:id', WorkerController.deleteWorker);

export default router;
