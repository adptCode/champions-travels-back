// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA01kEYF4SLOQYHCY29Xq_tTkhPzZB1KYQ",
  authDomain: "western-glow-443611-a7.firebaseapp.com",
  projectId: "western-glow-443611-a7",
  storageBucket: "western-glow-443611-a7.firebasestorage.app",
  messagingSenderId: "612159271873",
  appId: "1:612159271873:web:5eed9e8bf3dcc1d3bab540",
  measurementId: "G-7QT9JKKN1B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);