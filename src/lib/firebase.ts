
'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This is a placeholder for your Firebase configuration.
// In a real application, you should use environment variables to store your config.
const firebaseConfig = {
  "projectId": "glycemic-guardian-6uxyg",
  "appId": "1:1023747133263:web:fc7ad4f2a467dad6c9ff3a",
  "storageBucket": "glycemic-guardian-6uxyg.firebasestorage.app",
  "apiKey": "AIzaSyDRROv81qKWJOF1DlsskWYTzWcyYOXvnl4",
  "authDomain": "glycemic-guardian-6uxyg.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1023747133263"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
