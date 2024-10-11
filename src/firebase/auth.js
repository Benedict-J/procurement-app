import { auth, db } from './firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    confirmPasswordReset
} from 'firebase/auth';
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    }
};

// Fungsi sign out
export const SignOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

// Fungsi reset password
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log("Reset password email sent.");
    } catch (error) {
        console.error("Error sending reset password email:", error);
        throw error;
    }
};

// Fungsi konfirmasi reset password
export const resetPasswordConfirm = async (oobCode, newPassword) => {
    if (!auth) {
        throw new Error("Firebase auth not initialized");
    }

    try {
        await confirmPasswordReset(auth, oobCode, newPassword);
        console.log("Password has been reset successfully.");
    } catch (error) {
        console.error("Error resetting password:", error);
        throw error;
    }
};
