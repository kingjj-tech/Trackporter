import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { processPayment } from '../controllers/paymentsController';

const router = express.Router();

router.post('/', authenticateToken, processPayment);

export default router;