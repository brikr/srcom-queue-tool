// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2LiDWICVv272DAurPiV3d8b4r9jziW8E",
  authDomain: "srcom-queue-tool.firebaseapp.com",
  projectId: "srcom-queue-tool",
  storageBucket: "srcom-queue-tool.appspot.com",
  messagingSenderId: "131464125275",
  appId: "1:131464125275:web:ba2c50db8698fd10fe587e",
  measurementId: "G-F67NC9458E",
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const analytics = getAnalytics(firebaseApp);
export const auth = getAuth(firebaseApp);
