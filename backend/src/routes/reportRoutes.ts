import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Apply global JWT verification guard
router.use(authenticateJWT);

router.post('/', requireRole(['Admin', 'Manager', 'Supervisor']), ReportController.createReport);
router.get('/', ReportController.getAllReports);
router.get('/:id', ReportController.getReportById);

export default router;
