import { auth } from '@/firebase/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, applyActionCode } from 'firebase/auth';
import { db } from '@/firebase/firebase';
import { doc, query, where, getDocs, getDoc, setDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';

const registerUserWithNik = async (nik) => {
  try {
    const q = query(collection(db, 'registeredUsers'), where('nik', '==', nik));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error('NIK already registered!');
    }

    const preRegisteredDocRef = doc(db, 'preRegisteredUsers', nik);
    const preRegisteredDoc = await getDoc(preRegisteredDocRef);

    if (!preRegisteredDoc.exists()) {
      throw new Error('NIK not registered! Please Contact Super Admin');
    }

    const userData = preRegisteredDoc.data(); 
    const { namaLengkap, divisi} = userData;

    // if (role !== 'Staff' && role !== 'Head' && role !== "Finance Lead") {
    //   throw new Error('Only Staff and Heads can register');
    // }

    return { success: true, userData: { namaLengkap, divisi} };
  } catch (error) {
    // Kembalikan error jika terjadi masalah
    return { success: false, message: error.message };
  }
};

const registerUser = async (nik, namaLengkap, divisi, profiles, password) => {

  const actionCodeSettings = {
    url: 'http://localhost:3000/auth/login',
    handleCodeInApp: false,
  };

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, profiles[0].email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'registeredUsers', user.uid), {
      uid: user.uid,
      nik: nik,
      namaLengkap: namaLengkap,
      divisi: divisi,
      profile: profiles,
      isEmailVerified: false
    });

    await sendEmailVerification(user, actionCodeSettings);
    return { success: true, message: "Registration success, Email verification has been sent" };
  } catch (error) {
    console.error("Firebase error: ", error);
    return { success: false, message: error.message };
  }
}


export { registerUserWithNik, registerUser};