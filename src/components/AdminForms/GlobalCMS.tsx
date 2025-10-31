// src/components/AdminForms/GlobalCMS.tsx

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { db } from '@/firebase';

import adminStyles from '@/app/admin/admin.module.css';
import formStyles from './forms.module.css';
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaChartLine, FaSearch } from "react-icons/fa"; // NAYE ICONS IMPORT KIYE

// Type for Firestore data structure
interface GlobalSettings {
  websiteTitle: string; 
  websiteTagline: string; 
  
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
const initialData: GlobalSettings = {
  websiteTitle: "ZORK DI - Custom Tech Solutions",
  websiteTagline: "We transform your ideas into high-performance applications, websites, and software.",
  
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'cms', 'global_settings');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          // Default values ko use kiya taaki naye fields bhi set ho jayein agar Firestore mein nahi hain
          setContent({ ...initialData, ...fetchedData } as GlobalSettings); 
        } else {
          // Agar document nahi mila, toh default data ke saath create kar do
          await setDoc(docRef, initialData);
          setContent(initialData);
        }
      } catch (_err: unknown) {
        console.error("Error fetching Global CMS:", _err);
        setError('Failed to load global settings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Handlers ---
  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const docRef = doc(db, 'cms', 'global_settings');
      await setDoc(docRef, content, { merge: true }); 

      setSuccess('Global Settings updated successfully!');

    } catch (err: unknown) {
      console.error('Failed to save global settings. Check console.', err); 
      setError('Failed to save global settings. Check console.');
    } finally {
      setIsSubmitting(false);
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