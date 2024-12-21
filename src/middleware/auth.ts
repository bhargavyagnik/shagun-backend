import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
      };
    }
  }
}

export const authenticateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const startTime = performance.now();

  try {
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Token not found');
    }

    // Verify the session cookie and check if it's revoked
    const decodedClaims = await adminAuth.verifyIdToken(token);
    
    // Add user data to request object
    req.user = {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      // Add other needed user data
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Authentication required',
      error: error.message 
    });
  } finally{
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`Auth middleware took ${duration.toFixed(2)}ms to complete`);
  }
}; 