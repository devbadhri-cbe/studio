// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "glycemic-guardian-6uxyg",
  "appId": "1:1023747133263:web:fc7ad4f2a467dad6c9ff3a",
  "storageBucket": "glycemic-guardian-6uxyg.appspot.com",
  "apiKey": "AIzaSyDRROv81qKWJOF1DlsskWYTzWcyYOXvnl4",
  "authDomain": "glycemic-guardian-6uxyg.firebaseapp.com",
  "messagingSenderId": "1023747133263"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
