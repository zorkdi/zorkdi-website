// src/components/AdminForms/CaseStudyForm.tsx
// Nayi file: Yeh form "New" aur "Edit" dono pages use karenge

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Firebase services
import { db, storage } from '@/firebase';
import {
  collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, Timestamp, deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'; 
import { FaUpload, FaTrash, FaPlus } from 'react-icons/fa';

// Styles (Hum Portfolio form ke styles hi reuse karenge)
import adminStyles from '@/app/admin/admin.module.css'; 
import formCommonStyles from '../AdminForms/forms.module.css'; 
import formStyles from '@/app/admin/portfolio/new/portfolio-form.module.css'; 

// Case Study ka data structure
interface CaseStudyData {
  title: string;
  category: string;
  summary: string; // Yeh public listing page par dikhega
  content: string; // Yeh main rich text content hoga
  coverImageURL: string;
  createdAt?: Timestamp; 
}

// Props for the component
interface CaseStudyFormProps {
  studyId?: string; // Optional ID for edit mode
}

const CaseStudyForm = ({ studyId }: CaseStudyFormProps) => {
  const router = useRouter();
  const isEditMode = Boolean(studyId);

  // Form data ke liye State
  const [formData, setFormData] = useState<CaseStudyData>({
    title: '',
    category: 'Finance Solution', // Default category
    summary: '', 
    content: '', // Rich text content ke liye
    coverImageURL: '',
  });

  // Image handling ke liye State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverUploadProgress, setCoverUploadProgress] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [error, setError] = useState('');

  // Edit mode mein data fetch karna
  useEffect(() => {
    if (isEditMode && studyId) {
      const fetchStudy = async () => {
        setIsLoading(true);
        setError('');
        try {
          const docRef = doc(db, 'caseStudies', studyId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as CaseStudyData;
            setFormData({
                ...data,
                summary: data.summary || '', 
                content: data.content || '',
            });
            setImagePreview(data.coverImageURL);
          } else {
            setError('Case study not found.');
          }
        } catch (err) {
          console.error("Error fetching case study:", err);
          setError('Failed to load case study.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudy();
    }
  }, [studyId, isEditMode]);

  // --- DELETE LOGIC ---
  const handleDelete = async () => {
    if (!studyId || !formData.coverImageURL) return;

    if (!confirm(`Are you sure you want to delete the case study: "${formData.title}"? This action cannot be undone.`)) {
        return;
    }

    setIsDeleting(true);
    setError('');

    try {
        // 1. Delete Cover Image from Storage
        if (formData.coverImageURL.includes('firebasestorage.googleapis.com')) {
             try {
                const urlPath = formData.coverImageURL.split('/o/')[1];
                const filePath = urlPath.split('?')[0];
                const decodedPath = decodeURIComponent(filePath);
                
                const imageRef = ref(storage, decodedPath);
                await deleteObject(imageRef);
             } catch (storageError) {
                 console.error("Warning: Failed to delete cover image.", storageError);
             }
        }
        
        // 2. Delete Document from Firestore
        const docRef = doc(db, 'caseStudies', studyId);
        await deleteDoc(docRef);
        
        alert('Case study deleted successfully!');
        router.push('/admin/case-studies'); 

    } catch (err) {
        console.error("Error deleting case study:", err);
        setError('Failed to delete case study. Check console.');
    } finally {
        setIsDeleting(false);
    }
  };


  // Input change handler
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { 
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image file change handler
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // File upload helper
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


  // Form submission (Save or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || (!imageFile && !isEditMode && !formData.coverImageURL)) {
      setError('Please fill in title and select a cover image.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setCoverUploadProgress(null);

    try {
      let finalCoverImageURL = formData.coverImageURL;

      // 1. Cover Image Upload
      if (imageFile) {
        setCoverUploadProgress(0);
        finalCoverImageURL = await uploadFile(
            imageFile, 
            `case_studies_covers/${Date.now()}_${imageFile.name}`,
            (progress) => setCoverUploadProgress(progress)
        );
      } else if (!isEditMode && !finalCoverImageURL) {
         setError('Cover image is required.');
         setIsSubmitting(false);
         return;
      }
      
      // 2. Firestore Data Save
      const postData = {
          title: formData.title,
          category: formData.category,
          summary: formData.summary,
          content: formData.content,
          coverImageURL: finalCoverImageURL,
      };

      if (isEditMode && studyId) {
        const docRef = doc(db, 'caseStudies', studyId);
        await updateDoc(docRef, postData);
        alert('Case study updated successfully!');
      } else {
        await addDoc(collection(db, 'caseStudies'), {
          ...postData,
          createdAt: serverTimestamp(),
        });
        alert('Case study added successfully!');
      }

      router.push('/admin/case-studies');

    } catch (error: unknown) { 
       console.error("Failed to save case study. Check console.", error);
       setError("Failed to save case study. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define Page Title
  const pageTitle = isEditMode ? 'Edit Case Study' : 'Create New Case Study';

  if (isLoading) {
    return (
      <div>
          <div className={adminStyles.pageHeader}><h1>{pageTitle}</h1></div>
          <div className={adminStyles.loading} style={{ minHeight: '50vh', padding: '10rem 3rem' }}>
              Loading form...
          </div>
      </div>
    );
  }
  if (error && !isSubmitting && !isDeleting && !isEditMode) {
    return (
        <div>
            <div className={adminStyles.pageHeader}><h1>{pageTitle}</h1></div>
            <div className={adminStyles.errorMessage} style={{ padding: '2rem' }}>{error}</div>
        </div>
    );
  }

  // Render the form
  return (
    <form onSubmit={handleSubmit}>
      <div className={adminStyles.pageHeader}><h1>{pageTitle}</h1></div>
      
      <div className={formStyles.formWrapper}>
        
        {/* === COLUMN 1: METADATA & COVER IMAGE === */}
        <div className={formStyles.metadataColumn}>
          
          {/* Metadata Section */}
          <div className={formStyles.metadataSection}>
              <h3 className={formStyles.sectionHeader}>1. Study Details</h3>
              {/* Project Title and Category */}
              <div className={formStyles.formGroup}>
                <label htmlFor="title">Title *</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor="category">Category *</label>
                <select id="category" name="category" value={formData.category} onChange={handleInputChange} required >
                  <option>Web App</option>
                  <option>Mobile App</option>
                  <option>Finance Solution</option>
                  <option>Custom Software</option>
                  <option>UI/UX Design</option>
                </select>
              </div>

              {/* Summary Field */}
              <div className={formStyles.formGroup} style={{marginTop: '1.5rem'}}>
                <label htmlFor="summary">Summary (for listing page)</label>
                <textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="e.g., A brief summary of the project, challenges, and results..."
                />
                <p className={formStyles.fieldDescription}>This text appears on the case studies listing card.</p>
              </div>
          </div>

          {/* Cover Image Upload Section */}
          <div className={formStyles.metadataSection}>
              <h3 className={formStyles.sectionHeader}>2. Cover Image *</h3>
              <div className={formStyles.imageUploadSection}>
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Cover preview"
                    width={350} height={219} 
                    className={formStyles.imagePreview}
                    style={{ width: '100%', height: 'auto', maxHeight: '250px' }} 
                  />
                ) : (
                  <span style={{opacity: 0.7, padding: '1rem', display: 'block'}}>{isEditMode ? 'No Cover Image' : 'No Image Selected'}</span>
                )}
                <input
                  type="file" id="coverImage" className={formStyles.fileInput}
                  onChange={handleFileChange} accept="image/png, image/jpeg, image/webp"
                />
                <label htmlFor="coverImage" className={formStyles.uploadButton}>
                  <FaUpload /> {imagePreview ? 'Change Image' : 'Choose Image'}
                </label>
                {typeof coverUploadProgress === 'number' && coverUploadProgress < 100 && ( 
                  <p className={formStyles.uploadProgress}>Uploading Cover: {coverUploadProgress}%</p>
                )}
              </div>
          </div>
        </div>
        
        {/* === COLUMN 2: FULL CONTENT === */}
        <div className={formStyles.contentColumn}>
          <h3 className={formStyles.sectionHeader}>3. Full Case Study Content</h3>
          
          <div className={formCommonStyles.formGroup}>
            <label htmlFor="content">Case Study Details</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={20} // Lamba text area
              placeholder="Write the full case study here. You can use Markdown for formatting."
            />
             <p className={formStyles.fieldDescription}>
                This is the main content for the case study page. (Note: Rich Text Editor is not yet implemented here).
             </p>
          </div>
          
        </div>
      </div>

      {/* 3. Error Message Display (Full Width) */}
      {error && !isLoading && <p className={formStyles.errorMessage}>{error}</p>}

      {/* 4. Action Buttons Container (Full Width) */}
      <div className={adminStyles.actionButtonsContainer} style={{ marginTop: '3rem', borderTop: 'none', justifyContent: 'space-between' }}>
          {/* Submit/Update Button */}
          <button
            type="submit"
            className={adminStyles.primaryButton}
            disabled={isSubmitting || isLoading || isDeleting}
          >
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Study' : 'Save Study')}
          </button>
          
          {/* Delete Button (Edit Mode only) */}
          {isEditMode && studyId && (
              <button 
                  type="button" 
                  onClick={handleDelete} 
                  className={adminStyles.dangerButton}
                  disabled={isDeleting || isSubmitting}
              >
                  {isDeleting ? 'Deleting...' : 'Delete Study'}
              </button>
          )}
      </div>
      
    </form>
  );
};

export default CaseStudyForm;