import { auth } from '@/firebase/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { db } from '@/firebase/firebase';
import { doc, query, where, getDocs, getDoc, addDoc, collection } from 'firebase/firestore';
import { message } from 'antd';

const registerUserWithNik = async (nik) => {
  try {
    const q = query(collection(db, 'registeredUsers'), where('nik', '==', nik));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Jika ada dokumen yang ditemukan, berarti NIK sudah terdaftar
      throw new Error('NIK sudah terdaftar!');
    }

    // Ambil data dari Firestore berdasarkan NIK
    const preRegisteredDocRef = doc(db, 'preRegisteredUsers', nik);
    const preRegisteredDoc = await getDoc(preRegisteredDocRef);

    if (!preRegisteredDoc.exists()) {
      throw new Error('NIK tidak terdaftar! Silahkan Hubungi Super Admin');
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
      isEmailVerified: false,
    });

    await sendEmailVerification(user);
    return { success: true, message: "Registrasi berhasil, email verifikasi terkirim" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export { registerUserWithNik, registerUser };