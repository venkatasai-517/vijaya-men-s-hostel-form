// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/database"; // Import the database module
import { getAuth } from "firebase/auth/cordova";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbkWAxTWNTDHDfVqBbXOW0_8UtbhGAgzE",
  authDomain: "hostel-aab47.firebaseapp.com",
  projectId: "hostel-aab47",
  storageBucket: "hostel-aab47.appspot.com",
  messagingSenderId: "183580222805",
  appId: "1:183580222805:web:bbba1193174606891afbdc",
  measurementId: "G-Y87BHYEC41",
};

// Initialize Firebase
var firebaseDB = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore;
export const imgDB = getStorage(firebaseDB);
export const auth = getAuth();
export { db };

// Export the database reference for use in other parts of your application
export default firebaseDB.database().ref();
