// src/components/AdminForms/PortfolioForm.tsx

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
import { FaUpload, FaTrash, FaPlus } from 'react-icons/fa'; // Icons update kiye

// Styles
import adminStyles from '@/app/admin/admin.module.css'; 
import formCommonStyles from '../AdminForms/forms.module.css'; 
import formStyles from '@/app/admin/portfolio/new/portfolio-form.module.css'; 

// Naya Interface Content Block ke liye
interface ContentBlock {
  id: string; // Local ID (e.g., Date.now())
  headline: string;
  text: string;
  imageURL: string; // Firestore mein save hoga
  layout: 'text-left-image-right' | 'image-left-text-right' | 'text-only' | 'image-only';
  
  // Local state ke liye
  file?: File | null; // Nayi image upload ke liye
  uploadProgress?: number | null; // Is block ka upload progress
}

// === YAHAN CHANGE KIYA GAYA HAI (content add kiya) ===
// Portfolio Data structure update kiya
interface PortfolioData {
  title: string;
  category: string;
  content: string; // <-- Add kiya (Short description ke liye)
  contentBlocks: ContentBlock[]; 
  coverImageURL: string;
  createdAt?: Timestamp; 
}

// Props for the component
interface PortfolioFormProps {
  postId?: string; // Optional ID for edit mode
}

