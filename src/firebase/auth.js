import { FirebaseAuth } from './firebase'; // Pastikan path ini sesuai dengan struktur folder Anda
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Fungsi untuk melakukan sign in
export const SignIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(FirebaseAuth, email, password);
        return userCredential; // Mengembalikan informasi user
    } catch (error) {
        console.error("Error signing in:", error);
        throw error; // Melempar error untuk ditangani di tempat lain
    }
};

// Fungsi untuk melakukan sign up
export const SignUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(FirebaseAuth, email, password);
        return userCredential; // Mengembalikan informasi user
    } catch (error) {
        console.error("Error signing up:", error);
        throw error; // Melempar error untuk ditangani di tempat lain
    }
};

// Fungsi untuk melakukan sign out
export const SignOut = async () => {
    try {
        await signOut(FirebaseAuth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error; // Melempar error untuk ditangani di tempat lain
    }
};
