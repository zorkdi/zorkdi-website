// src/app/profile/page.tsx

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FaUserCircle, FaCamera } from 'react-icons/fa'; // NAYA: Camera icon add kiya

import styles from './profile.module.css';

// Type definitions for Profile Form
interface ProfileForm {
    fullName: string;
    mobile: string;
    country: string;
}

const countryOptions = ['USA', 'India', 'Canada', 'UK', 'Eurozone', 'Other'];

const ProfilePage = () => {
    const { currentUser, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState<ProfileForm>({
        fullName: '',
        mobile: '',
        country: 'USA',
    });
    
    // Image Upload States
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Redirect or populate form on load
    useEffect(() => {
        if (!authLoading && !currentUser) {
            router.push('/login');
        }

        if (userProfile) {
            setFormData({
                fullName: userProfile.fullName || '',
                mobile: userProfile.mobile || '',
                country: userProfile.country || 'USA',
            });
            // Profile URL ko initial preview ke liye set kiya
            setImagePreviewUrl(userProfile.photoURL || null);
        }
    }, [authLoading, currentUser, userProfile, router]);

    // Handle standard input change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSuccess('');
        setError('');
    };

    // Handle profile picture file selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            // Local preview URL create kiya
            setImagePreviewUrl(URL.createObjectURL(file));
            setSuccess('');
            setError('');
        }
    };

    // Form Submission: Update Profile
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) return;
        
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            let finalPhotoURL = userProfile?.photoURL || '';

            // 1. Image Upload Logic
            if (imageFile) {
                setUploadProgress(0);
                const storageRef = ref(storage, `profile_pictures/${currentUser.uid}_${Date.now()}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);

                await new Promise<void>((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(Math.round(progress));
                        },
                        (uploadError) => {
                            console.error("Image upload failed:", uploadError);
                            setError("Profile picture upload failed.");
                            reject(uploadError);
                        },
                        async () => {
                            finalPhotoURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            }

            // 2. Update Firestore User Document
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                fullName: formData.fullName,
                mobile: formData.mobile,
                country: formData.country,
                photoURL: finalPhotoURL, // New or existing URL
            });
            
            setSuccess('Your profile has been updated successfully!');
            setImageFile(null); // Clear file state after successful upload/update
            setUploadProgress(null);


        } catch (err) {
            console.error("Profile Update Error:", err);
            if (!error) { // Agar image upload se error nahi aaya toh generic error dikhao
                setError('Failed to save profile changes.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- Render Logic ---

    if (authLoading || !currentUser) {
        // Redirection should handle the !currentUser case, but this handles the loading state
        return <div className={styles.loading}>Loading profile...</div>;
    }

    return (
        <main className={styles.main}>
            <div className={styles.profileContainer}>
                <h1>My Profile Settings</h1>

                <form onSubmit={handleSubmit}>
                    
                    {/* --- Profile Picture Section --- */}
                    <div className={styles.profilePictureSection}>
                        <div className={styles.imageWrapper}>
                            {imagePreviewUrl ? (
                                <Image
                                    src={imagePreviewUrl}
                                    alt="Profile Picture"
                                    width={150} height={150}
                                    className={styles.profileImage}
                                />
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <FaUserCircle style={{fontSize: '3rem', opacity: 0.8}}/>
                                </div>
                            )}
                        </div>
                        
                        <input
                            type="file" id="profilePhoto" className={styles.fileInput}
                            onChange={handleFileChange} accept="image/png, image/jpeg, image/webp"
                            disabled={isSubmitting}
                        />
                        <label htmlFor="profilePhoto" className={styles.uploadButton}>
                           <FaCamera style={{marginRight: '0.5rem'}} /> {imagePreviewUrl ? 'Change Photo' : 'Upload Photo'}
                        </label>
                        {uploadProgress !== null && uploadProgress < 100 && ( 
                            <p className={styles.uploadProgress}>Uploading: {uploadProgress}%</p>
                        )}
                        <p className={styles.uploadProgress} style={{marginTop: '0.5rem', opacity: 0.6}}>Max size 2MB (JPG, PNG)</p>
                    </div>

                    {/* --- Profile Data Form --- */}
                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input type="email" value={userProfile?.email || ''} disabled />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="fullName">Full Name *</label>
                        <input 
                            type="text" id="fullName" name="fullName" 
                            value={formData.fullName} 
                            onChange={handleInputChange} 
                            required 
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="mobile">Mobile Number</label>
                        <input 
                            type="tel" id="mobile" name="mobile" 
                            value={formData.mobile} 
                            onChange={handleInputChange} 
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="country">Country</label>
                        <select 
                            id="country" name="country" 
                            value={formData.country} 
                            onChange={handleInputChange} 
                            disabled={isSubmitting}
                        >
                            {countryOptions.map(country => <option key={country} value={country}>{country}</option>)}
                        </select>
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {success && <p className={styles.successMessage}>{success}</p>}

                    <button
                        type="submit"
                        className={styles.saveButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving Profile...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </main>
    );
};

export default ProfilePage;