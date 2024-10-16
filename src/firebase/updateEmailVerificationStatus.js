import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from '@/firebase/firebase';

export const updateEmailVerificationStatus = async (uid) => {
  try {
    const usersRef = collection(db, 'registeredUsers');
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (doc) => {
        const docRef = doc.ref;
        await updateDoc(docRef, { isEmailVerified: true });
      });
    }
  } catch (error) {
    console.error("Error updating verification status: ", error);
  }
};