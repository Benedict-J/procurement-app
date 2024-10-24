import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore"; // Firebase Firestore
import { auth, db } from "@/firebase/firebase";  // Konfigurasi Firebase

// Definisikan tipe untuk profil pengguna
interface Profile {
  email: string;
  entity: string;
  role: string;
}

// Definisikan tipe untuk user profile
interface UserProfile {
  email: string;
  entity: string;
  role: string;
  profile: Profile[]; // Menambahkan array profile
}

interface UserContextType {
  userProfile: UserProfile | null;
  selectedProfileIndex: number | null;
  loading: boolean;
  setSelectedProfile: (index: number) => void;
}

// Buat Context untuk user
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider untuk UserContext
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener untuk autentikasi Firebase
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("User is logged in:", user.email);
        setUser(user);  // Simpan user dari auth
        try {
          console.log("Fetching Firestore data for UID:", user.uid);
          const docRef = doc(db, "registeredUsers", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("User data from Firestore:", userData); // Debug data dari Firestore

            const selectedProfileIndex = userData.selectedProfileIndex || 0;

            // Validasi apakah `profile` ada dan memiliki struktur yang benar
            if (!Array.isArray(userData.profile) || userData.profile.length === 0) {
              throw new Error("Invalid profile structure");
            }

            // Pastikan selectedProfileIndex valid
            if (selectedProfileIndex >= 0 && selectedProfileIndex < userData.profile.length) {
              const selectedProfile = userData.profile[selectedProfileIndex];

              setUserProfile({
                email: selectedProfile.email,
                entity: selectedProfile.entity,
                role: selectedProfile.role,
                profile: userData.profile,
              });
              setSelectedProfileIndex(selectedProfileIndex);
            } else {
              console.error("Invalid selectedProfileIndex:", selectedProfileIndex);
            }
          } else {
            console.log("No such document in Firestore!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.log("No user logged in.");
        setUser(null);
        setUserProfile(null);  // Reset userProfile jika tidak ada user yang login
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setSelectedProfile = (index: number) => {
    if (user) {
      const docRef = doc(db, "registeredUsers", user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();

          // Validasi apakah index valid sebelum akses data
          if (Array.isArray(userData.profile) && userData.profile[index]) {
            const profile = userData.profile[index];
            setSelectedProfileIndex(index); // Simpan index yang dipilih
            setUserProfile((prevState) => ({
              ...prevState!,
              email: profile.email,
              entity: profile.entity,
              role: profile.role,
            }));
          } else {
            console.error("Invalid index or profile data is missing");
          }
        }
      });
    }
  };

  return (
    <UserContext.Provider value={{ userProfile, selectedProfileIndex, loading, setSelectedProfile }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook untuk menggunakan context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
