import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { sendNotification, getUserNotifications } from '../controllers/notificationsController';

const router = express.Router();

router.post('/', authenticateToken, sendNotification);
router.get('/', authenticateToken, getUserNotifications);

export default router;