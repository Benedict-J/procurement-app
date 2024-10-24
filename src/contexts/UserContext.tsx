import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore"; // Firebase Firestore
import { auth, db } from "@/firebase/firebase";  // Konfigurasi Firebase
import { useRouter } from "next/router"; // Router

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
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener untuk autentikasi Firebase
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        try {
          const docRef = doc(db, "registeredUsers", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            const selectedProfileIndex = userData.selectedProfileIndex || 0;

            if (Array.isArray(userData.profile) && userData.profile.length > 0) {
              const selectedProfile = userData.profile[selectedProfileIndex];
              setUserProfile({
                email: selectedProfile.email,
                entity: selectedProfile.entity,
                role: selectedProfile.role,
                profile: userData.profile,
              });
              setSelectedProfileIndex(selectedProfileIndex);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Redirect berdasarkan peran pengguna hanya jika tidak sedang berada di halaman login
    if (userProfile && selectedProfileIndex !== null) {
      // Jika pengguna berada di halaman login atau halaman lain yang tidak memerlukan redirect, jangan lakukan redirect
      if (router.pathname === '/auth/login') {
        return;
      }
  
      // Redirect berdasarkan peran pengguna
      switch (userProfile.profile[selectedProfileIndex].role) {
        case "Requester":
          if (router.pathname !== "/requester/request-form") {
            router.push("/requester/request-form");
          }
          break;
        case "Checker":
        case "Approval":
        case "Releaser":
          if (router.pathname !== "/requester/incoming-request") {
            router.push("/requester/incoming-request");
          }
          break;
        default:
          router.push("/auth/login");
      }
    }
  }, [userProfile, selectedProfileIndex, router.pathname]);  

  const setSelectedProfile = (index: number) => {
    if (user) {
      const docRef = doc(db, "registeredUsers", user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (Array.isArray(userData.profile) && userData.profile[index]) {
            const profile = userData.profile[index];
            setSelectedProfileIndex(index);
            setUserProfile((prevState) => ({
              ...prevState!,
              email: profile.email,
              entity: profile.entity,
              role: profile.role,
            }));
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
