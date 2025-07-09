import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFSTym4i--Cb1S7CtbZumYR7MVf78coAc",
  authDomain: "rideregister.firebaseapp.com",
  projectId: "rideregister",
  storageBucket: "rideregister.appspot.com",
  messagingSenderId: "922153227281",
  appId: "1:922153227281:web:9faca0ed2bc37025750db0"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
