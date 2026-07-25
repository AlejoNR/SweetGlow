// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCz2rscZm8YJYfCKrPhRjWzcvETA2ZzGIc",
  authDomain: "sweetglow-adaaa.firebaseapp.com",
  projectId: "sweetglow-adaaa",
  storageBucket: "sweetglow-adaaa.firebasestorage.app",
  messagingSenderId: "849469956003",
  appId: "1:849469956003:web:b7f8a16ddd373912b04416",
  measurementId: "G-9NX9K7GX54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
export const db = getFirestore(app);
export const storage = getStorage(app);