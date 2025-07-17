
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyClP8-lzLjPb7YoQ-r9bPolvlRWj6UdaI8",
  authDomain: "placeset-5ea25.firebaseapp.com",
  projectId: "placeset-5ea25",
  storageBucket: "placeset-5ea25.firebasestorage.app",
  messagingSenderId: "451834452215",
  appId: "1:451834452215:web:c6f54366eeee1742da9bf2",
  measurementId: "G-6RG0BNHT6E"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, auth, analytics };
