// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration.
// It's safe to expose this, as security is handled by Firebase Security Rules.
const firebaseConfig = {
  projectId: 'glycemic-guardian-6uxyg',
  appId: '1:1023747133263:web:fc7ad4f2a467dad6c9ff3a',
  storageBucket: 'glycemic-guardian-6uxyg.firebasestorage.app',
  apiKey: 'AIzaSyDRROv81qKWJOF1DlsskWYTzWcyYOXvnl4',
  authDomain: 'glycemic-guardian-6uxyg.firebaseapp.com',
  messagingSenderId: '1023747133263',
};


// Initialize Firebase for SSR and client-side
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
