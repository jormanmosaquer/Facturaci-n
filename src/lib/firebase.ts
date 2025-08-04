// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "efactura-simplificada-z68ak",
  "appId": "1:76708002452:web:e0de5401b2256a9e2d1281",
  "storageBucket": "efactura-simplificada-z68ak.firebasestorage.app",
  "apiKey": "AIzaSyAGJulCfq2LVh1ETmOauGxuIycV8xFBa0k",
  "authDomain": "efactura-simplificada-z68ak.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "76708002452"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
