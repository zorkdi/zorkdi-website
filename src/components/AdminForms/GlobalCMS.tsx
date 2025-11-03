// src/components/AdminForms/GlobalCMS.tsx

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image'; 
// Firebase services
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'; 
import { db, storage } from '@/firebase';

import adminStyles from '@/app/admin/admin.module.css';
import formStyles from './forms.module.css';
import newPostStyles from '@/app/admin/blog/new/new-post.module.css'; 
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaChartLine, FaSearch, FaTimesCircle } from "react-icons/fa"; 

// Type for Firestore data structure
interface GlobalSettings {
  websiteTitle: string; 
  websiteTagline: string; 
  
  // NAYE FIELDS FOR HERO BACKGROUND
  heroBackgroundURL: string; // The dynamic image URL
  defaultHeroBackground: string; // Placeholder or default CSS URL
  
  // NAYE FIELDS FOR DIGITAL MARKETING
  googleAnalyticsId: string;
  googleSearchConsoleId: string; // Verification ID for meta tag

  contactEmail: string;
  contactPhone: string;
  contactAddress: string;

  socialLinkedin: string;
  socialTwitter: string;
  socialInstagram: string;
  socialFacebook: string;
  adminUID: string;
}

// Default/Initial values
const defaultHeroURL = 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'matrix\' values=\'1 0 0 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0.08 0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")';

const initialData: GlobalSettings = {
  websiteTitle: "ZORK DI - Custom Tech Solutions",
  websiteTagline: "We transform your ideas into high-performance applications, websites, and software.",
  
  // NAYE DEFAULT VALUES FOR HERO BACKGROUND
  heroBackgroundURL: "", // Shuru mein empty rakha
  defaultHeroBackground: defaultHeroURL, // CSS texture as default fallback

  // NAYE DEFAULT VALUES FOR MARKETING
  googleAnalyticsId: "G-XXXXXXXXXX", 
  googleSearchConsoleId: "",

  contactEmail: "info@zorkdi.com", 
  contactPhone: "+1 (555) 555-5555",
  contactAddress: "123 Digital Blvd, Suite 100, Tech City, USA",

  socialLinkedin: "https://linkedin.com/zorkdi",
  socialTwitter: "https://twitter.com/zorkdi",
  socialInstagram: "https://instagram.com/zorkdi",
  socialFacebook: "https://facebook.com/zorkdi",
  adminUID: "eWCjS5yqHvSuafrJ5IbWlT6Kmyf2", // Default Admin UID
};

