import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  overridePaymentStatus, 
  getAllTrips, 
  getAllUsers 
} from '../controllers/adminController';

const router = express.Router();

router.patch('/trips/:id/override', authenticateToken, requireAdmin, overridePaymentStatus);
router.get('/trips', authenticateToken, requireAdmin, getAllTrips);
router.get('/users', authenticateToken, requireAdmin, getAllUsers);

export default router;