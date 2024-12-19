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
    const cookie = req.headers.cookie;
    const sessionCookieraw = cookie.split(';').find(pair => pair.startsWith('session='));
    const sessionCookie = sessionCookieraw.split('=')[1];
    
    // Clear the session cookie
    res.clearCookie('session');
    
    // If there was a session, revoke the refresh tokens
    if (sessionCookie) {
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        await adminAuth.revokeRefreshTokens(decodedClaims.sub);
      } catch (error) {
        // Continue with logout even if token verification fails
        console.error('Error revoking refresh tokens:', error);
      }
    }
    res.status(401).json({ message: 'Authentication required' });
  }
}; 