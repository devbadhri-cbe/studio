
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
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

// Singleton pattern to initialize Firebase only once.
function getFirebaseInstances() {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

  }
  return { app, auth, db, storage };
}


export function getFirebaseApp(): FirebaseApp {
    return getFirebaseInstances().app;
}

export function getFirebaseAuth(): Auth {
    return getFirebaseInstances().auth;
}

export function getFirebaseDb(): Firestore {
    return getFirebaseInstances().db;
}

export function getFirebaseStorage(): FirebaseStorage {
    return getFirebaseInstances().storage;
}

// For direct use in client-side components that are guaranteed to run after initialization
// Note: Direct exports are discouraged in favor of the getter functions to ensure initialization.
const getDirectExports = () => {
    const instances = getFirebaseInstances();
    return {
        app: instances.app,
        auth: instances.auth,
        db: instances.db,
        storage: instances.storage
    };
}

export { getDirectExports as getFirebaseInstances };
