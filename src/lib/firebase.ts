// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration is automatically provided by App Hosting.
const firebaseConfig = {
  projectId: 'glycemic-guardian-6uxyg',
  appId: '1:1023747133263:web:fc7ad4f2a467dad6c9ff3a',
  storageBucket: 'glycemic-guardian-6uxyg.firebasestorage.app',
  apiKey: 'AIzaSyDRROv81qKWJOF1DlsskWYTzWcyYOXvnl4',
  authDomain: 'glycemic-guardian-6uxyg.firebaseapp.com',
  messagingSenderId: '1023747133263',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Initialize Firebase only once
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

export { db, auth, app };
