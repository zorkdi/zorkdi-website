// src/components/AdminForms/AboutCMS.tsx

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Firebase services
import { db, storage } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// Dynamically import the editor (assuming you have this path)
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

// Styles
import adminStyles from '@/app/admin/admin.module.css';
import formStyles from '../AdminForms/forms.module.css'; 
import newPostStyles from '@/app/admin/blog/new/new-post.module.css'; // Image upload styles reuse kiya

// Type definitions (About Page se liye gaye)
interface AboutContent {
    heroTitle: string;
    heroSubtitle: string;
    storyTitle: string;
    storyParagraph1: string;
    storyParagraph2: string;
    missionTitle: string;
    missionText: string;
    visionTitle: string;
    visionText: string;
    valuesTitle: string;
    founderImageUrl: string;
}

// Default/Initial values
const defaultContent: AboutContent = {
    heroTitle: "Redefining Digital Experiences.",
    heroSubtitle: "We are ZorkDI: The force accelerating the next generation of web development.",
    storyTitle: "Our Story: Built on Passion and Precision",
    storyParagraph1: "ZorkDI was founded with a simple, yet ambitious goal: to bridge the gap between complex technology and compelling user experience.",
    storyParagraph2: "Today, we've grown into a full-service digital agency. Every line of code and every pixel matters.",
    missionTitle: "Our Mission",
    missionText: "To empower businesses globally with cutting-edge, scalable, and secure digital platforms.",
    visionTitle: "Our Vision",
    visionText: "To be the recognized leader in bespoke digital innovation, setting the benchmark for quality, speed, and client satisfaction.",
    valuesTitle: "Core Values",
    founderImageUrl: "/images/founder_placeholder.jpg",
};

