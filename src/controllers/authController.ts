import { Request, Response } from 'express';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { adminAuth } from '../config/firebase';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Create user in Firebase
    const firebaseUser = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await sendEmailVerification(auth.currentUser).catch((err) =>
      console.log(err)
    );

    // Update Firebase user profile to include name
    await updateProfile(auth.currentUser, { displayName: name }).catch(
      (err) => console.log(err)
    );

    // Get Firebase ID token
    const token = await firebaseUser.user.getIdToken();

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        uid: firebaseUser.user.uid,
        name: firebaseUser.user.displayName,
        email: firebaseUser.user.email,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/email-already-in-use') {
      return res.status(400).json({ 
        message: 'Email already in use',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating user',
      error: error.message 
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Sign in with Firebase
    const firebaseUser = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Get Firebase ID token
    const token = await firebaseUser.user.getIdToken();
    res.json({
      message: 'Login successful',
      token,
      user: {
        uid: firebaseUser.user.uid,
        name: firebaseUser.user.displayName,
        email: firebaseUser.user.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return res.status(401).json({ 
        message: 'Invalid email or password',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Error logging in',
      error: error.message 
    });
  }
};


// Create session cookie
export const createSessionCookie = async (req: Request, res: Response) => {
  try {
    const idToken = req.body.idToken?.toString();
    
    // Validate ID token
    if (!idToken) {
      return res.status(401).json({ message: 'No ID token provided' });
    }

    // Set session expiration to 10 days
    const expiresIn = 60 * 60 * 24 * 10 * 1000;

    // Create the session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    // Set cookie options
    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
      sameSite: 'strict' as const
    };

    res.cookie('session', sessionCookie, options);
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(401).json({ message: 'UNAUTHORIZED REQUEST!' });
  }
};

// Logout and clear session
export const logout = async (req: Request, res: Response) => {
  try {
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
    
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
};