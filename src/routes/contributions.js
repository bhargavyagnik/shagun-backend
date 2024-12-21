import express from 'express';
import { addContribution, getContributions, getTotalContributions } from '../controllers/contributionController';
import { authenticateSession } from '../middleware/auth';
const router = express.Router();
router.post('/add', addContribution);
router.get('/get/:eventId', authenticateSession, getContributions);
router.get('/gettotal', authenticateSession, getTotalContributions);
export default router;
