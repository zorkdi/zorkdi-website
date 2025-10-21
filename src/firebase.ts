import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// NAYA: Storage ko import kiya
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAupjgdRMuM30xUrkTp_uuGX1cc1EJu3MU",
  authDomain: "zorkdi-website.firebaseapp.com",
  projectId: "zorkdi-website",
  storageBucket: "zorkdi-website.firebasestorage.app",
  messagingSenderId: "278260706435",
  appId: "1:278260706435:web:7628a0af8974690a073fb6",
  measurementId: "G-SK4WKTSJVZ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // NAYA: Storage ko taiyaar karke export kiya