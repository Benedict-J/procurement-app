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
// Fungsi sign in
// SignIn.js
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
        let selectedProfileIndex = 0;

        // Loop through the results to find the first match (assuming NIK is unique)
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            email = userData.profile[0]?.email; // Ambil email dari profile pertama
            isEmailVerifiedInDB = userData.isEmailVerified || false;
            selectedProfileIndex = userData.selectedProfileIndex || 0;
            console.log("Email associated with NIK:", email);
            console.log("isEmailVerified in DB:", isEmailVerifiedInDB);
        });

        if (!email) {
            throw new Error("No email associated with the provided NIK.");
        }

        // Lanjutkan autentikasi dengan email yang ditemukan
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user) {
            throw new Error("Login failed! Unable to retrieve user data.");
        }

        // Validasi apakah email sudah diverifikasi
        await user.reload();
        if (!user.emailVerified || !isEmailVerifiedInDB) {
            await sendEmailVerification(user);
            throw new Error("Email not verified. A verification email has been sent to your inbox.");
        }

        return { user, email, selectedProfileIndex };
    } catch (error) {
        console.error("Error signing in:", error);
        throw new Error("Login failed! Please check your NIK or password again.");
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
        const querySnapshot = await getDocs(usersRef);  // Ambil semua dokumen

        let userFound = false;
        let userEmail = null;

        // Iterasi setiap dokumen
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const profiles = userData.profile;  // Ambil array profile

            // Cek apakah salah satu profile memiliki email yang sesuai
            const matchedProfile = profiles.find(profile => profile.email === email);

            if (matchedProfile) {
                userFound = true;
                userEmail = matchedProfile.email;  // Ambil email yang sesuai
                console.log("User found with email:", userEmail);
            }
        });

        if (!userFound || !userEmail) {
            throw new Error("Email not registered");
        }

        // Kirim email reset password
        await sendPasswordResetEmail(auth, userEmail, actionCodeSettings);
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
