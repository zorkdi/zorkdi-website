// src/components/AdminForms/PortfolioForm.tsx

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Firebase services
import { db, storage } from '@/firebase';
import {
  collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, Timestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Dynamically import the editor
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

// Styles
import adminStyles from '@/app/admin/admin.module.css'; // Use alias
import formStyles from '@/app/admin/portfolio/new/portfolio-form.module.css'; // Use alias

// Define the structure for portfolio data from Firestore
interface PortfolioData {
  title: string;
  category: string;
  content: string;
  coverImageURL: string;
  createdAt?: Timestamp; // Optional existing timestamp
}

// Props for the component
interface PortfolioFormProps {
  postId?: string; // Optional ID for edit mode
}

const PortfolioForm = ({ postId }: PortfolioFormProps) => {
  const router = useRouter();
  const isEditMode = Boolean(postId);

  // State for form data
  const [formData, setFormData] = useState<PortfolioData>({
    title: '',
    category: 'Web App', // Default category
    content: '',
    coverImageURL: '',
  });

  // State for image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch data if in edit mode
  useEffect(() => {
    if (isEditMode && postId) {
      const fetchPost = async () => {
        setIsLoading(true);
        setError('');
        try {
          const docRef = doc(db, 'portfolio', postId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as PortfolioData;
            setFormData(data);
            setImagePreview(data.coverImageURL);
          } else {
            setError('Portfolio item not found.');
          }
        } catch (err) {
          console.error("Error fetching portfolio item:", err);
          setError('Failed to load portfolio item.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPost();
    }
  }, [postId, isEditMode]);

  // Handle standard input/select changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle content changes from the Rich Text Editor
  const handleEditorChange = (htmlContent: string) => {
    setFormData(prev => ({ ...prev, content: htmlContent }));
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

  // Handle form submission (Save or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || formData.content === '<p></p>' || (!imageFile && !isEditMode)) {
      setError('Please fill in title, content, and select a cover image.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setUploadProgress(null);

    try {
      let finalImageURL = formData.coverImageURL;

      if (imageFile) {
        setUploadProgress(0);
        const storageRef = ref(storage, `portfolio_covers/${Date.now()}_${imageFile.name}`);
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
              resolve();
            }
          );
        });
      } else if (!isEditMode) {
         setError('Cover image is required.');
         setIsSubmitting(false);
         return;
      }

      if (isEditMode && postId) {
        const docRef = doc(db, 'portfolio', postId);
        await updateDoc(docRef, {
          title: formData.title,
          category: formData.category,
          content: formData.content,
          coverImageURL: finalImageURL,
        });
        alert('Portfolio project updated successfully!');
      } else {
        await addDoc(collection(db, 'portfolio'), {
          title: formData.title,
          category: formData.category,
          content: formData.content,
          coverImageURL: finalImageURL,
          createdAt: serverTimestamp(),
        });
        alert('Portfolio project added successfully!');
      }

      router.push('/admin/portfolio');

    } catch (err) {
      if (error !== "Image upload failed. Please try again.") {
         setError("Failed to save project data. Check console.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Loading state
  if (isLoading) {
    return <div className={adminStyles.loading}>Loading form...</div>;
  }
   // Render Error state
  if (error && !isSubmitting) {
    return <div className={adminStyles.errorMessage}>{error}</div>;
  }

  // Render the form
  return (
    <form onSubmit={handleSubmit}>
      {/* Cover Image Upload */}
      <div className={formStyles.formGroup}>
        <label htmlFor="coverImage">Cover Image *</label>
        <div className={formStyles.imageUploadSection}>
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Cover preview"
              width={300} height={188}
              className={formStyles.imagePreview}
            />
          ) : (
             <span>{isEditMode ? 'Click Choose Image to change' : 'No Image Selected'}</span>
          )}
          <input
            type="file" id="coverImage" className={formStyles.fileInput}
            onChange={handleFileChange} accept="image/png, image/jpeg"
            required={!isEditMode}
          />
          <label htmlFor="coverImage" className={formStyles.uploadButton}>
            {isEditMode ? 'Change Image' : 'Choose Image'}
          </label>
          {uploadProgress !== null && (
            <p className={formStyles.uploadProgress}>Uploading: {uploadProgress}%</p>
          )}
        </div>
      </div>

      {/* Project Title */}
      <div className={formStyles.formGroup}>
        <label htmlFor="title">Project Title *</label>
        <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
      </div>

      {/* Category */}
      <div className={formStyles.formGroup}>
        <label htmlFor="category">Category *</label>
        <select id="category" name="category" value={formData.category} onChange={handleInputChange} required >
          <option>Web App</option>
          <option>Mobile App</option>
          {/* NAYA: Finance Solution category added */}
          <option>Finance Solution</option>
          <option>Custom Software</option>
          <option>UI/UX Design</option>
          {/* Add more categories as needed */}
        </select>
      </div>

      {/* Description (Rich Text Editor) */}
      <div className={formStyles.formGroup}>
        <label htmlFor="content">Description *</label>
        {(formData.content !== undefined || !isEditMode) && (
             <RichTextEditor
               content={formData.content}
               onChange={handleEditorChange}
             />
        )}
      </div>

      {/* Error Message Display */}
      {error && !isLoading && <p className={formStyles.errorMessage}>{error}</p>}

      {/* Submit/Update Button */}
      <button
        type="submit"
        className={`${adminStyles.primaryButton} ${formStyles.submitButton}`}
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Project' : 'Save Project')}
      </button>

        {/* Delete button can be added here for edit mode */}
        {/* {isEditMode && postId && (<button type="button" onClick={() => handleDelete(postId)} ... >Delete</button>)} */}

    </form>
  );
};

export default PortfolioForm;