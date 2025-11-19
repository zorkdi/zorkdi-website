// src/app/admin/blog/new/NewPostForm.tsx

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
import { FaUpload, FaTrash, FaPlus, FaSearch, FaLink, FaTag } from 'react-icons/fa'; // SEO Icons add kiye

// Styles
import adminStyles from '@/app/admin/admin.module.css'; 
import formStyles from './new-post.module.css'; // Blog specific styles
import formCommonStyles from '@/components/AdminForms/forms.module.css'; // Common form styles


// Naya Interface Content Block ke liye
interface ContentBlock {
  id: string; // Local ID
  headline: string;
  text: string;
  imageURL: string;
  layout: 'text-left-image-right' | 'image-left-text-right' | 'text-only' | 'image-only';
  
  // Local state ke liye
  file?: File | null;
  uploadProgress?: number | null;
}

// Blog Post Data structure update kiya (SEO FIELDS ADDED)
interface BlogPostData {
  title: string;
  slug: string; 
  category: string;
  contentBlocks: ContentBlock[]; 
  coverImageURL: string;
  isPublished: boolean; 
  
  // --- SEO ENGINE FIELDS (New) ---
  seoTitle: string;
  metaDescription: string; 
  focusKeywords: string;
  canonicalUrl: string;
  
  createdAt?: Timestamp; 
}

// Props for the component
interface NewPostFormProps {
  postId?: string; // Optional ID for edit mode
}

// Default data for new post
const initialData: BlogPostData = {
    title: '',
    slug: '',
    category: 'TUTORIAL',
    contentBlocks: [], 
    coverImageURL: '',
    isPublished: false, 
    
    // SEO Defaults
    seoTitle: '',
    metaDescription: '', 
    focusKeywords: '',
    canonicalUrl: '',
};

