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
  loading: boolean;
}

// Buat Context untuk user
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider untuk UserContext
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<any>(null); 
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
              const profile = userData.profile[0];
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

  return (
    <UserContext.Provider value={{ userProfile, loading }}>
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