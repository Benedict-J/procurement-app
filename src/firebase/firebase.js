// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBauzeTL2K73CdnxKKLc_vNA60eY6qFxSY",
  authDomain: "procurement-app-d4fdc.firebaseapp.com",
  projectId: "procurement-app-d4fdc",
  storageBucket: "procurement-app-d4fdc.appspot.com",
  messagingSenderId: "599120600800",
  appId: "1:599120600800:web:351bea4cb5f4290588fa85",
  measurementId: "G-Y0CHKDMP1M"
};

// Inisialisasi
let app;
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps();
  }
}

// Ekspor instance Firebase jika sudah diinisialisasi
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export { auth, db };