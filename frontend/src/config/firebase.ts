import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCTt_z-IIgxDfTbCBn4rnN_kgK8-4SS14w",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aescion-job-portal.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aescion-job-portal",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aescion-job-portal.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1084293151023",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1084293151023:web:8d212abb0c82861c99c9da",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GPM2XQEYJV",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics conditionally (only in browser environments where supported)
export const initAnalytics = async () => {
  if (typeof window !== "undefined" && (await isSupported())) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
