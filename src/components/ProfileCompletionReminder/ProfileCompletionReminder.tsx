// src/components/ProfileCompletionReminder/ProfileCompletionReminder.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaUserEdit } from 'react-icons/fa'; // Icon import
import styles from './ProfileCompletionReminder.module.css';

export default function ProfileCompletionReminder() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. Fetch User Data
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            
            // 2. Check for Missing Fields
            // Aap aur fields add kar sakte hain agar chahiye
            const isProfileIncomplete = 
              !data.fullName || 
              !data.email || 
              !data.phone || 
              !data.photoURL ||
              data.fullName === 'User'; // Default name check

            if (isProfileIncomplete) {
              checkRemindLaterTime();
            }
          }
        } catch (error) {
          console.error("Error checking profile status:", error);
        }
      } else {
        // Agar user logged out hai, toh reminder hide karo
        setIsVisible(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkRemindLaterTime = () => {
    // 3. Check LocalStorage for 7-Day Logic
    const lastReminded = localStorage.getItem('profileReminderTimestamp');
    
    if (lastReminded) {
      const lastDate = parseInt(lastReminded, 10);
      const now = Date.now();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      // Agar 7 din beet chuke hain, toh dikhao
      if (now - lastDate > sevenDaysInMs) {
        setIsVisible(true);
      }
    } else {
      // Agar pehli baar hai (kabhi store nahi kiya), toh dikhao
      setIsVisible(true);
    }
  };

  const handleCompleteNow = () => {
    // Redirect to Profile Page
    router.push('/profile');
    setIsVisible(false);
  };

  const handleRemindLater = () => {
    // 4. Store Current Time in LocalStorage
    // Isse agle 7 din tak popup nahi aayega
    localStorage.setItem('profileReminderTimestamp', Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <FaUserEdit />
          </div>
          <div className={styles.textContent}>
            <h3>Complete Your Profile</h3>
            <p>
              Your profile is missing some details. Complete it now to get the best experience.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={handleCompleteNow} className={styles.completeBtn}>
            Complete Now
          </button>
          <button onClick={handleRemindLater} className={styles.laterBtn}>
            Remind Later
          </button>
        </div>
      </div>
    </div>
  );
}