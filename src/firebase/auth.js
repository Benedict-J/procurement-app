import { auth, db } from './firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    confirmPasswordReset,
} from 'firebase/auth';
import { doc, query, where, getDocs, getDoc, setDoc, collection, updateDoc } from 'firebase/firestore';

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

        // Loop melalui dokumen yang ditemukan untuk memeriksa email di setiap profil
        querySnapshot.forEach((doc) => {
            const userData = doc.data();

            // Periksa apakah profile ada dan merupakan array
            if (Array.isArray(userData.profile)) {
                userData.profile.forEach((profile, index) => {
                    if (profile.email) {
                        // Simpan email pertama yang ditemukan
                        if (!email) {
                            email = profile.email;
                            selectedProfileIndex = index;
                        }
                        console.log(`Email found in profile ${index}:`, profile.email);
                    }
                });
            }

            isEmailVerifiedInDB = userData.isEmailVerified || false;
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

        // Reload user untuk memastikan status email terkini
        await user.reload();

        // Validasi apakah email sudah diverifikasi
        if (!user.emailVerified || !isEmailVerifiedInDB) {
            await sendEmailVerification(user);
            throw new Error("Email not verified. A verification email has been sent to your inbox.");
        }

        console.log("Login successful for:", user.email);
        return { success: true, user, email, selectedProfileIndex };

    } catch (error) {
        console.error("Error signing in:", error.message || error);
        throw new Error(error.message || "Login failed! Please check your NIK or password again.");
    }
};

export const registerUserWithNik = async (nik) => {
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
  
export const registerUser = async (nik, namaLengkap, divisi, profile, selectedProfileIndex, password) => {
  
    const actionCodeSettings = {
      url: 'https://procurement-web-app.vercel.app/auth/login',
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
// Fungsi reset password
export const resetPassword = async (email) => {
    const actionCodeSettings = {
        url: 'https://procurement-web-app.vercel.app/auth/forgot-password/reset-password',
        handleCodeInApp: true,
    };

    try {
        const usersRef = collection(db, 'registeredUsers');
        const querySnapshot = await getDocs(usersRef);  // Ambil semua dokumen

        let userFound = false;

        // Iterasi setiap dokumen untuk mencari email di semua profil
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const profiles = userData.profile;  // Ambil array profile

            // Cek apakah salah satu profil memiliki email yang sesuai (dengan perbandingan case-insensitive)
            const matchedProfile = profiles.find(profile => profile.email.toLowerCase() === email.toLowerCase());

            if (matchedProfile) {
                userFound = true;
                console.log("User found with email:", matchedProfile.email);
            }
        });

        if (!userFound) {
            throw new Error("Email not registered");
        }

        // Kirim email reset password
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
