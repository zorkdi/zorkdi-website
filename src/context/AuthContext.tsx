// context/AuthContext.tsx

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase'; // Hamari firebase.ts file se
import { doc, getDoc, onSnapshot } from 'firebase/firestore'; // NAYA: Firestore se functions import kiye

// NAYA: User data ka type define kiya, jismein photoURL bhi hai
interface UserProfile {
  fullName: string;
  email: string;
  photoURL: string;
  // Yahan aap future mein aur bhi cheezein add kar sakte hain
}

// Context ke type ko update kiya
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null; // NAYA: userProfile ko add kiya
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // NAYA
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      // NAYA: Agar user logged in hai, to uska profile data lao
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // onSnapshot ka use kar rahe hain taaki data real-time mein update ho
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            setUserProfile(null); // Agar profile nahi hai to null set karo
          }
          setLoading(false);
        });
        
        // Cleanup function for profile listener
        return () => unsubscribeProfile();

      } else {
        // Agar user logged out hai, to profile data saaf kar do
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Cleanup function for auth listener
    return () => unsubscribeAuth();
  }, []);

  const value = {
    currentUser,
    userProfile, // NAYA
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};