import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Apply global JWT verification guard
router.use(authenticateJWT);

router.post('/', requireRole(['Admin', 'Manager']), InventoryController.createInventoryItem);
router.get('/', InventoryController.getAllInventory);
router.get('/:id', InventoryController.getInventoryById);

// Stock updates
router.post('/:id/adjust', requireRole(['Admin', 'Manager', 'Supervisor']), InventoryController.updateInventoryQuantity);
router.delete('/:id', requireRole(['Admin', 'Manager']), InventoryController.deleteInventoryItem);

export default router;
