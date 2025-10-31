// context/AuthContext.tsx

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase'; // Hamari firebase.ts file se
import { doc, onSnapshot } from 'firebase/firestore'; // FIX: getDoc removed

// NAYA: User data ka type define kiya, jismein photoURL aur naye fields bhi hain
interface UserProfile {
  fullName: string;
  email: string;
  photoURL: string;
  // FIX: Added missing fields to resolve TypeScript error
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
                // FIX: Setting default values for mobile and country
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
        setLoading(false);
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

  return (
    <AuthContext.Provider value={value}>
      {/* Auth loading ke dauran children ko render hone se roko */}
      {!loading && children} 
      {loading && <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--color-neon-green)' }}>Loading application...</div>}
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