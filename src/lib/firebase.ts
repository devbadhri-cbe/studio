
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "glycemic-guardian-6uxyg",
  "appId": "1:1023747133263:web:fc7ad4f2a467dad6c9ff3a",
  "storageBucket": "glycemic-guardian-6uxyg.appspot.com",
  "apiKey": "AIzaSyDRROv81qKWJOF1DlsskWYTzWcyYOXvnl4",
  "authDomain": "glycemic-guardian-6uxyg.firebaseapp.com",
  "messagingSenderId": "1023747133263"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let persistenceEnabled = false;

function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  if (typeof window !== 'undefined' && !persistenceEnabled) {
    enableIndexedDbPersistence(db)
      .then(() => {
        persistenceEnabled = true;
        console.log("Firestore offline persistence enabled");
      })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn("Firestore persistence failed: Multiple tabs open?");
        } else if (err.code === 'unimplemented') {
          console.log("Firestore persistence not available in this browser.");
        }
      });
  }
}

// Initialize on first import
initializeFirebase();


export function getFirebaseApp(): FirebaseApp {
    if (!app) initializeFirebase();
    return app;
}

export function getFirebaseAuth(): Auth {
    if (!auth) initializeFirebase();
    return auth;
}

export function getFirebaseDb(): Firestore {
    if (!db) initializeFirebase();
    return db;
}

export function getFirebaseStorage(): FirebaseStorage {
    if (!storage) initializeFirebase();
    return storage;
}

// For direct use in client-side components that are guaranteed to run after initialization
export { app, auth, db, storage };