const AboutCMS = () => {
  const [content, setContent] = useState<AboutContent>(defaultContent);
  
  // State for image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const DOC_REF = doc(db, 'cms', 'about_page');

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const docSnap = await getDoc(DOC_REF);

        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as AboutContent;
          setContent({ ...defaultContent, ...fetchedData }); 
          setImagePreview(fetchedData.founderImageUrl);
        } else {
          await setDoc(DOC_REF, defaultContent);
          setContent(defaultContent);
          setImagePreview(defaultContent.founderImageUrl);
        }
      } catch (_err: unknown) {
        console.error("Error fetching About CMS:", _err);
        setError('Failed to load About page content.');
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
  
  // Handle Rich Text Editor change for paragraphs
  const handleRichTextChange = (name: keyof AboutContent, htmlContent: string) => {
    setContent(prev => ({ ...prev, [name]: htmlContent }));
    setSuccess('');
    setError('');
  };
  
  // Handle image file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let finalImageURL = content.founderImageUrl;

      if (imageFile) {
        setUploadProgress(0);
        // Image Upload Logic
        const storageRef = ref(storage, `cms_images/founder_image_${Date.now()}`);
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
              // Agar koi purani image ho toh usko delete karne ki logic yahan aayegi
              resolve();
            }
          );
        });
      }

      // 2. Update Document in Firestore
      await setDoc(DOC_REF, { ...content, founderImageUrl: finalImageURL }, { merge: true }); 

      setSuccess('About Page content updated successfully!');

    } catch (err: unknown) {
      console.error('Failed to save About CMS content. Check console.', err); 
      setError('Failed to save About CMS content. Check console.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
      setImageFile(null); // Clear file state after successful upload
    }
  };

  if (isLoading) {
    return <div className={adminStyles.loading}>Loading About CMS...</div>;
  }
  
  return (
    <form className={formStyles.formSection} onSubmit={handleSubmit}>
      <h2>About Page Content Management</h2>
      <div className={formStyles.formGrid}>
        
        {/* --- HERO SECTION --- */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1rem', color: 'var(--color-neon-green)' }}>Hero Section</h3>
        </div>
        <div className={formStyles.fullWidth}>
          <div className={newPostStyles.formGroup}>
            <label htmlFor="heroTitle">Hero Title</label>
            <input type="text" id="heroTitle" name="heroTitle" value={content.heroTitle} onChange={handleTextChange} required />
          </div>
        </div>
        <div className={formStyles.fullWidth}>
          <div className={newPostStyles.formGroup}>
            <label htmlFor="heroSubtitle">Hero Subtitle</label>
            <textarea id="heroSubtitle" name="heroSubtitle" value={content.heroSubtitle} onChange={handleTextChange} required />
          </div>
        </div>

        {/* --- STORY SECTION --- */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--color-neon-green)' }}>Our Story Section</h3>
        </div>
        
        <div className={formStyles.fullWidth}>
            <div className={newPostStyles.formGroup}>
                <label>Story Title</label>
                <input type="text" name="storyTitle" value={content.storyTitle} onChange={handleTextChange} required />
            </div>
        </div>

        {/* Story Paragraph 1 (Rich Text) */}
        <div className={formStyles.fullWidth}>
            <div className={newPostStyles.formGroup}>
                <label>Story Paragraph 1 (Content)</label>
                <RichTextEditor
                    content={content.storyParagraph1}
                    onChange={(html) => handleRichTextChange('storyParagraph1', html)}
                />
            </div>
        </div>

        {/* Story Paragraph 2 (Rich Text) */}
        <div className={formStyles.fullWidth}>
            <div className={newPostStyles.formGroup}>
                <label>Story Paragraph 2 (Content)</label>
                <RichTextEditor
                    content={content.storyParagraph2}
                    onChange={(html) => handleRichTextChange('storyParagraph2', html)}
                />
            </div>
        </div>


        {/* --- FOUNDER IMAGE --- */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--color-neon-green)' }}>Founder Image (Story Section)</h3>
        </div>
        <div className={formStyles.fullWidth}>
             <div className={newPostStyles.imageUploadSection}>
                {imagePreview && imagePreview !== defaultContent.founderImageUrl ? (
                    <Image
                      src={imagePreview}
                      alt="Founder preview"
                      width={150} height={150} 
                      className={newPostStyles.imagePreview}
                      style={{borderRadius: '50%', aspectRatio: '1/1', objectFit: 'cover', maxWidth: '150px', maxHeight: '150px'}}
                    />
                ) : (
                    <span style={{opacity: 0.7}}>Founder Image Placeholder</span>
                )}
                <input
                    type="file" id="founderImage" className={newPostStyles.fileInput}
                    onChange={handleFileChange} accept="image/png, image/jpeg"
                />
                <label htmlFor="founderImage" className={newPostStyles.uploadButton} style={{marginTop: '1.5rem'}}>
                    {imagePreview && imagePreview !== defaultContent.founderImageUrl ? 'Change Image' : 'Upload Founder Image'}
                </label>
                {uploadProgress !== null && uploadProgress < 100 && ( 
                    <p className={newPostStyles.uploadProgress}>Uploading: {uploadProgress}%</p>
                )}
            </div>
        </div>

        {/* --- MISSION & VISION --- */}
        <div className={formStyles.fullWidth}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--color-neon-green)' }}>Mission & Vision</h3>
        </div>
        <div className={formStyles.formGroup}>
            <label>Mission Title</label>
            <input type="text" name="missionTitle" value={content.missionTitle} onChange={handleTextChange} required />
        </div>
        <div className={formStyles.formGroup}>
            <label>Vision Title</label>
            <input type="text" name="visionTitle" value={content.visionTitle} onChange={handleTextChange} required />
        </div>
        <div className={formStyles.fullWidth}>
            <div className={formStyles.formGroup}>
                <label>Mission Text</label>
                <textarea name="missionText" value={content.missionText} onChange={handleTextChange} required rows={4} />
            </div>
        </div>
        <div className={formStyles.fullWidth}>
            <div className={formStyles.formGroup}>
                <label>Vision Text</label>
                <textarea name="visionText" value={content.visionText} onChange={handleTextChange} required rows={4} />
            </div>
        </div>
        
        {/* --- CORE VALUES TITLE --- */}
        <div className={formStyles.fullWidth}>
            <div className={formStyles.formGroup} style={{marginTop: '1.5rem'}}>
                <label>Core Values Title</label>
                <input type="text" name="valuesTitle" value={content.valuesTitle} onChange={handleTextChange} required />
            </div>
        </div>
        
      </div>
      
      {/* Response Messages */}
      {error && <p className={newPostStyles.errorMessage}>{error}</p>}
      {success && <p className={formStyles.successMessage}>{success}</p>}

      {/* Save Button */}
      <button
        type="submit"
        className={newPostStyles.publishButton}
        disabled={isSubmitting || isLoading}
        style={{ width: '100%' }}
      >
        {isSubmitting ? 'Saving About Page...' : 'Save About Page Content'}
      </button>
    </form>
  );
};

export default AboutCMS;