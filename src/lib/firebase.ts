
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// This is a placeholder for your Firebase configuration.
// In a real application, you should use environment variables to store your config.
const firebaseConfig = {
  "projectId": "glycemic-guardian-6uxyg",
  "appId": "1:1023747133263:web:fc7ad4f2a467dad6c9ff3a",
  "storageBucket": "glycemic-guardian-6uxyg.appspot.com",
  "apiKey": "AIzaSyDRROv81qKWJOF1DlsskWYTzWcyYOXvnl4",
  "authDomain": "glycemic-guardian-6uxyg.firebaseapp.com",
  "messagingSenderId": "1023747133263"
};


const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
