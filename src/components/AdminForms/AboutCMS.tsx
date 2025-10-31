// src/components/AdminForms/AboutCMS.tsx

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';

import adminStyles from '@/app/admin/admin.module.css';
import formStyles from './forms.module.css';

// Type for Firestore data structure
interface AboutContent {
  heroHeadline: string;
  heroSubheadline: string;
  storyHeadline: string;
  storyContent: string;
  missionHeadline: string;
  missionContent: string;
  visionHeadline: string;
  visionContent: string;
  values: string[]; // Array of strings for core values
  founderPhotoURL: string;
}

// Default/Initial values
const initialData: AboutContent = {
  heroHeadline: "Our journey to building digital excellence.",
  heroSubheadline: "We are more than just developers; we are partners in your digital evolution.",
  storyHeadline: "The ZORK DI Story: Built on Passion",
  storyContent: "ZORK DI was founded with a single mission: to cut through complexity and deliver clean, high-performance software. Over the years, we have grown into a team of dedicated experts...",
  missionHeadline: "Our Mission",
  missionContent: "To empower businesses globally by delivering cutting-edge, secure, and scalable technology solutions.",
  visionHeadline: "Our Vision",
  visionContent: "To be the leading digital engineering firm, recognized for innovation and uncompromising quality.",
  values: ["Integrity", "Innovation", "Excellence", "Client Success"],
  founderPhotoURL: "/placeholder/founder.jpg",
};


// Component to handle the array of core values
const ValuesArrayEditor = ({ values, onChange }: { values: string[], onChange: (newValues: string[]) => void }) => {
    const handleValueChange = (index: number, value: string) => {
        const newValues = [...values];
        newValues[index] = value;
        onChange(newValues);
    };

    const handleAddValue = () => {
        onChange([...values, 'New Value']);
    };

    const handleRemoveValue = (index: number) => {
        const newValues = values.filter((_, i) => i !== index);
        onChange(newValues);
    };

    return (
        <div className={formStyles.formGroup}>
            <label>Core Values</label>
            {values.map((value, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                        placeholder={`Value ${index + 1}`}
                        style={{ flexGrow: 1 }}
                    />
                    <button type="button" onClick={() => handleRemoveValue(index)} className={adminStyles.dangerButton} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                        Remove
                    </button>
                </div>
            ))}
            <button type="button" onClick={handleAddValue} className={formStyles.uploadButton} style={{ width: 'auto', marginTop: '10px' }}>
                + Add New Value
            </button>
        </div>
    );
};


