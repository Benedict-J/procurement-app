// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBauzeTL2K73CdnxKKLc_vNA60eY6qFxSY",
  authDomain: "procurement-app-d4fdc.firebaseapp.com",
  projectId: "procurement-app-d4fdc",
  storageBucket: "procurement-app-d4fdc.appspot.com",
  messagingSenderId: "599120600800",
  appId: "1:599120600800:web:351bea4cb5f4290588fa85",
  measurementId: "G-Y0CHKDMP1M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);