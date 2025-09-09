
'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

// Sign up a new user
export const signup = async (email: string, password: string): Promise<User> => {
  try {
    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing up:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email address is already in use.');
    }
    throw new Error('An unexpected error occurred during sign up.');
  }
};

// Log in an existing user
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const auth = getFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error logging in:', error);
     if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid credentials. Please check your email and password.');
    }
    throw new Error('An unexpected error occurred during login.');
  }
};

// Log out the current user
export const logout = async (): Promise<void> => {
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Listen for auth state changes
export const listenForAuthChanges = (callback: (user: User | null) => void) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
};

export const auth = getFirebaseAuth();
