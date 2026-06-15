import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();
const adminController = new AdminController();

router.use(authenticateToken as any);
router.use(requireRole('admin') as any);

router.get('/pending-users', adminController.getPendingUsers);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/approve', adminController.approveUser);
router.put('/users/:id/reject', adminController.rejectUser);
router.put('/users/:id/block', adminController.blockUser);
router.put('/users/:id/unblock', adminController.unblockUser);
router.delete('/users/:id', adminController.deleteUser);

export default router;
