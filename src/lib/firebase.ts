
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "health-guardian-l15n9",
  "appId": "1:1026685254929:web:96d70d9a657f2c73333333",
  "storageBucket": "health-guardian-l15n9.appspot.com",
  "apiKey": "AIzaSyA5k9x8r7Y6Z5c4b3a2d1e0f9g8h7i6j5",
  "authDomain": "health-guardian-l15n9.firebaseapp.com",
  "messagingSenderId": "1026685254929"
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
