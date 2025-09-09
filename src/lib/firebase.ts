
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "glycemic-guardian-6uxyg",
  "appId": "1:1023747133263:web:fc7ad4f2a467dad6c9ff3a",
  "storageBucket": "glycemic-guardian-6uxyg.appspot.com",
  "apiKey": "AIzaSyDRROv81qKWJOF1DlsskWYTzWcyYOXvnl4",
  "authDomain": "glycemic-guardian-6uxyg.firebaseapp.com",
  "messagingSenderId": "1023747133263"
};

function getFirebaseApp(): FirebaseApp {
    if (getApps().length === 0) {
        return initializeApp(firebaseConfig);
    }
    return getApp();
}

export function getFirebaseAuth(): Auth {
    return getAuth(getFirebaseApp());
}

export function getFirebaseDb(): Firestore {
    return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage(): FirebaseStorage {
    return getStorage(getFirebaseApp());
}

// For direct use in client-side components that are guaranteed to run after initialization
export const app = getFirebaseApp();
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();
export const storage = getFirebaseStorage();