const NewPostForm = ({ postId }: NewPostFormProps) => {
  const router = useRouter();
  const isEditMode = Boolean(postId);

  const [formData, setFormData] = useState<BlogPostData>(initialData);

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
          const docRef = doc(db, 'blog', postId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as BlogPostData;
            setFormData({ 
                ...initialData, // Default se merge kiya
                ...data, 
                isPublished: data.isPublished ?? false,
                contentBlocks: data.contentBlocks || [],
                // SEO Fields Load karna
                seoTitle: data.seoTitle || '',
                metaDescription: data.metaDescription || '',
                focusKeywords: data.focusKeywords || '',
                canonicalUrl: data.canonicalUrl || '',
            }); 
            setImagePreview(data.coverImageURL);
          } else {
            setError('Blog post not found.');
          }
        } catch (err) { 
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

        // 2. Delete Content Block Images
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
        const docRef = doc(db, 'blog', postId);
        await deleteDoc(docRef);
        
        alert('Blog post deleted successfully!');
        router.push('/admin/blog'); 

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
  
  // === NAYE FUNCTIONS CONTENT BLOCKS KE LIYE ===

  const handleAddBlock = () => {
    const newBlock: ContentBlock = {
        id: Date.now().toString(),
        headline: '',
        text: '',
        imageURL: '',
        layout: 'text-left-image-right',
        file: null,
        uploadProgress: null,
    };
    setFormData(prev => ({
        ...prev,
        contentBlocks: [...prev.contentBlocks, newBlock]
    }));
  };

  const handleRemoveBlock = (id: string) => {
    if (confirm('Are you sure you want to remove this content section?')) {
        setFormData(prev => ({
            ...prev,
            contentBlocks: prev.contentBlocks.filter(block => block.id !== id)
        }));
    }
  };

  const handleBlockChange = (id: string, field: 'headline' | 'text' | 'layout', value: string) => {
    setFormData(prev => ({
        ...prev,
        contentBlocks: prev.contentBlocks.map(block =>
            block.id === id ? { ...block, [field]: value } : block
        )
    }));
  };

  const handleBlockFileChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
          ...prev,
          contentBlocks: prev.contentBlocks.map(block =>
              block.id === id ? { ...block, file: file, imageURL: URL.createObjectURL(file) } : block
          )
      }));
    }
  };
  
  const handleRemoveBlockImage = (id: string) => {
     setFormData(prev => ({
          ...prev,
          contentBlocks: prev.contentBlocks.map(block =>
              block.id === id ? { ...block, file: null, imageURL: '' } : block
          )
      }));
  };
  
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
    if (!formData.title || (!imageFile && !formData.coverImageURL && !isEditMode)) {
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
            `blog_covers/${Date.now()}_${imageFile.name}`,
            (progress) => setCoverUploadProgress(progress)
        );
      }

      // 2. Content Blocks Images Upload
      const uploadedBlocks: ContentBlock[] = [];

      for (const block of formData.contentBlocks) {
          let finalBlockImageURL = block.imageURL;
          if (block.file) {
              finalBlockImageURL = await uploadFile(
                  block.file,
                  `blog_content/${Date.now()}_${block.file.name}`,
                  (progress) => {
                      setFormData(prev => ({
                          ...prev,
                          contentBlocks: prev.contentBlocks.map(b => 
                              b.id === block.id ? { ...b, uploadProgress: progress } : b
                          )
                      }));
                  }
              );
          }
          uploadedBlocks.push({
            id: block.id,
            headline: block.headline,
            text: block.text,
            layout: block.layout,
            imageURL: finalBlockImageURL,
          });
      }

      // Auto-generate slug if not present
      const finalSlug = formData.slug || formData.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      // Fallback for SEO Title
      const finalSeoTitle = formData.seoTitle || formData.title;

      // 3. Firestore Data Save
      const postData = {
          title: formData.title,
          slug: finalSlug,
          category: formData.category,
          coverImageURL: finalCoverImageURL,
          isPublished: formData.isPublished,
          contentBlocks: uploadedBlocks,
          
          // SEO Data Save
          seoTitle: finalSeoTitle,
          metaDescription: formData.metaDescription,
          focusKeywords: formData.focusKeywords,
          canonicalUrl: formData.canonicalUrl,
      };

      if (isEditMode && postId) {
        const docRef = doc(db, 'blog', postId);
        await updateDoc(docRef, postData);
        alert('Blog post updated successfully!');
      } else {
        await addDoc(collection(db, 'blog'), {
          ...postData,
          createdAt: serverTimestamp(),
        });
        alert('Blog post added successfully!');
      }

      router.push('/admin/blog');

    } catch (error: unknown) { 
      const newError = error instanceof Error ? error.message : "Failed to save post data. Check console.";
      setError(newError);
      console.error(newError, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = isEditMode ? 'Edit Blog Post' : 'Add New Blog Post';

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

  return (
    <form onSubmit={handleSubmit}>
      <div className={adminStyles.pageHeader}><h1>{pageTitle}</h1></div>
      
      <div className={formStyles.formWrapper}>
        
        {/* === LEFT COLUMN: METADATA, COVER IMAGE, SEO === */}
        <div className={formStyles.metadataColumn}>
          
          <div className={formCommonStyles.formSection} style={{padding: '2rem'}}>
              <h3 className={formStyles.sectionHeader}>1. Post Status</h3>
              <div className={formStyles.formGroup}>
                <label htmlFor="isPublished">Status *</label>
                <select 
                    id="isPublished" 
                    name="isPublished" 
                    value={formData.isPublished ? 'Published' : 'Draft'} 
                    onChange={handleStatusChange}
                    required 
                >
                    <option value="Draft">Draft (Hidden)</option>
                    <option value="Published">Published (Live)</option>
                </select>
              </div>
          </div>

          {/* === SEO ENGINE (NEW SECTION ADDED HERE) === */}
          <div className={formCommonStyles.formSection} style={{padding: '2rem', border: '1px solid var(--color-neon-green)'}}>
              <h3 className={formStyles.sectionHeader} style={{color: 'var(--color-neon-green)', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <FaSearch /> SEO Engine™
              </h3>
              
              <div className={formStyles.formGroup}>
                  <label style={{fontSize: '0.9rem'}}>SEO Title (Google Blue Link)</label>
                  <input 
                      type="text" 
                      name="seoTitle" 
                      value={formData.seoTitle} 
                      onChange={handleInputChange} 
                      placeholder={formData.title || "Same as Post Title"}
                      className={formStyles.input}
                  />
                  <p className={formStyles.fieldDescription}>Ideally 50-60 characters.</p>
              </div>

              <div className={formStyles.formGroup}>
                  <label style={{fontSize: '0.9rem'}}>Meta Description (Summary)</label>
                  <textarea 
                      name="metaDescription" 
                      value={formData.metaDescription} 
                      onChange={handleInputChange} 
                      rows={3} 
                      maxLength={160} 
                      placeholder="Summary for search results..."
                  />
                  <p className={formStyles.fieldDescription}>{formData.metaDescription.length}/160 characters.</p>
              </div>

              <div className={formStyles.formGroup}>
                  <label style={{fontSize: '0.9rem'}}><FaTag /> Focus Keywords</label>
                  <input 
                      type="text" 
                      name="focusKeywords" 
                      value={formData.focusKeywords} 
                      onChange={handleInputChange} 
                      placeholder="e.g. React, SEO, Web Dev"
                  />
                  <p className={formStyles.fieldDescription}>Comma separated.</p>
              </div>

              <div className={formStyles.formGroup}>
                  <label style={{fontSize: '0.9rem'}}><FaLink /> Canonical URL (Optional)</label>
                  <input 
                      type="text" 
                      name="canonicalUrl" 
                      value={formData.canonicalUrl} 
                      onChange={handleInputChange} 
                      placeholder="https://..."
                  />
              </div>
          </div>
          {/* === END SEO ENGINE === */}
          
          <div className={formCommonStyles.formSection} style={{padding: '2rem'}}>
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
                  <p className={formStyles.uploadProgress}>Uploading: {coverUploadProgress}%</p>
                )}
              </div>
          </div>
        </div>
        
        {/* === RIGHT COLUMN: CONTENT BLOCKS === */}
        <div className={formStyles.contentColumn}>
          
          <div className={formCommonStyles.formSection} style={{padding: '2rem'}}>
              <h3 className={formStyles.sectionHeader}>3. Post Details</h3>
              <div className={formStyles.metadataGrid}>
                  <div className={formStyles.formGroup}>
                    <label htmlFor="title">Post Title *</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                  </div>
                  <div className={formStyles.formGroup}>
                    <label htmlFor="slug">Post Slug (URL)</label>
                    <input type="text" id="slug" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="auto-generated if empty" />
                  </div>
                  <div className={formStyles.formGroup}>
                    <label htmlFor="category">Category *</label>
                    <select id="category" name="category" value={formData.category} onChange={handleInputChange} required >
                        <option>TUTORIAL</option>
                        <option>NEWS</option>
                        <option>TECH</option>
                        <option>BUSINESS</option>
                    </select>
                  </div>
              </div>
          </div>
          
          {/* Naya Content Blocks Section */}
          <div className={formCommonStyles.formSection} style={{padding: '2rem'}}>
              <h3 className={formStyles.sectionHeader}>4. Post Content</h3>
              
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

                    <div className={formStyles.blockGrid}>
                        <div className={formStyles.blockTextFields}>
                            <div className={formCommonStyles.formGroup}>
                              <label htmlFor={`headline-${block.id}`}>Headline (Optional)</label>
                              <input 
                                type="text" 
                                id={`headline-${block.id}`}
                                value={block.headline}
                                onChange={(e) => handleBlockChange(block.id, 'headline', e.target.value)}
                                placeholder="e.g., Step 1: Setting Up Firebase"
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
              
              <button 
                type="button" 
                onClick={handleAddBlock}
                className={adminStyles.secondaryButton} 
                style={{width: '100%', marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}
              >
                <FaPlus /> Add New Section
              </button>
          </div>
        </div>
      </div>

      {/* 3. Error Message Display (Full Width) */}
      {error && !isLoading && <p className={formStyles.errorMessage}>{error}</p>}

      {/* 4. Action Buttons Container (Full Width) */}
      <div className={adminStyles.actionButtonsContainer} style={{ marginTop: '3rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', justifyContent: 'space-between' }}>
          <button
            type="submit"
            className={adminStyles.primaryButton}
            disabled={isSubmitting || isLoading || isDeleting}
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Post' : 'Save Post')}
          </button>
          
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