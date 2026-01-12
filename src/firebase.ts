// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Replace this with your own Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyA1YbgrCbx3zOBY8u20yULB0X-ufGPu2YA",
  authDomain: "share-73952.firebaseapp.com",
  projectId: "share-73952",
  storageBucket: "share-73952.firebasestorage.app",
  messagingSenderId: "812658365452",
  appId: "1:812658365452:web:a1d58025a488f34e48ca29",
  measurementId: "G-Q4LJ62TTW3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
isSupported().then(yes => {
  if (yes) {
    getAnalytics(app);
  }
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
