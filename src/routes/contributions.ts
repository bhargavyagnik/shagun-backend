
import express from 'express';
import { addContribution,getContributions} from '../controllers/contributionController';
import { authenticateSession } from '../middleware/auth';

const router = express.Router();

router.post('/add',addContribution);
router.post('/get',authenticateSession,getContributions);

export default router; 


