import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore"; // Firebase Firestore
import { auth, db } from "@/firebase/firebase";  // Konfigurasi Firebase

// Definisikan tipe untuk user profile
interface UserProfile {
  email: string;
  entity: string;
  role: string;
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
              const profileIndex = userData.selectedProfileIndex || {}; // Ambil index profil yang disimpan
              const profile = userData.profile.find((p: UserProfile) => p.email === profileIndex.email) || userData.profile[0]; // Pilih profil berdasarkan index
              setSelectedProfileIndex(profileIndex); // Simpan index profil yang dipilih
              setUserProfile({
                email: profile.email,
                entity: profile.entity,
                role: profile.role,
              });
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
          const profile = userData.profile[index]; // Dapatkan profil berdasarkan index
          setSelectedProfileIndex(index); // Simpan index yang dipilih
          setUserProfile({
            email: profile.email,
            entity: profile.entity,
            role: profile.role,
          });
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