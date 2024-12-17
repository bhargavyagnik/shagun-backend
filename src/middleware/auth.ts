import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase';

interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    // Add other Firebase user properties you need
  };
}

export const authenticateSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionCookie = req.cookies.session || '';
    
    if (!sessionCookie) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify the session cookie and check if it's revoked
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Add user data to request object
    req.user = {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      // Add other needed user data
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication required' });
  }
}; 