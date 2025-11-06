// src/app/admin/blog/new/NewPostForm.tsx

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// TinyMCE imports removed

// Firebase services
import { db, storage } from '@/firebase';
import {
  collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, Timestamp, deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'; 
import { FaUpload, FaCopy, FaCheck } from 'react-icons/fa'; // Icons for upload/copy

// Styles
import adminStyles from '@/app/admin/admin.module.css'; 
import formStyles from './new-post.module.css'; // Blog specific styles
import formCommonStyles from '@/components/AdminForms/forms.module.css'; // Common form styles


// Define the structure for blog post data from Firestore
interface BlogPostData {
  title: string;
  slug: string; // URL slug
  category: string;
  content: string;
  coverImageURL: string;
  isPublished: boolean; 
  createdAt?: Timestamp; // Optional existing timestamp
}

// Props for the component
interface NewPostFormProps {
  postId?: string; // Optional ID for edit mode (if reused for edit)
}

// Default data for new post
const initialData: BlogPostData = {
    title: '',
    slug: '',
    category: 'TUTORIAL',
    content: '',
    coverImageURL: '',
    isPublished: false, 
};

const NewPostForm = ({ postId }: NewPostFormProps) => {
  const router = useRouter();
  const isEditMode = Boolean(postId);

  const [formData, setFormData] = useState<BlogPostData>(initialData);

  // State for cover image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // NAYA: State for content image handling
  const [contentImageFile, setContentImageFile] = useState<File | null>(null);
  const [contentUploadProgress, setContentUploadProgress] = useState<number | null>(null);
  const [uploadedContentURL, setUploadedContentURL] = useState<string | null>(null);
  const [isURLCopied, setIsURLCopied] = useState(false);

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
          const docRef = doc(db, 'blog', postId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as BlogPostData;
            setFormData({ ...data, isPublished: data.isPublished ?? false }); 
            setImagePreview(data.coverImageURL);
          } else {
            setError('Blog post not found.');
          }
        } catch (err) { // Line 209: 'err' was defined but not used. Now using it in console.error.
          console.error("Error fetching blog post:", err); 
          setError('Failed to load blog post.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPost();
    }
  }, [postId, isEditMode]);

  // --- DELETE LOGIC (Edit Mode Only) ---
  const handleDelete = async () => {
    if (!postId || !formData.coverImageURL) return;

    if (!confirm(`Are you sure you want to delete the post: "${formData.title}"? This action cannot be undone.`)) {
        return;
    }

    setIsDeleting(true);
    setError('');

    try {
        // 1. Delete Cover Image from Storage (if applicable)
        if (formData.coverImageURL.includes('firebasestorage.googleapis.com')) {
             try {
                const urlPath = formData.coverImageURL.split('/o/')[1];
                const filePath = urlPath.split('?')[0];
                const decodedPath = decodeURIComponent(filePath);
                
                const imageRef = ref(storage, decodedPath);
                await deleteObject(imageRef);
             } catch (storageError) {
                 console.error("Warning: Failed to delete cover image from storage. Continuing with document deletion.", storageError);
             }
        }

        // 2. Delete Document from Firestore
        const docRef = doc(db, 'blog', postId);
        await deleteDoc(docRef);
        
        alert('Blog post deleted successfully!');
        router.push('/admin/blog'); // Redirect to list page

    } catch (err) {
        console.error("Error deleting blog post:", err);
        setError('Failed to delete post. Check console.');
    } finally {
        setIsDeleting(false);
    }
  };


  // --- Handlers ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { 
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // CRITICAL FIX: Dedicated handler for the boolean status select field
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const isPublishedValue = e.target.value === 'Published';
    setFormData(prev => ({ ...prev, isPublished: isPublishedValue }));
    setError('');
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
  
  // NAYA: Handle content image file selection
  const handleContentFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setContentImageFile(e.target.files[0]);
        setUploadedContentURL(null); // Clear previous URL
        setIsURLCopied(false);
    }
  };

  // NAYA: Function to upload content image
  const handleContentImageUpload = async () => {
    if (!contentImageFile) {
        setError('Please select an image file to upload for content.');
        return;
    }

    setContentUploadProgress(0);
    setError('');

    try {
        const storageRef = ref(storage, `blog_content/${Date.now()}_${contentImageFile.name}`); 
        const uploadTask = uploadBytesResumable(storageRef, contentImageFile);
        
        await new Promise<string>((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setContentUploadProgress(Math.round(progress));
                },
                (uploadError) => {
                    console.error("Content image upload failed:", uploadError);
                    setError("Content image upload failed. Please try again.");
                    reject(uploadError);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        }).then(downloadURL => {
            setUploadedContentURL(downloadURL);
            setContentUploadProgress(null);
            setContentImageFile(null);
        });

    } catch (_err: unknown) { // Line 288: 'error' was defined but not used. Changed to '_err' to suppress warning.
        setContentUploadProgress(null);
    }
  };

  // NAYA: Function to copy URL to clipboard
  const copyURLToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsURLCopied(true);
    setTimeout(() => setIsURLCopied(false), 2000); // Reset button after 2 seconds
  };


  // Handle form submission (Save or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || formData.content.trim() === '' || (!imageFile && !formData.coverImageURL && !isEditMode)) {
      setError('Please fill in title, content, and select a cover image.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setUploadProgress(null);

    try {
      let finalImageURL = formData.coverImageURL;

      // 1. Cover Image Upload Logic
      if (imageFile) {
        setUploadProgress(0);
        const storageRef = ref(storage, `blog_covers/${Date.now()}_${imageFile.name}`); 
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (uploadError) => {
              console.error("Cover image upload failed:", uploadError);
              setError("Cover image upload failed. Please try again.");
              reject(uploadError);
            },
            async () => {
              finalImageURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      // 2. Add/Update Document in Firestore
      const postData = {
          title: formData.title,
          slug: formData.slug || formData.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-'), // Better slug generation
          category: formData.category,
          content: formData.content, // Simple string content
          coverImageURL: finalImageURL,
          isPublished: formData.isPublished, // Use boolean value
      };

      if (isEditMode && postId) {
        // Update logic (Edit Mode)
        const docRef = doc(db, 'blog', postId);
        await updateDoc(docRef, postData);
        alert('Blog post updated successfully!');
      } else {
        // Add logic (New Post)
        await addDoc(collection(db, 'blog'), {
          ...postData,
          createdAt: serverTimestamp(),
        });
        alert('Blog post added successfully!');
      }

      router.push('/admin/blog');

    } catch (error: unknown) { 
      setError("Failed to save post data. Check console.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  // Define Page Title
  const pageTitle = isEditMode ? 'Edit Blog Post' : 'Add New Blog Post';

  // Render Loading state (System Integration)
  if (isLoading) {
    return (
      <div>
          <div className={adminStyles.pageHeader}>
              <h1>{pageTitle}</h1>
          </div>
          <div className={adminStyles.loading} style={{ minHeight: '50vh', padding: '10rem 3rem' }}>
              Loading form...
          </div>
      </div>
    );
  }

  // Render the form (The "Whole System")
  return (
    <form onSubmit={handleSubmit}>
      {/* 1. Page Header (Integrated Header) */}
      <div className={adminStyles.pageHeader}>
        <h1>{pageTitle}</h1>
      </div>
      
      {/* 2. Two-Column Editor Structure */}
      <div className={formStyles.formWrapper}>
        
        {/* === LEFT COLUMN: METADATA, COVER IMAGE & CONTENT UPLOADER === */}
        <div className={formStyles.metadataColumn}>
          
          {/* Cover Image Upload */}
          <div className={formStyles.formGroup}>
            <label htmlFor="coverImage">Cover Image *</label>
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
                <span style={{opacity: 0.7, padding: '1rem', display: 'block'}}>{isEditMode ? 'Click Change Image to upload' : 'No Image Selected'}</span>
              )}
              <input
                type="file" id="coverImage" className={formStyles.fileInput}
                onChange={handleFileChange} accept="image/png, image/jpeg, image/webp"
                required={!isEditMode && !formData.coverImageURL} 
              />
              <label htmlFor="coverImage" className={formStyles.uploadButton}>
                {imagePreview ? 'Change Image' : 'Choose Image'}
              </label>
              {uploadProgress !== null && uploadProgress < 100 && ( 
                <p className={formStyles.uploadProgress}>Uploading: {uploadProgress}%</p>
              )}
            </div>
          </div>
          
          {/* NAYA FEATURE: Content Image Uploader */}
          <div className={formStyles.contentImageUploader}>
             <h3 style={{color: 'var(--color-neon-light)', fontSize: '1.2rem', marginBottom: '1rem'}}>Upload Content Images</h3>
             <p style={{marginBottom: '1rem', opacity: 0.8, fontSize: '0.9rem'}}>Upload images here and paste the URL/HTML into the description.</p>

             <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
                <input
                    type="file" id="contentImage" className={formStyles.fileInput}
                    onChange={handleContentFileChange} accept="image/png, image/jpeg, image/webp"
                    style={{ flexGrow: 1 }}
                />
                <label htmlFor="contentImage" className={formStyles.uploadButton} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {contentImageFile ? 'Selected' : 'Select Image'}
                </label>
                 <button 
                    type="button" 
                    onClick={handleContentImageUpload} 
                    className={adminStyles.primaryButton} 
                    disabled={!contentImageFile || contentUploadProgress !== null}
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    {contentUploadProgress !== null ? `${contentUploadProgress}%` : <><FaUpload /> Upload</>}
                </button>
            </div>
            
            {/* Display Uploaded URL/Progress */}
            {contentUploadProgress !== null && contentUploadProgress < 100 && ( 
                <p className={formStyles.uploadProgress} style={{marginTop: '1rem'}}>Uploading: {contentUploadProgress}%</p>
            )}
            
            {uploadedContentURL && (
                <div className={formStyles.uploadedURLContainer}>
                    <p style={{fontWeight: '600', opacity: '0.9'}}>Image URL Ready:</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="text" value={uploadedContentURL} readOnly style={{ padding: '5px', fontSize: '0.85rem' }} />
                        <button type="button" onClick={() => copyURLToClipboard(uploadedContentURL)} className={adminStyles.primaryButton} style={{ padding: '0.6rem', width: 'auto', minWidth: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {isURLCopied ? <FaCheck /> : <FaCopy />} {isURLCopied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p style={{opacity: 0.8, marginTop: '5px', fontSize: '0.8rem'}}>Paste this URL into the content area using the &lt;img&gt; tag or Markdown.</p>
                </div>
            )}

          </div>
        </div>
        
        {/* === RIGHT COLUMN: CONTENT TEXTAREA === */}
        <div className={formStyles.contentColumn}>
          
          {/* Post Title & Slug */}
          <div className={formStyles.metadataGrid} style={{marginBottom: '1.5rem'}}>
              <div className={formStyles.formGroup}>
                <label htmlFor="title">Post Title *</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor="slug">Post Slug (URL)</label>
                <input type="text" id="slug" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="auto-generated if empty" />
              </div>
          </div>
          
          {/* Category Select & Status (Adjusted for Blog needs) */}
          <div className={formStyles.metadataGrid} style={{marginBottom: '1.5rem'}}>
              <div className={formStyles.formGroup}>
                <label htmlFor="category">Category *</label>
                <select id="category" name="category" value={formData.category} onChange={handleInputChange} required >
                    <option>TUTORIAL</option>
                    <option>NEWS</option>
                    <option>TECH</option>
                    <option>BUSINESS</option>
                </select>
              </div>
               <div className={formStyles.formGroup}>
                <label htmlFor="isPublished">Status *</label>
                <select 
                    id="isPublished" 
                    name="isPublished" 
                    value={formData.isPublished ? 'Published' : 'Draft'} 
                    onChange={handleStatusChange} // CRITICAL FIX: Using dedicated handler
                    required 
                >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                </select>
              </div>
          </div>
          
          {/* Content Textarea */}
          <div className={formCommonStyles.fullWidth}>
            <div className={formStyles.formGroup}>
              <label htmlFor="content">Content (HTML / Markdown Supported)</label>
              <textarea 
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange} 
                  required
                  rows={20} 
                  placeholder="Enter blog content. Use HTML tags for formatting (e.g., <h2>, <ul>, <blockquote>), or basic Markdown."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Error Message Display (Full Width) */}
      {error && !isLoading && <p className={formStyles.errorMessage}>{error}</p>}

      {/* 4. Action Buttons Container (Full Width) */}
      <div className={adminStyles.actionButtonsContainer} style={{ marginTop: '3rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', justifyContent: 'space-between' }}>
          {/* Submit/Update Button */}
          <button
            type="submit"
            className={adminStyles.primaryButton}
            disabled={isSubmitting || isLoading || isDeleting}
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Post' : 'Publish Post')}
          </button>
          
          {/* Delete Button (Edit Mode only) */}
          {isEditMode && postId && (
              <button 
                  type="button" 
                  onClick={handleDelete} 
                  className={adminStyles.dangerButton}
                  disabled={isDeleting || isSubmitting}
              >
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
              </button>
          )}
      </div>
      
    </form>
  );
};

export default NewPostForm;