const AboutCMS = () => {
  const [content, setContent] = useState<AboutContent>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch content from the single CMS document
        const docRef = doc(db, 'cms', 'about_page');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContent(docSnap.data() as AboutContent);
        } else {
          // Agar document nahi mila, toh default data ke saath create kar do
          await setDoc(docRef, initialData);
          setContent(initialData);
        }
      } catch (error: unknown) { // FIX: _err replaced with error, aur console.error mein use kiya
        console.error("Error fetching About CMS:", error);
        setError('Failed to load CMS content.');
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

  const handleValuesChange = (newValues: string[]) => {
    setContent(prev => ({ ...prev, values: newValues.filter(v => v.trim() !== '') })); // Remove empty values
    setSuccess('');
    setError('');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let finalPhotoURL = content.founderPhotoURL;

      // 1. Image Upload
      if (imageFile) {
        setUploadProgress(0);
        const fileExtension = imageFile.name.split('.').pop();
        const storageRef = ref(storage, `cms/founder/founder_photo_${Date.now()}.${fileExtension}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (uploadError) => {
              console.error("Image upload failed:", uploadError);
              setError("Founder photo upload failed.");
              reject(uploadError);
            },
            async () => {
              finalPhotoURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      // 2. Text Content Update
      const docRef = doc(db, 'cms', 'about_page');
      await setDoc(docRef, { // Use setDoc to overwrite/merge
        ...content,
        founderPhotoURL: finalPhotoURL,
        values: content.values.filter(v => v.trim() !== ''), // Ensure only non-empty values are saved
      }, { merge: true });

      // Update local state with the new URL and reset file state
      setContent(prev => ({ ...prev, founderPhotoURL: finalPhotoURL, values: prev.values.filter(v => v.trim() !== '') }));
      setImageFile(null);
      setUploadProgress(null);
      
      setSuccess('About Page content updated successfully!');

    } catch (error: unknown) { // FIX: _err replaced with error, aur console.error mein use kiya
      if (!error) { // Agar image upload se error nahi aaya toh generic error dikhao
        console.error('Error during form submission:', error); 
        setError('Failed to save CMS content. Please check the console.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className={adminStyles.loading}>Loading About Page CMS...</div>;
  }
  
  const currentPhotoURL = imageFile ? URL.createObjectURL(imageFile) : content.founderPhotoURL;

  return (
    <form className={formStyles.formSection} onSubmit={handleSubmit}>
      <h2>About Page Content Management</h2>

      {/* --- Founder Photo Upload --- */}
      <div className={formStyles.formGroup} style={{ maxWidth: '300px', margin: '0 auto 3rem auto' }}>
        <label style={{ textAlign: 'center' }}>Founder Photo (1:1 Aspect Ratio)</label>
        <div className={formStyles.imageUpload}>
          {/* NAYA: Placeholder Image agar URL available na ho */}
          {currentPhotoURL && currentPhotoURL !== "/placeholder/founder.jpg" ? (
            <Image
              src={currentPhotoURL}
              alt="Founder Photo Preview"
              width={100} height={100}
              className={formStyles.imagePreview}
            />
          ) : (
             <div className={formStyles.imagePreview} style={{backgroundColor: '#34495e', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                 <span style={{opacity: 0.7}}>No Photo</span>
             </div>
          )}
          <input
            type="file" id="founderPhoto" className={formStyles.fileInput}
            onChange={handleFileChange} accept="image/png, image/jpeg, image/webp"
          />
          <label htmlFor="founderPhoto" className={formStyles.uploadButton}>
            {currentPhotoURL && currentPhotoURL !== "/placeholder/founder.jpg" ? 'Change Photo' : 'Upload Photo'}
          </label>
          {uploadProgress !== null && uploadProgress < 100 && (
            <p className={formStyles.uploadProgress}>Uploading: {uploadProgress}%</p>
          )}
        </div>
      </div>
      
      <div className={formStyles.formGrid}>
        {/* Hero Section */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-neon-light)' }}>Hero Section</h3>
        </div>
        <div className={formStyles.fullWidth}>
          <div className={formStyles.formGroup}>
            <label htmlFor="heroHeadline">Hero Headline</label>
            <input type="text" id="heroHeadline" name="heroHeadline" value={content.heroHeadline} onChange={handleTextChange} required />
          </div>
        </div>
        <div className={formStyles.fullWidth}>
          <div className={formStyles.formGroup}>
            <label htmlFor="heroSubheadline">Hero Subheadline</label>
            <textarea id="heroSubheadline" name="heroSubheadline" value={content.heroSubheadline} onChange={handleTextChange} required />
          </div>
        </div>

        {/* Our Story */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ marginTop: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-neon-light)' }}>Our Story</h3>
        </div>
        <div className={formStyles.formGroup}>
            <label htmlFor="storyHeadline">Story Headline</label>
            <input type="text" id="storyHeadline" name="storyHeadline" value={content.storyHeadline} onChange={handleTextChange} required />
        </div>
        {/* Empty column for alignment */}
        <div></div> 
        <div className={formStyles.fullWidth}>
          <div className={formStyles.formGroup}>
            <label htmlFor="storyContent">Story Content</label>
            <textarea id="storyContent" name="storyContent" value={content.storyContent} onChange={handleTextChange} required />
          </div>
        </div>
        
        {/* Mission & Vision */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ marginTop: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-neon-light)' }}>Mission & Vision</h3>
        </div>
        <div className={formStyles.formGroup}>
            <label htmlFor="missionHeadline">Mission Headline</label>
            <input type="text" id="missionHeadline" name="missionHeadline" value={content.missionHeadline} onChange={handleTextChange} required />
        </div>
        <div className={formStyles.formGroup}>
            <label htmlFor="visionHeadline">Vision Headline</label>
            <input type="text" id="visionHeadline" name="visionHeadline" value={content.visionHeadline} onChange={handleTextChange} required />
        </div>
        <div className={formStyles.formGroup}>
            <label htmlFor="missionContent">Mission Content</label>
            <textarea id="missionContent" name="missionContent" value={content.missionContent} onChange={handleTextChange} required />
        </div>
        <div className={formStyles.formGroup}>
            <label htmlFor="visionContent">Vision Content</label>
            <textarea id="visionContent" name="visionContent" value={content.visionContent} onChange={handleTextChange} required />
        </div>
        
        {/* Core Values (Uses custom array editor) */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ marginTop: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-neon-light)' }}>Core Values (Max 4)</h3>
            <ValuesArrayEditor 
                values={content.values} 
                onChange={handleValuesChange} 
            />
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
        {isSubmitting ? 'Saving Changes...' : 'Save All Changes'}
      </button>
    </form>
  );
};

export default AboutCMS;