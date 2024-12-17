import express from 'express';
import { 
    signup, 
    login, 
    createSessionCookie, 
    verifySession, 
    logout
} from '../controllers/authController';
import { authenticateSession } from '../middleware/auth';

const router = express.Router();

// Public routes (no auth required)
router.post('/signup', signup);
router.post('/login', login);
router.post('/session', createSessionCookie);

// Protected routes (auth required)
// router.get('/verify-session', authenticateSession, verifySession);
router.post('/logout', authenticateSession, logout);

export default router; 