import { auth, db } from './firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    confirmPasswordReset
} from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Fungsi sign in
export const SignIn = async (nik, password) => {
    try {
        console.log("Checking NIK:", nik);
        const usersRef = collection(db, 'registeredUsers');
        const q = query(usersRef, where("nik", "==", nik.trim()));
        const querySnapshot = await getDocs(q);

        console.log("Number of documents found:", querySnapshot.size);
        if (querySnapshot.empty) {
            throw new Error("Login failed! Please check your NIK or password again.");
        }

        let email = null;
        let isEmailVerifiedInDB = false;

        querySnapshot.forEach((doc) => {
            const profile = doc.data().profile;
            email = profile[0].email;
            isEmailVerifiedInDB = doc.data().isEmailVerified;
            console.log("Email associated with NIK:", email);
            console.log("isEmailVerified in DB:", isEmailVerifiedInDB);
        });

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await user.reload();

        if (!user.emailVerified || !isEmailVerifiedInDB) {
            await sendEmailVerification(user);
            throw new Error("Email not verified. A verification email has been sent to your inbox.");
        }

    } catch (error) {
        console.error("Error signing in:", error);

        if (error.message.includes("Email not verified")) {
            throw error;
        } else {
            throw new Error("Login failed! Please check your NIK or password again.");
        }
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
    const actionCodeSettings = {
        url: 'http://localhost:3000/auth/forgot-password/reset-password',
        handleCodeInApp: true,
    };

    try {
        const usersRef = collection(db, 'registeredUsers');
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Email not registered");
        }

        await sendPasswordResetEmail(auth, email, actionCodeSettings);
    } catch (error) {
        console.error("Error sending reset email:", error);
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
