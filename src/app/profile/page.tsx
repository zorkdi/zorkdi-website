// app/profile/page.tsx

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './profile.module.css';

// NAYA: Firebase se zaroori functions import kiye
import { db, storage } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// User data ka type define kiya
interface UserData {
  fullName: string;
  mobile: string;
  country: string;
  state: string;
  photoURL: string; // Photo URL ke liye
}

const ProfilePage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData>({
    fullName: '',
    mobile: '',
    country: '',
    state: '',
    photoURL: '',
  });

  const [initialData, setInitialData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // NAYA: Image upload ke liye states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Data fetch karne ke liye
  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          setInitialData(data); // Shuruaati data ko save kiya
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // NAYA: Turant preview ke liye local URL banaya
      const previewUrl = URL.createObjectURL(file);
      setUserData(prev => ({ ...prev, photoURL: previewUrl }));
    }
  };

  // NAYA: Image upload ki poori logic update ki
  const handleImageUpload = async () => {
    if (!imageFile || !currentUser) return;
    setIsSaving(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `profile_pictures/${currentUser.uid}/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        console.error("Upload error:", error);
        setIsSaving(false);
        setUploadProgress(null);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { photoURL: downloadURL });

        // NAYA: Local state ko naye URL se update kiya
        setUserData(prev => ({ ...prev, photoURL: downloadURL }));
        setInitialData(prev => prev ? { ...prev, photoURL: downloadURL } : { ...userData, photoURL: downloadURL });
        setImageFile(null);
        setUploadProgress(null);
        setIsSaving(false);
        setSuccessMessage('Profile picture updated!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    );
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, userData, { merge: true });
      setInitialData(userData); // Save ke baad initial data update kiya
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setIsSaving(false);
  };
  
  // Check if data has changed
  const hasChanged = JSON.stringify(userData) !== JSON.stringify(initialData);

  if (authLoading || loading) {
    return <div className={styles.loading}>Loading Profile...</div>;
  }

  if (!currentUser) return null; // Redirects handled by useEffect

  return (
    <main className={styles.main}>
      <div className={styles.profileContainer}>
        <h1>Your Profile</h1>

        <div className={styles.profilePictureSection}>
          <div className={styles.imageWrapper}>
            {userData.photoURL ? (
              <img src={userData.photoURL} alt="Profile" />
            ) : (
              <div className={styles.imagePlaceholder} />
            )}
          </div>
          <input
            type="file"
            id="fileInput"
            className={styles.fileInput}
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
          />
          <label htmlFor="fileInput" className={styles.uploadButton}>
            Choose Image
          </label>
          {imageFile && (
            <button onClick={handleImageUpload} className={styles.saveButton} style={{marginTop: '1rem'}}>
              Upload Picture
            </button>
          )}
          {uploadProgress !== null && (
            <p className={styles.uploadProgress}>Uploading: {uploadProgress}%</p>
          )}
        </div>

        <form>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input type="email" value={currentUser.email || ''} disabled />
          </div>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input type="text" name="fullName" value={userData.fullName} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Mobile</label>
            <input type="tel" name="mobile" value={userData.mobile} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Country</label>
            <input type="text" name="country" value={userData.country} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label>State</label>
            <input type="text" name="state" value={userData.state} onChange={handleChange} />
          </div>
          
          <button type="button" onClick={handleSave} className={styles.saveButton} disabled={!hasChanged || isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      </div>
    </main>
  );
};

export default ProfilePage;