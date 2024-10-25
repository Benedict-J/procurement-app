import { auth } from '@/firebase/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, applyActionCode } from 'firebase/auth';
import { db } from '@/firebase/firebase';
import { doc, query, where, getDocs, getDoc, setDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';

const registerUserWithNik = async (nik) => {
  try {

    const registeredUsersRef = collection(db, 'registeredUsers');
    const qRegisteredUsers = query(registeredUsersRef, where('nik', '==', nik));
    const registeredUsersSnapshot = await getDocs(qRegisteredUsers);

    // Jika ditemukan dokumen dengan NIK tersebut, return error
    if (!registeredUsersSnapshot.empty) {
      throw new Error('NIK already registered');
    }

    const q = query(collection(db, 'preRegisteredUsers'), nik);
    const querySnapshot = await getDocs(q);

    console.log("NIK yang dikirim:", nik);

    if (querySnapshot.empty) {
      throw new Error('NIK not registered! Please Contact Super Admin');
    }
    
    const preRegisteredDocRef = doc(db, 'preRegisteredUsers', nik);
    const preRegisteredDoc = await getDoc(preRegisteredDocRef);

    // Ambil profil dari data yang ada di Firestore
    const userData = preRegisteredDoc.data(); 
    console.log("Data user ditemukan di Firestore:", userData);
    const profile = userData.profile || [];
    console.log("Data user ditemukan:", userData);

    return { success: true, userData: { namaLengkap: userData.namaLengkap, divisi: userData.divisi, profile} };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const registerUser = async (nik, namaLengkap, divisi, profile, selectedProfileIndex, password) => {

  const actionCodeSettings = {
    url: 'http://localhost:3000/auth/login',
    handleCodeInApp: false,
  };

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, profile[selectedProfileIndex].email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'registeredUsers', user.uid), {
      uid: user.uid,
      nik: nik,
      namaLengkap: namaLengkap,
      divisi: divisi,
      profile: profile,
      selectedProfileIndex: selectedProfileIndex,
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