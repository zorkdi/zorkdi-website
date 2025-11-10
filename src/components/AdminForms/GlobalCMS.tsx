// src/components/AdminForms/GlobalCMS.tsx

"use client";

import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import Image from 'next/image'; 
// Firebase services
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'; 
import { db, storage } from '@/firebase';

import adminStyles from '@/app/admin/admin.module.css';
import formStyles from './forms.module.css';
import newPostStyles from '@/app/admin/blog/new/new-post.module.css'; 
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaChartLine, FaSearch, FaTimesCircle, FaUpload } from "react-icons/fa"; // FaUpload add kiya

// === YAHAN CHANGE KIYA GAYA HAI ===
// Type for Firestore data structure
interface GlobalSettings {
  websiteTitle: string; 
  websiteTagline: string; 
  headerLogoURL: string; // NAYA FIELD LOGO KE LIYE
  
  heroBackgroundURL: string; 
  defaultHeroBackground: string; 
  
  googleAnalyticsId: string;
  googleSearchConsoleId: string; 

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
  headerLogoURL: "/logo.png", // NAYA DEFAULT VALUE
  
  heroBackgroundURL: "", 
  defaultHeroBackground: defaultHeroURL, 

  googleAnalyticsId: "G-XXXXXXXXXX", 
  googleSearchConsoleId: "",

  contactEmail: "info@zorkdi.com", 
  contactPhone: "+1 (555) 555-5555",
  contactAddress: "123 Digital Blvd, Suite 100, Tech City, USA",

  socialLinkedin: "https://linkedin.com/zorkdi",
  socialTwitter: "https://twitter.com/zorkdi",
  socialInstagram: "https://instagram.com/zorkdi",
  socialFacebook: "https://facebook.com/zorkdi",
  adminUID: "eWCjS5yqHvSuafrJ5IbWlT6Kmyf2", 
};

