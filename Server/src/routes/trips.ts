import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getUserTrips, 
  addTrip, 
  updateTripPaymentStatus,
  getOutstandingBalances 
} from '../controllers/tripsController';

const router = express.Router();

router.get('/', authenticateToken, getUserTrips);
router.post('/', authenticateToken, addTrip);
router.patch('/:id/payment', authenticateToken, updateTripPaymentStatus);
router.get('/outstanding-balances', authenticateToken, getOutstandingBalances);

export default router;