const GlobalCMS = () => {
  const [content, setContent] = useState<GlobalSettings>(initialData);
  
  // NAYA: State for image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [currentHeroURL, setCurrentHeroURL] = useState<string>(''); // For tracking Firestore URL

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const DOC_REF = doc(db, 'cms', 'global_settings');

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const docSnap = await getDoc(DOC_REF);

        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          // Merge kiya taaki naye fields bhi set ho jayein agar Firestore mein nahi hain
          const mergedData = { ...initialData, ...fetchedData } as GlobalSettings;
          
          setContent(mergedData); 
          setCurrentHeroURL(mergedData.heroBackgroundURL);
          setImagePreview(mergedData.heroBackgroundURL || '');

        } else {
          // Agar document nahi mila, toh default data ke saath create kar do
          await setDoc(DOC_REF, initialData);
          setContent(initialData);
          setCurrentHeroURL(initialData.heroBackgroundURL);
          setImagePreview(initialData.heroBackgroundURL);
        }
      } catch (_err: unknown) {
        console.error("Error fetching Global CMS:", _err);
        setError('Failed to load global settings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // FIX: DOC_REF ko dependencies mein add kiya
  }, [DOC_REF]);

  // --- Handlers ---
  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
    setSuccess('');
    setError('');
  };
  
  // NAYA: Handle image file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // NAYA: Handle image delete (from CMS view only)
  const handleImageDelete = () => {
    // Ye sirf UI se hatata hai aur Final URL ko empty karta hai. Actual Firestore/Storage deletion handleSubmit mein hoga.
    const confirmDelete = window.confirm("Are you sure you want to remove the Hero Background Image?");
    if (confirmDelete) {
        setImagePreview('');
        setCurrentHeroURL(''); 
        setImageFile(null); // Clear any pending file upload
        setContent(prev => ({...prev, heroBackgroundURL: ''}));
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
      let finalImageURL = currentHeroURL; // Firestore se aayi hui URL

      // 1. Image Upload Logic
      if (imageFile) {
        setUploadProgress(0);
        const storageRef = ref(storage, `cms_images/hero_background_${Date.now()}`);
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
      } else if (!imagePreview && currentHeroURL) {
          // 2. Image Deletion (Agar user ne UI se image delete ki ho)
          if (currentHeroURL.includes('firebasestorage.googleapis.com')) {
               try {
                   const urlPath = currentHeroURL.split('/o/')[1];
                   const filePath = urlPath.split('?')[0];
                   const decodedPath = decodeURIComponent(filePath);
                   const imageRef = ref(storage, decodedPath);
                   await deleteObject(imageRef);
                   finalImageURL = ''; // Final URL ko empty set kiya
                   setCurrentHeroURL('');
               } catch (storageError) {
                   console.error("Warning: Failed to delete old storage image.", storageError);
                   // continue execution, finalImageURL will be cleared in next step
               }
          }
          finalImageURL = ''; // Final URL ko empty set kiya
      }


      // 3. Update Document in Firestore
      const docRef = doc(db, 'cms', 'global_settings');
      await setDoc(docRef, { ...content, heroBackgroundURL: finalImageURL }, { merge: true }); 

      // Final state update
      setCurrentHeroURL(finalImageURL);
      setImagePreview(finalImageURL || ''); 
      setSuccess('Global Settings updated successfully!');

    } catch (err: unknown) {
      console.error('Failed to save global settings. Check console.', err); 
      setError('Failed to save global settings. Check console.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
      setImageFile(null); // Clear file state
    }
  };

  if (isLoading) {
    return <div className={adminStyles.loading}>Loading Global Settings CMS...</div>;
  }
  
  return (
    <form className={formStyles.formSection} onSubmit={handleSubmit}>
      <h2>Global Configuration & Branding</h2>

      <div className={formStyles.formGrid}>
        
        {/* Website Title & Tagline */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-neon-light)' }}>Branding & Core Info</h3>
        </div>
        <div className={formStyles.fullWidth}>
          <div className={formStyles.formGroup}>
            <label htmlFor="websiteTitle">Website Title (Metadata)</label>
            <input type="text" id="websiteTitle" name="websiteTitle" value={content.websiteTitle} onChange={handleTextChange} required />
          </div>
        </div>
        <div className={formStyles.fullWidth}>
          <div className={formStyles.formGroup}>
            <label htmlFor="websiteTagline">Website Tagline / Description (Metadata)</label>
            <textarea id="websiteTagline" name="websiteTagline" value={content.websiteTagline} onChange={handleTextChange} required />
          </div>
        </div>
        
        {/* --- HERO BACKGROUND IMAGE --- */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--color-neon-green)' }}>Home Hero Background Image (NVIDIA/TCS style)</h3>
        </div>
        <div className={formStyles.fullWidth}>
             <div className={newPostStyles.imageUploadSection}>
                {imagePreview ? (
                    <>
                        <Image
                          src={imagePreview}
                          alt="Hero Background Preview"
                          width={400} height={250} 
                          className={newPostStyles.imagePreview}
                          style={{ objectFit: 'cover', width: '100%', maxWidth: '400px', height: 'auto', border: '1px solid var(--color-neon-green)'}}
                        />
                        <button type="button" onClick={handleImageDelete} className={adminStyles.dangerButton} style={{marginTop: '1rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <FaTimesCircle /> Remove Image
                        </button>
                    </>
                ) : (
                    <span style={{opacity: 0.7, padding: '1rem', display: 'block'}}>No Image Selected. Default CSS texture will be used.</span>
                )}
                <input
                    type="file" id="heroBackground" className={newPostStyles.fileInput}
                    onChange={handleFileChange} accept="image/png, image/jpeg, image/webp"
                />
                <label htmlFor="heroBackground" className={newPostStyles.uploadButton} style={{marginTop: '1.5rem'}}>
                    {imagePreview ? 'Change Image' : 'Upload Hero Background'}
                </label>
                {uploadProgress !== null && uploadProgress < 100 && ( 
                    <p className={newPostStyles.uploadProgress}>Uploading: {uploadProgress}%</p>
                )}
            </div>
        </div>

        
        {/* --- DIGITAL MARKETING / SEO --- */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--color-neon-light)' }}>Digital Marketing & Tracking</h3>
        </div>

        <div className={formStyles.formGroup}>
            <label><FaChartLine /> Google Analytics 4 (GA4) ID</label>
            <input type="text" name="googleAnalyticsId" value={content.googleAnalyticsId} onChange={handleTextChange} placeholder="e.g., G-XXXXXXXXXX" />
        </div>
        <div className={formStyles.formGroup}>
            <label><FaSearch /> Google Search Console Verification</label>
            <input type="text" name="googleSearchConsoleId" value={content.googleSearchConsoleId} onChange={handleTextChange} placeholder="Meta Tag Content ID only" />
        </div>


        {/* --- CONTACT INFORMATION --- */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--color-neon-light)' }}>Contact Information</h3>
        </div>

        <div className={formStyles.formGroup}>
            <label><FaEnvelope /> Contact Email</label>
            <input type="email" name="contactEmail" value={content.contactEmail} onChange={handleTextChange} required />
        </div>
        <div className={formStyles.formGroup}>
            <label><FaPhoneAlt /> Contact Phone</label>
            <input type="text" name="contactPhone" value={content.contactPhone} onChange={handleTextChange} required />
        </div>
        <div className={formStyles.fullWidth}>
             <div className={formStyles.formGroup}>
                <label><FaMapMarkerAlt /> Contact Address / Location</label>
                <textarea name="contactAddress" value={content.contactAddress} onChange={handleTextChange} required rows={2} />
            </div>
        </div>
        
        {/* --- Social Media Links --- */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--color-neon-light)' }}>Social Media Links</h3>
        </div>
        
        <div className={formStyles.formGroup}>
            <label><FaLinkedin /> LinkedIn URL</label>
            <input type="url" name="socialLinkedin" value={content.socialLinkedin} onChange={handleTextChange} placeholder="e.g., https://linkedin.com/company/zorkdi" />
        </div>
        <div className={formStyles.formGroup}>
            <label><FaTwitter /> Twitter URL</label>
            <input type="url" name="socialTwitter" value={content.socialTwitter} onChange={handleTextChange} placeholder="e.g., https://twitter.com/zorkdi" />
        </div>
        <div className={formStyles.formGroup}>
            <label><FaInstagram /> Instagram URL</label>
            <input type="url" name="socialInstagram" value={content.socialInstagram} onChange={handleTextChange} placeholder="e.g., https://instagram.com/zorkdi" />
        </div>
        <div className={formStyles.formGroup}>
            <label><FaFacebook /> Facebook URL</label>
            <input type="url" name="socialFacebook" value={content.socialFacebook} onChange={handleTextChange} placeholder="e.g., https://facebook.com/zorkdi" />
        </div>
        
        {/* --- Admin UID Control (CRITICAL) --- */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--color-secondary-accent)' }}>Admin Access Control</h3>
        </div>

        <div className={formStyles.fullWidth}>
            <div className={formStyles.formGroup}>
                <label htmlFor="adminUID">Current Admin User ID (CRITICAL)</label>
                <input type="text" id="adminUID" name="adminUID" value={content.adminUID} onChange={handleTextChange} required />
            </div>
            <p className={adminStyles.errorMessage} style={{ margin: 0, padding: '0.75rem', backgroundColor: 'rgba(231, 76, 60, 0.15)' }}>
                ⚠️ WARNING: Changing this UID will immediately log out all current admin sessions. Ensure the new UID is correct, or you will lose access!
            </p>
        </div>

      </div>
      
      {/* Response Messages */}
      {error && <p className={formStyles.errorMessage}>{error}</p>}
      {success && <p className={formStyles.successMessage}>{success}</p>}

      {/* Save Button */}
      <button
        type="submit"
        className={formStyles.saveButton}
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting ? 'Saving Settings...' : 'Save Global Settings'}
      </button>
    </form>
  );
};

export default GlobalCMS;