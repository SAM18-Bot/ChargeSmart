// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "chargesmart-4tzxm",
  appId: "1:133398203773:web:6c8be7ca8b4dd74f7a5014",
  storageBucket: "chargesmart-4tzxm.firebasestorage.app",
  apiKey: "AIzaSyBHy5nnYUcommRXT9QRMU8RcellfEvWN8I",
  authDomain: "chargesmart-4tzxm.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "133398203773"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
