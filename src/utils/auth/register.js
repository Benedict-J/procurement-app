import { auth } from '@/firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '@/firebase/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';

const registerUserWithNik = async (nik) => {
  try {
    // Ambil data dari Firestore berdasarkan NIK
    const preRegisteredDocRef = doc(db, 'preRegisteredUsers', nik);
    const preRegisteredDoc = await getDoc(preRegisteredDocRef);

    if (!preRegisteredDoc.exists()) {
      throw new Error('NIK tidak ditemukan di preRegisteredUsers');
    }

    const userData = preRegisteredDoc.data(); // Dapatkan data user
    const { namaLengkap, divisi, role } = userData;

    if (role !== 'Staff' && role !== 'Head') {
      throw new Error('Hanya Staff dan Head yang dapat melakukan register');
    }

    // Kembalikan data pengguna di dalam `userData` jika sukses
    return { success: true, userData: { namaLengkap, divisi, role } };
  } catch (error) {
    // Kembalikan error jika terjadi masalah
    return { success: false, message: error.message };
  }
};

const registerUser = async (nik, namaLengkap, divisi, role, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await addDoc(collection(db, 'registeredUsers'), {
      uid: user.uid,
      nik,
      namaLengkap,
      divisi,
      role,
      email,
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export { registerUserWithNik, registerUser };