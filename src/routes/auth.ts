import express from 'express';
import { 
    signup, 
    login, 
    createSessionCookie,
    // logout, 
} from '../controllers/authController';
import { authenticateSession } from '../middleware/auth';

const router = express.Router();

// Public routes (no auth required)
router.post('/signup', signup);
router.post('/login', login);
router.post('/session', createSessionCookie);
// router.post('/logout', logout);

export default router; 