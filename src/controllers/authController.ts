import { Request, Response } from 'express';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

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
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
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