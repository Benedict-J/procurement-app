import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Fungsi sign in
export const SignIn = async (nik, password) => {
    try {
        const usersRef = collection(db, 'registeredUsers');
        const q = query(usersRef, where("nik", "==", nik));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("NIK tidak ditemukan.");
        }

        let email = null;
        querySnapshot.forEach((doc) => {
            email = doc.data().email;
        });

        if (!email) {
            throw new Error("Email tidak ditemukan untuk NIK tersebut.");
        }

        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};


// Fungsi sign up
export const SignUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(FirebaseAuth, email, password);
        return userCredential;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    }
};

// Fungsi sign out
export const SignOut = async () => {
    try {
        await signOut(FirebaseAuth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error; 
    }
};
