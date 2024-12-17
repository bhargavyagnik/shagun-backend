import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase';


export const authenticateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const cookie = req.headers.cookie;

    if (!cookie) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const sessionCookieraw = cookie.split(';').find(pair => pair.startsWith('session='));
    const sessionCookie = sessionCookieraw.split('=')[1];
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