const PortfolioForm = ({ postId }: PortfolioFormProps) => {
  const router = useRouter();
  const isEditMode = Boolean(postId);

  // === YAHAN CHANGE KIYA GAYA HAI (content add kiya) ===
  // State for form data
  const [formData, setFormData] = useState<PortfolioData>({
    title: '',
    category: 'Web App', // Default category
    content: '', // <-- Add kiya
    contentBlocks: [], 
    coverImageURL: '',
  });

  // State for cover image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverUploadProgress, setCoverUploadProgress] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 
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
            // === YAHAN CHANGE KIYA GAYA HAI (content add kiya) ===
            setFormData({
                ...data,
                content: data.content || '', // <-- Purane docs ke liye fallback
                contentBlocks: data.contentBlocks || [] 
            });
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

  // --- DELETE LOGIC ---
  const handleDelete = async () => {
    if (!postId || !formData.coverImageURL) return;

    if (!confirm(`Are you sure you want to delete the project: "${formData.title}"? This action cannot be undone.`)) {
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
        
        // 2. Delete Content Block Images from Storage
        for (const block of formData.contentBlocks) {
            if (block.imageURL && block.imageURL.includes('firebasestorage.googleapis.com')) {
                try {
                    const urlPath = block.imageURL.split('/o/')[1];
                    const filePath = urlPath.split('?')[0];
                    const decodedPath = decodeURIComponent(filePath);
                    const imageRef = ref(storage, decodedPath);
                    await deleteObject(imageRef);
                } catch (storageError) {
                    console.error(`Warning: Failed to delete content image ${block.imageURL}.`, storageError);
                }
            }
        }

        // 3. Delete Document from Firestore
        const docRef = doc(db, 'portfolio', postId);
        await deleteDoc(docRef);
        
        alert('Portfolio project deleted successfully!');
        router.push('/admin/portfolio'); 

    } catch (err) {
        console.error("Error deleting portfolio item:", err);
        setError('Failed to delete project. Check console.');
    } finally {
        setIsDeleting(false);
    }
  };


  // Handle standard input/select/textarea changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { 
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle cover image file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // === NAYE FUNCTIONS CONTENT BLOCKS KE LIYE ===

  // Naya block add karna
  const handleAddBlock = () => {
    const newBlock: ContentBlock = {
        id: Date.now().toString(),
        headline: '',
        text: '',
        imageURL: '',
        layout: 'text-left-image-right', // Default layout
        file: null,
        uploadProgress: null,
    };
    setFormData(prev => ({
        ...prev,
        contentBlocks: [...prev.contentBlocks, newBlock]
    }));
  };

  // Block ko remove karna
  const handleRemoveBlock = (id: string) => {
    if (confirm('Are you sure you want to remove this content section?')) {
        setFormData(prev => ({
            ...prev,
            contentBlocks: prev.contentBlocks.filter(block => block.id !== id)
        }));
    }
  };

  // Block ke text inputs ko change karna
  const handleBlockChange = (id: string, field: 'headline' | 'text' | 'layout', value: string) => {
    setFormData(prev => ({
        ...prev,
        contentBlocks: prev.contentBlocks.map(block =>
            block.id === id ? { ...block, [field]: value } : block
        )
    }));
  };

  // Block ki image file ko change karna
  const handleBlockFileChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
          ...prev,
          contentBlocks: prev.contentBlocks.map(block =>
              block.id === id ? { ...block, file: file, imageURL: URL.createObjectURL(file) } : block // imageURL ko preview ke liye update kiya
          )
      }));
    }
  };
  
  // Block ki image ko hatana
  const handleRemoveBlockImage = (id: string) => {
     setFormData(prev => ({
          ...prev,
          contentBlocks: prev.contentBlocks.map(block =>
              block.id === id ? { ...block, file: null, imageURL: '' } : block
          )
      }));
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


  // Handle form submission (Save or Update)
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
            `portfolio_covers/${Date.now()}_${imageFile.name}`,
            (progress) => setCoverUploadProgress(progress)
        );
      } else if (!isEditMode && !finalCoverImageURL) {
         setError('Cover image is required.');
         setIsSubmitting(false);
         return;
      }
      
      // 2. Content Blocks Images Upload
      const uploadedBlocks: ContentBlock[] = [];

      for (const block of formData.contentBlocks) {
          let finalBlockImageURL = block.imageURL;

          // Agar nayi file hai, toh upload karo
          if (block.file) {
              finalBlockImageURL = await uploadFile(
                  block.file,
                  `portfolio_content/${Date.now()}_${block.file.name}`,
                  (progress) => {
                      // Update specific block's progress
                      setFormData(prev => ({
                          ...prev,
                          contentBlocks: prev.contentBlocks.map(b => 
                              b.id === block.id ? { ...b, uploadProgress: progress } : b
                          )
                      }));
                  }
              );
          }
          
          // Naye block ko clean karke add karo (file aur progress hata do)
          uploadedBlocks.push({
            id: block.id,
            headline: block.headline,
            text: block.text,
            layout: block.layout,
            imageURL: finalBlockImageURL, // Naya ya purana URL
          });
      }


      // 3. Firestore Data Save
      // === YAHAN CHANGE KIYA GAYA HAI (content add kiya) ===
      const postData = {
          title: formData.title,
          category: formData.category,
          content: formData.content, // <-- Add kiya
          coverImageURL: finalCoverImageURL,
          contentBlocks: uploadedBlocks,
      };

      if (isEditMode && postId) {
        const docRef = doc(db, 'portfolio', postId);
        await updateDoc(docRef, postData);
        alert('Portfolio project updated successfully!');
      } else {
        await addDoc(collection(db, 'portfolio'), {
          ...postData,
          createdAt: serverTimestamp(),
        });
        alert('Portfolio project added successfully!');
      }

      router.push('/admin/portfolio');

    } catch (error: unknown) { 
       console.error("Failed to save project data. Check console.", error);
       setError("Failed to save project data. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define Page Title
  const pageTitle = isEditMode ? 'Edit Portfolio Project' : 'Create New Portfolio Project';

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
              <h3 className={formStyles.sectionHeader}>1. Project Details</h3>
              {/* Project Title and Category */}
              <div className={formStyles.formGroup}>
                <label htmlFor="title">Project Title *</label>
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

              {/* === YAHAN NAYA FIELD ADD KIYA GAYA HAI === */}
              <div className={formStyles.formGroup} style={{marginTop: '1.5rem'}}>
                <label htmlFor="content">Short Description (for Homepage Card)</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="e.g., A sleek mobile app for managing micro-finance operations..."
                />
                <p className={formStyles.fieldDescription}>This text appears on the homepage portfolio card.</p>
              </div>
              {/* === END OF NAYA FIELD === */}

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
        
        {/* === COLUMN 2: CONTENT BLOCKS === */}
        <div className={formStyles.contentColumn}>
          <h3 className={formStyles.sectionHeader}>3. Project Content (Full Details)</h3>
          
          {/* === YAHAN CHANGE KIYA GAYA HAI ("" ko &quot; se replace kiya) === */}
          <p style={{opacity: 0.8, marginBottom: '1.5rem', fontSize: '0.9rem'}}>
            Add content sections to build the full portfolio details page. The &quot;Short Description&quot; will be used for the homepage card.
          </p>

          {/* Render all content blocks */}
          <div className={formStyles.contentBlocksContainer}>
            {formData.contentBlocks.map((block, index) => (
              <div key={block.id} className={formStyles.contentBlock}>
                <div className={formStyles.blockHeader}>
                    <h4>Section #{index + 1}</h4>
                    <button 
                        type="button" 
                        onClick={() => handleRemoveBlock(block.id)} 
                        className={adminStyles.dangerButton}
                        style={{padding: '0.5rem 0.8rem'}}
                    >
                        <FaTrash /> Remove
                    </button>
                </div>

                {/* Block Form */}
                <div className={formStyles.blockGrid}>
                    {/* Left Side: Text */}
                    <div className={formStyles.blockTextFields}>
                        <div className={formCommonStyles.formGroup}>
                          <label htmlFor={`headline-${block.id}`}>Headline (Optional)</label>
                          <input 
                            type="text" 
                            id={`headline-${block.id}`}
                            value={block.headline}
                            onChange={(e) => handleBlockChange(block.id, 'headline', e.target.value)}
                            placeholder="e.g., Our Solution: A Custom Ecosystem"
                          />
                        </div>
                        <div className={formCommonStyles.formGroup}>
                          <label htmlFor={`text-${block.id}`}>Details *</label>
                          <textarea 
                            id={`text-${block.id}`}
                            value={block.text}
                            onChange={(e) => handleBlockChange(block.id, 'text', e.target.value)}
                            required
                            rows={6}
                            placeholder="Details for this section..."
                          />
                        </div>
                    </div>
                    
                    {/* Right Side: Image & Layout */}
                    <div className={formStyles.blockMediaFields}>
                        <div className={formCommonStyles.formGroup}>
                            <label htmlFor={`layout-${block.id}`}>Layout Style</label>
                            <select 
                                id={`layout-${block.id}`}
                                value={block.layout}
                                onChange={(e) => handleBlockChange(block.id, 'layout', e.target.value)}
                            >
                                <option value="text-left-image-right">Text Left / Image Right</option>
                                <option value="image-left-text-right">Image Left / Text Right</option>
                                <option value="text-only">Text Only (Full Width)</option>
                                <option value="image-only">Image Only (Full Width)</option>
                            </select>
                        </div>
                        
                        <div className={formCommonStyles.formGroup}>
                            <label htmlFor={`image-${block.id}`}>Section Image (Optional)</label>
                            <div className={formStyles.blockImageUpload}>
                                {block.imageURL && (
                                    <Image 
                                        src={block.imageURL} 
                                        alt="Content preview" 
                                        width={150} 
                                        height={100} 
                                        style={{width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '4px'}}
                                    />
                                )}
                                <input 
                                    type="file" 
                                    id={`image-${block.id}`} 
                                    className={formStyles.fileInput}
                                    onChange={(e) => handleBlockFileChange(block.id, e)}
                                    accept="image/png, image/jpeg, image/webp"
                                />
                                <label htmlFor={`image-${block.id}`} className={formStyles.uploadButton} style={{width: '100%', textAlign: 'center'}}>
                                    <FaUpload /> {block.imageURL ? 'Change Image' : 'Upload Image'}
                                </label>
                                {block.imageURL && (
                                    <button type="button" onClick={() => handleRemoveBlockImage(block.id)} className={adminStyles.dangerButton} style={{width: '100%'}}>
                                        Clear Image
                                    </button>
                                )}
                                {typeof block.uploadProgress === 'number' && block.uploadProgress < 100 && (
                                    <p className={formStyles.uploadProgress}>Uploading: {block.uploadProgress}%</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add New Block Button */}
          <button 
            type="button" 
            onClick={handleAddBlock}
            className={adminStyles.secondaryButton} 
            style={{width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}
          >
            <FaPlus /> Add New Section
          </button>
          
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
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Project' : 'Save Project')}
          </button>
          
          {/* Delete Button (Edit Mode only) */}
          {isEditMode && postId && (
              <button 
                  type="button" 
                  onClick={handleDelete} 
                  className={adminStyles.dangerButton}
                  disabled={isDeleting || isSubmitting}
              >
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
          )}
      </div>
      
    </form>
  );
};

export default PortfolioForm;