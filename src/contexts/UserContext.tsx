/**
 * UserContext: Provides the user's authentication and profile data throughout the application.
 *
 * Interfaces:
 * - Profile: Defines the structure for each user profile with email, entity, and role.
 * - UserProfile: Extends user profile details with division, NIK, and multiple profiles.
 * - UserContextType: Defines the types and methods provided by the UserContext.
 *
 * Features:
 * - Tracks the logged-in user's data and selected profile index.
 * - Provides methods for handling profile switching and draft data loading.
 * - Redirects users based on their roles after login or profile change.
 *
 * Usage:
 * - Wrap the application with `<UserProvider>` to enable user context.
 * - Use the custom `useUserContext` hook to access context values and methods.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Firebase Firestore
import { auth, db } from "@/firebase/firebase";  // Firebase Config
import { useRouter } from "next/router"; // Router
import { Spin } from "antd";

// Definisikan tipe untuk profil pengguna
interface Profile {
  email: string;
  entity: string;
  role: string;
}

// Definisikan tipe untuk user profile
interface UserProfile {
  namaLengkap: string;
  divisi: string;
  email: string;
  entity: string;
  role: string;
  userId: string;
  profile: Profile[];
  nik: string; // Menambahkan array profile
}

interface UserContextType {
  user: any | null;
  userProfile: UserProfile | null;
  selectedProfileIndex: number | null;
  loading: boolean;
  isLoggingOut: boolean;
  isProfileChanging: boolean;
  setUserProfile: (profile: UserProfile | null) => void;
  setSelectedProfile: (index: number) => void;
  setIsLoggingOut: (loggingOut: boolean) => void;
  setIsProfileChanging: (profileChanging: boolean) => void;
  loadDraftData: () => Promise<void>;
}

// Buat Context untuk user
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider for UserContext
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileChanging, setIsProfileChanging] = useState(false);

  // Mapping of roles to default dashboard paths
  const defaultPathsForRoles: Record<string, string> = {
    "Requester": "/requester/request-form",
    "Checker": "/requester/incoming-request",
    "Approval": "/requester/incoming-request",
    "Releaser": "/requester/incoming-request",
    "Super Admin": "/requester/user-management", 
  };

  useEffect(() => {
    // Listener for Firebase Authentication
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      if (user) {
        setUser(user); // Set user data

        try {
          // Fetch user profile data from Firestore
          const docRef = doc(db, "registeredUsers", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            const selectedIndex = userData.selectedProfileIndex || 0;

            // Set user profile data to state
            if (Array.isArray(userData.profile) && userData.profile.length > 0) {
              const selectedProfile = userData.profile[selectedIndex];
              setUserProfile({
                namaLengkap: userData.namaLengkap,
                divisi: userData.divisi,
                email: selectedProfile.email,
                entity: selectedProfile.entity,
                role: selectedProfile.role,
                profile: userData.profile,
                userId: userData.uid,
                nik: userData.nik
              });
              setSelectedProfileIndex(selectedIndex);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null); // Reset user data
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  useEffect(() => {
    if (!loading && userProfile && selectedProfileIndex !== null) {
      const currentRole = userProfile.profile[selectedProfileIndex]?.role;
      const defaultPath = defaultPathsForRoles[currentRole];
  
      // Exception paths for redirect
      const nonRedirectPaths = [
        "/auth/login",
        "/auth/register",
        "/auth/register/confirm-register",
        "/auth/forgot-password",
        "/auth/forgot-password/reset-password",
        "/auth/email-verification",
        "/requester/history",
        "/requester/detail-request",
        "/requester/flow-steps",
        "/requester/edit-request",
        "/requester/user-management"
      ];
  
      if (nonRedirectPaths.includes(router.pathname)) {
        console.log("Path included in non-redirect paths. Exiting useEffect.");
        return;
      }
  
      // Redirect to default path if current path is different
      if (router.pathname !== defaultPath) {
        console.log("Redirecting to:", defaultPath);
        router.replace(defaultPath);
      }
    }
  }, [userProfile, selectedProfileIndex, loading, router.pathname]);

  const loadDraftData = async () => {
    if (!user || selectedProfileIndex === null) return;

    try {
      const draftDocRef = doc(db, "draftRequests", `${user.uid}_${selectedProfileIndex}`);
      const draftDoc = await getDoc(draftDocRef);

      if (draftDoc.exists()) {
        const draftData = draftDoc.data();
        // Use the draftData as needed, e.g., to populate a form
      }
    } catch (error) {
      console.error("Error loading draft data:", error);
    }
  };

  // Function to set the selected profile
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
              entity: profile.entity,
              role: profile.role,
              email: profile.email,
            }));

            // Redirect to the default path based on the new profile
            const defaultPath = defaultPathsForRoles[profile.role];
            if (router.pathname !== defaultPath) {
              router.replace(defaultPath);
            }
          }
        }
      });
    }
  };

  return (
    <UserContext.Provider value={{ user, userProfile, selectedProfileIndex, loading, setSelectedProfile, isLoggingOut,
      isProfileChanging, setUserProfile, setIsLoggingOut, setIsProfileChanging, loadDraftData,  }}>
      {loading ? (
       <div
       style={{
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
         height: "100vh",
         width: "100vw",
       }}
     >
       <Spin size="large" /> 
     </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
};

// Custom hook to use the context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};