const GlobalCMS = () => {
  const [content, setContent] = useState<GlobalSettings>(initialData);
  
  // Hero Background Image states
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [heroUploadProgress, setHeroUploadProgress] = useState<number | null>(null);
  const [currentHeroURL, setCurrentHeroURL] = useState<string>(''); 

  // === NAYE STATES HEADER LOGO KE LIYE ===
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploadProgress, setLogoUploadProgress] = useState<number | null>(null);
  const [currentLogoURL, setCurrentLogoURL] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const DOC_REF = useMemo(() => doc(db, 'cms', 'global_settings'), []);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const docSnap = await getDoc(DOC_REF);

        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          const mergedData = { ...initialData, ...fetchedData } as GlobalSettings;
          
          setContent(mergedData); 
          
          // Hero Image states
          setCurrentHeroURL(mergedData.heroBackgroundURL);
          setHeroImagePreview(mergedData.heroBackgroundURL || '');
          
          // Logo Image states
          setCurrentLogoURL(mergedData.headerLogoURL);
          setLogoPreview(mergedData.headerLogoURL || '');

        } else {
          await setDoc(DOC_REF, initialData);
          setContent(initialData);
          setCurrentHeroURL(initialData.heroBackgroundURL);
          setHeroImagePreview(initialData.heroBackgroundURL);
          setCurrentLogoURL(initialData.headerLogoURL);
          setLogoPreview(initialData.headerLogoURL);
        }
      } catch (_err: unknown) {
        console.error("Error fetching Global CMS:", _err);
        setError('Failed to load global settings.');
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
  
  // Hero Image File Handler
  const handleHeroFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeroImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setHeroImagePreview(previewUrl);
    }
  };
  
  // Hero Image Delete Handler
  const handleHeroImageDelete = () => {
    const confirmDelete = window.confirm("Are you sure you want to remove the Hero Background Image?");
    if (confirmDelete) {
        setHeroImagePreview('');
        setCurrentHeroURL(''); 
        setHeroImageFile(null); 
        setContent(prev => ({...prev, heroBackgroundURL: ''}));
        setSuccess('');
        setError('');
    }
  };

  // === NAYE HANDLERS LOGO KE LIYE ===
  const handleLogoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };
  
  const handleLogoDelete = () => {
    const confirmDelete = window.confirm("Are you sure you want to remove the Header Logo?");
    if (confirmDelete) {
        setLogoPreview('');
        setCurrentLogoURL(''); 
        setLogoFile(null); 
        setContent(prev => ({...prev, headerLogoURL: ''}));
        setSuccess('');
        setError('');
    }
  };
  
  // Helper function ek file upload karne ke liye
  const uploadFile = (file: File, path: string, progressCallback: (progress: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressCallback(Math.round(progress));
            },
            (uploadError) => {
                console.error("Upload failed:", uploadError);
                reject(uploadError);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
  };
  
  // Helper function ek file delete karne ke liye
  const deleteFile = async (fileURL: string) => {
      if (fileURL.includes('firebasestorage.googleapis.com')) {
           try {
               const urlPath = fileURL.split('/o/')[1];
               const filePath = urlPath.split('?')[0];
               const decodedPath = decodeURIComponent(filePath);
               const imageRef = ref(storage, decodedPath);
               await deleteObject(imageRef);
           } catch (storageError) {
               console.error("Warning: Failed to delete old storage image.", storageError);
           }
      }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let finalHeroURL = currentHeroURL; 
      let finalLogoURL = currentLogoURL;

      // 1. Hero Image Upload Logic
      if (heroImageFile) {
        setHeroUploadProgress(0);
        finalHeroURL = await uploadFile(
            heroImageFile, 
            `cms_images/hero_background_${Date.now()}`,
            (p) => setHeroUploadProgress(p)
        );
      } else if (!heroImagePreview && currentHeroURL) {
          // Hero Image Deletion
          await deleteFile(currentHeroURL);
          finalHeroURL = ''; 
      }
      
      // 2. Logo Image Upload Logic
      if (logoFile) {
        setLogoUploadProgress(0);
        finalLogoURL = await uploadFile(
            logoFile,
            `cms_images/header_logo_${Date.now()}`,
            (p) => setLogoUploadProgress(p)
        );
      } else if (!logoPreview && currentLogoURL) {
          // Logo Image Deletion
          await deleteFile(currentLogoURL);
          finalLogoURL = '';
      }


      // 3. Update Document in Firestore
      await setDoc(DOC_REF, { 
          ...content, 
          heroBackgroundURL: finalHeroURL,
          headerLogoURL: finalLogoURL // Naya field save kiya
      }, { merge: true }); 

      // Final state update
      setCurrentHeroURL(finalHeroURL);
      setHeroImagePreview(finalHeroURL || ''); 
      setCurrentLogoURL(finalLogoURL);
      setLogoPreview(finalLogoURL || '');
      
      setSuccess('Global Settings updated successfully!');

    } catch (err: unknown) {
      console.error('Failed to save global settings. Check console.', err); 
      setError('Failed to save global settings. Check console.');
    } finally {
      setIsSubmitting(false);
      setHeroUploadProgress(null);
      setLogoUploadProgress(null);
      setHeroImageFile(null); 
      setLogoFile(null);
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
        
        {/* === NAYA LOGO UPLOADER === */}
        <div className={formStyles.fullWidth}>
            <div className={formStyles.formGroup}>
                <label>Header Logo (Recommended: PNG/SVG)</label>
                <div className={newPostStyles.imageUploadSection} style={{maxWidth: '300px', padding: '1.5rem'}}>
                    {logoPreview ? (
                        <>
                            <Image
                              src={logoPreview}
                              alt="Header Logo Preview"
                              width={150} height={60} 
                              style={{ objectFit: 'contain', width: '150px', height: '60px', filter: 'brightness(1.1)'}}
                            />
                            <button type="button" onClick={handleLogoDelete} className={adminStyles.dangerButton} style={{marginTop: '1rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <FaTimesCircle /> Remove Logo
                            </button>
                        </>
                    ) : (
                        <span style={{opacity: 0.7, padding: '1rem', display: 'block'}}>No Logo Selected</span>
                    )}
                    <input
                        type="file" id="headerLogo" className={newPostStyles.fileInput}
                        onChange={handleLogoFileChange} accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    />
                    <label htmlFor="headerLogo" className={newPostStyles.uploadButton} style={{marginTop: '1.5rem', display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'center'}}>
                        <FaUpload /> {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    {logoUploadProgress !== null && logoUploadProgress < 100 && ( 
                        <p className={newPostStyles.uploadProgress}>Uploading: {logoUploadProgress}%</p>
                    )}
                </div>
            </div>
        </div>

        <div className={formStyles.fullWidth}>
          <div className={formStyles.formGroup}>
            <label htmlFor="websiteTitle">Website Title (Metadata & Header)</label>
            <input type="text" id="websiteTitle" name="websiteTitle" value={content.websiteTitle} onChange={handleTextChange} required />
          </div>
        </div>
        <div className={formStyles.fullWidth}>
          <div className={formStyles.formGroup}>
            <label htmlFor="websiteTagline">Website Tagline / Description (Metadata & Header)</label>
            <textarea id="websiteTagline" name="websiteTagline" value={content.websiteTagline} onChange={handleTextChange} required />
          </div>
        </div>
        
        {/* --- HERO BACKGROUND IMAGE --- */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--color-neon-green)' }}>Home Hero Background Image</h3>
        </div>
        <div className={formStyles.fullWidth}>
             <div className={newPostStyles.imageUploadSection}>
                {heroImagePreview ? (
                    <>
                        <Image
                          src={heroImagePreview}
                          alt="Hero Background Preview"
                          width={400} height={250} 
                          className={newPostStyles.imagePreview}
                          style={{ objectFit: 'cover', width: '100%', maxWidth: '400px', height: 'auto', border: '1px solid var(--color-neon-green)'}}
                        />
                        <button type="button" onClick={handleHeroImageDelete} className={adminStyles.dangerButton} style={{marginTop: '1rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <FaTimesCircle /> Remove Image
                        </button>
                    </>
                ) : (
                    <span style={{opacity: 0.7, padding: '1rem', display: 'block'}}>No Image Selected. Default CSS texture will be used.</span>
                )}
                <input
                    type="file" id="heroBackground" className={newPostStyles.fileInput}
                    onChange={handleHeroFileChange} accept="image/png, image/jpeg, image/webp"
                />
                <label htmlFor="heroBackground" className={newPostStyles.uploadButton} style={{marginTop: '1.5rem'}}>
                    {heroImagePreview ? 'Change Image' : 'Upload Hero Background'}
                </label>
                {heroUploadProgress !== null && heroUploadProgress < 100 && ( 
                    <p className={newPostStyles.uploadProgress}>Uploading: {heroUploadProgress}%</p>
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