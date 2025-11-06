// context/AuthContext.tsx

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase'; // Hamari firebase.ts file se
import { doc, onSnapshot } from 'firebase/firestore'; 
// FaSpinner import ko hata diya gaya hai taaki koi loading UI na dikhe.

// NAYA: User data ka type define kiya, jismein photoURL aur naye fields bhi hain
interface UserProfile {
  fullName: string;
  email: string;
  photoURL: string;
  mobile: string; 
  country: string;
}

// Context ke type ko update kiya
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // loading state ko true se shuru kiya, Firebase check hone tak
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      // Agar user logged in hai, to uska profile data lao
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // onSnapshot ka use kar rahe hain taaki data real-time mein update ho
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
                fullName: data.fullName || '',
                email: data.email || '',
                photoURL: data.photoURL || '',
                mobile: data.mobile || '',
                country: data.country || 'USA',
            } as UserProfile);
          } else {
            setUserProfile(null); 
          }
          setLoading(false); 
        });
        
        // Cleanup function for profile listener
        return () => unsubscribeProfile();

      } else {
        // Agar user logged out hai, to profile data saaf kar do
        setUserProfile(null);
        setLoading(false); // Auth check complete hone par loading false hoga
      }
    });

    // Cleanup function for auth listener
    return () => unsubscribeAuth();
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
  };

  // CRITICAL FIX: Hum hamesha children ko render karenge taaki Frontend pages bina kisi loading screen ke turant load ho saken.
  return (
    <AuthContext.Provider value={value}>
      {children}
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