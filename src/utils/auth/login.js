import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";

const loginUserWithNIK = async (nik, password) => {
    try {

      const q = query(collection(db, 'registeredUsers'), where('nik', '==', nik));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        throw new Error('NIK tidak ditemukan. Pastikan Anda sudah terdaftar.');
      }
  
      let email = null;
      querySnapshot.forEach((doc) => {
        email = doc.data().email; 
      });
  
      if (!email) {
        throw new Error('Tidak ada email terkait dengan NIK ini.');
      }
  
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      return { success: true, message: 'Login berhasil', user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

export { loginUserWithNIK };   