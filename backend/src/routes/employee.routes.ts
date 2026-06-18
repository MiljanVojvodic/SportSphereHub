import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();
const ctrl = new EmployeeController();

router.use(authenticateToken as any);
router.use(requireRole('employee') as any);

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.get('/facilities', ctrl.getFacilities);
router.post('/facilities/json', ctrl.uploadFacilityJson);
router.post('/facilities', ctrl.createFacility);
router.put('/facilities/:id', ctrl.updateFacility);
router.post('/facilities/:id/courts', ctrl.addCourt);
router.delete('/facilities/:id/courts/:courtName', ctrl.removeCourt);

export default router;
