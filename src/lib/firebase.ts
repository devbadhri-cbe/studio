'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'glycemic-guardian-6uxyg',
  appId: '1:1023747133263:web:fc7ad4f2a467dad6c9ff3a',
  storageBucket: 'glycemic-guardian-6uxyg.firebasestorage.app',
  apiKey: 'AIzaSyDRROv81qKWJOF1DlsskWYTzWcyYOXvnl4',
  authDomain: 'glycemic-guardian-6uxyg.firebaseapp.com',
  messagingSenderId: '1023747133263',
};

// This function ensures that we initialize the app only once.
const getAppInstance = (): FirebaseApp => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

let auth: Auth;
const getAuthInstance = (): Auth => {
  if (!auth) {
    auth = getAuth(getAppInstance());
  }
  return auth;
}

let db: Firestore;
const getDbInstance = (): Firestore => {
  if (!db) {
    db = getFirestore(getAppInstance());
  }
  return db;
}


export { getAppInstance, getAuthInstance, getDbInstance };