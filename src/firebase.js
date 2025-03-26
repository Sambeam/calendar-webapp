// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDWkxG--qeJ7X2xKl30ay4CUn912sFQ5CI",
  authDomain: "calendar-webapp-d74d6.firebaseapp.com",
  databaseURL: "https://calendar-webapp-d74d6-default-rtdb.firebaseio.com",
  projectId: "calendar-webapp-d74d6",
  storageBucket: "calendar-webapp-d74d6.firebasestorage.app",
  messagingSenderId: "183683381016",
  appId: "1:183683381016:web:a60336fcd79b20d2c9106d",
  measurementId: "G-ZSREZ3C6FC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
