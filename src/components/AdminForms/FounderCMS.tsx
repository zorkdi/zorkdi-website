// src/components/AdminForms/FounderCMS.tsx

"use client";

import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import Image from 'next/image';
import { FaUpload, FaTimesCircle } from 'react-icons/fa';
// Firebase services
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/firebase';

import adminStyles from '@/app/admin/admin.module.css';
import formStyles from './forms.module.css';
import newPostStyles from '@/app/admin/blog/new/new-post.module.css'; // Image upload styles ke liye

// Type for Founder Settings (Founding Philosophy/Quote)
interface FounderSettings {
    quote: string;
    name: string;
    title: string;
    philosophy: string;
    imageURL: string;
}

// Default/Initial values
const defaultSettings: FounderSettings = {
    quote: "Engineering the future isn't just about code; it's about building solutions that ensure digital accountability and relentless performance.",
    name: "Gadadhar Bairagya", 
    title: "CEO & Lead Developer",
    philosophy: "Our mission at ZORK DI is rooted in crafting clean, scalable, and complex software solutions that meet the highest standards of quality and efficiency.",
    imageURL: "/images/founder-profile-placeholder.jpg", // Fallback Image
};

const FounderCMS = () => {
    const [content, setContent] = useState<FounderSettings>(defaultSettings);
    
    // State for image handling
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [currentImageURL, setCurrentImageURL] = useState<string>(''); // For tracking Firestore URL

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const DOC_REF = useMemo(() => doc(db, 'cms', 'founder_settings'), []);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const docSnap = await getDoc(DOC_REF);

                if (docSnap.exists()) {
                    const fetchedData = docSnap.data();
                    const mergedData = { ...defaultSettings, ...fetchedData } as FounderSettings;
                    
                    setContent(mergedData); 
                    setCurrentImageURL(mergedData.imageURL);
                    setImagePreview(mergedData.imageURL || defaultSettings.imageURL);

                } else {
                    // Agar document nahi mila, toh default data set kar do
                    setContent(defaultSettings);
                    setCurrentImageURL(defaultSettings.imageURL);
                    setImagePreview(defaultSettings.imageURL);
                }
            } catch (_err: unknown) {
                console.error("Error fetching Founder CMS:", _err);
                setError('Failed to load founder settings.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [DOC_REF]); 

    // --- Handlers ---
    const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContent(prev => ({ ...prev, [name]: value }));
        setSuccess('');
        setError('');
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };
    
    const handleImageDelete = () => {
        const confirmDelete = window.confirm("Are you sure you want to remove the Founder Image?");
        if (confirmDelete) {
            setImagePreview(defaultSettings.imageURL); // Fallback to default placeholder
            setCurrentImageURL(''); 
            setImageFile(null); 
            setContent(prev => ({...prev, imageURL: ''})); // Clear imageURL in state
            setSuccess('');
            setError('');
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            let finalImageURL = currentImageURL; // Firestore se aayi hui URL

            // 1. Image Upload Logic
            if (imageFile) {
                setUploadProgress(0);
                const storageRef = ref(storage, `cms_images/founder_profile_${Date.now()}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);

                await new Promise<void>((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(Math.round(progress));
                        },
                        (uploadError) => {
                            console.error("Image upload failed:", uploadError);
                            setError("Image upload failed. Please try again.");
                            reject(uploadError);
                        },
                        async () => {
                            finalImageURL = await getDownloadURL(uploadTask.snapshot.ref);
                            // Agar koi purani image ho toh usko delete karne ki logic yahan aayegi (Optional)
                            resolve();
                        }
                    );
                });
            } else if (!imagePreview || imagePreview === defaultSettings.imageURL) {
                // 2. Image Deletion/Cleanup (Agar user ne UI se image delete ki ho)
                if (currentImageURL.includes('firebasestorage.googleapis.com')) {
                     try {
                         const urlPath = currentImageURL.split('/o/')[1];
                         const filePath = urlPath.split('?')[0];
                         const decodedPath = decodeURIComponent(filePath);
                         const imageRef = ref(storage, decodedPath);
                         await deleteObject(imageRef);
                     } catch (storageError) {
                         console.error("Warning: Failed to delete old storage image.", storageError);
                     }
                }
                finalImageURL = ''; // Final URL ko empty set kiya
            }

            // 3. Update Document in Firestore
            await setDoc(DOC_REF, { ...content, imageURL: finalImageURL }, { merge: true }); 

            // Final state update
            setCurrentImageURL(finalImageURL);
            setImagePreview(finalImageURL || defaultSettings.imageURL); 
            setSuccess('Founder Settings updated successfully!');

        } catch (err: unknown) {
            console.error('Failed to save founder settings. Check console.', err); 
            setError('Failed to save founder settings. Check console.');
        } finally {
            setIsSubmitting(false);
            setUploadProgress(null);
            setImageFile(null); // Clear file state
        }
    };

    if (isLoading) {
        return <div className={adminStyles.loading}>Loading Founder CMS...</div>;
    }
    
    return (
        <form className={formStyles.formSection} onSubmit={handleSubmit}>
            {/* === YAHAN CHANGE KIYA GAYA HAI === */}
            <h2>Founder&apos;s Profile & Vision</h2>

            <div className={formStyles.formGrid}>
                
                {/* --- Profile Image --- */}
                <div className={formStyles.fullWidth}>
                    <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-neon-green)' }}>Profile Image (Homepage/About Page)</h3>
                </div>
                <div className={formStyles.fullWidth}>
                     <div className={newPostStyles.imageUploadSection} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                        {(imagePreview && imagePreview !== defaultSettings.imageURL) ? (
                            <>
                                <Image
                                  src={imagePreview}
                                  alt="Founder Profile Preview"
                                  width={150} height={150} 
                                  className={newPostStyles.imagePreview}
                                  style={{borderRadius: '50%', aspectRatio: '1/1', objectFit: 'cover', maxWidth: '150px', maxHeight: '150px', border: '3px solid var(--color-secondary-accent)'}}
                                />
                                <button type="button" onClick={handleImageDelete} className={adminStyles.dangerButton} style={{marginTop: '1rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                    <FaTimesCircle /> Remove Image
                                </button>
                            </>
                        ) : (
                            <span style={{opacity: 0.7, padding: '1rem', display: 'block'}}>No Image Selected. Placeholder will be used.</span>
                        )}
                        <input
                            type="file" id="founderProfile" className={newPostStyles.fileInput}
                            onChange={handleFileChange} accept="image/png, image/jpeg, image/webp"
                        />
                        <label htmlFor="founderProfile" className={newPostStyles.uploadButton} style={{marginTop: '1.5rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <FaUpload /> {imagePreview && imagePreview !== defaultSettings.imageURL ? 'Change Image' : 'Upload Image'}
                        </label>
                        {uploadProgress !== null && uploadProgress < 100 && ( 
                            <p className={newPostStyles.uploadProgress}>Uploading: {uploadProgress}%</p>
                        )}
                    </div>
                </div>

                {/* --- Founder Details --- */}
                <div className={formStyles.fullWidth}>
                    <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--color-neon-light)' }}>Text Details</h3>
                </div>
                
                <div className={formStyles.formGroup}>
                    <label htmlFor="name">Founder Name</label>
                    <input type="text" id="name" name="name" value={content.name} onChange={handleTextChange} required />
                </div>
                <div className={formStyles.formGroup}>
                    <label htmlFor="title">Founder Title (CEO & Lead Developer)</label>
                    <input type="text" id="title" name="title" value={content.title} onChange={handleTextChange} required />
                </div>
                <div className={formStyles.fullWidth}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="quote">Vision Quote (Homepage/About)</label>
                        <textarea id="quote" name="quote" value={content.quote} onChange={handleTextChange} required rows={4} />
                    </div>
                </div>
                <div className={formStyles.fullWidth}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="philosophy">Founding Philosophy (Detailed Text)</label>
                        <textarea id="philosophy" name="philosophy" value={content.philosophy} onChange={handleTextChange} required rows={6} />
                    </div>
                </div>
            </div>
            
            {/* Response Messages */}
            {error && <p className={adminStyles.errorMessage}>{error}</p>}
            {success && <p className={formStyles.successMessage}>{success}</p>}

            {/* Save Button */}
            <button
                type="submit"
                className={formStyles.saveButton}
                disabled={isSubmitting || isLoading}
                style={{ width: '100%', marginTop: '3rem' }}
            >
                {isSubmitting ? 'Saving Profile...' : 'Save Founder Profile'}
            </button>
        </form>
    );
};

export default FounderCMS;