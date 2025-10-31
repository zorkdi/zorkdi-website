// src/app/admin/blog/edit/[postId]/page.tsx

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Firebase services
import { db, storage } from '@/firebase';
import {
  doc, getDoc, updateDoc, Timestamp, deleteDoc
  // FIX: Unused imports (collection, addDoc, serverTimestamp) ko hata diya
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// Dynamically import the editor
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

// Styles
import adminStyles from '@/app/admin/admin.module.css'; 
import formStyles from '@/app/admin/portfolio/new/portfolio-form.module.css'; // Reusing Portfolio form styles
import formCommonStyles from '@/components/AdminForms/forms.module.css'; // Common form styles

// Define the structure for blog post data from Firestore
interface BlogPostData {
  title: string;
  category: string;
  status: 'Draft' | 'Published' | 'Archived';
  content: string;
  coverImageURL: string;
  createdAt?: Timestamp; // Optional existing timestamp
}

// Props for the component
interface EditPostPageProps {
  params: {
      postId: string; // ID for edit mode
  }
}

// Dummy Categories for options
const categories = [
    'Web Development', 'Mobile App', 'UI/UX Design', 'Backend & Cloud', 'Miscellaneous'
];
const statuses = ['Draft', 'Published', 'Archived'];


const AdminEditPostPage = ({ params }: EditPostPageProps) => {
  const { postId } = params;
  const router = useRouter();

  // State for form data
  const [formData, setFormData] = useState<BlogPostData>({
    title: '',
    category: 'Web Development', 
    status: 'Draft',
    content: '',
    coverImageURL: '',
  });

  // State for image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Fetch data if in edit mode
  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        setIsLoading(true);
        setError('');
        try {
          const docRef = doc(db, 'blog', postId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
                title: data.title,
                category: data.category,
                status: data.status,
                content: data.content,
                coverImageURL: data.coverImageURL,
                createdAt: data.createdAt,
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
  }, [postId]);

  // --- DELETE LOGIC ---
  const handleDelete = async () => {
    if (!postId) return;

    if (!confirm(`Are you sure you want to delete the post: "${formData.title}"? This action cannot be undone.`)) {
        return;
    }

    setIsDeleting(true);
    setError('');

    try {
        // 1. Delete Image from Storage (if applicable)
        if (formData.coverImageURL.includes('firebasestorage.googleapis.com')) {
             try {
                const urlPath = formData.coverImageURL.split('/o/')[1];
                const filePath = urlPath.split('?')[0];
                const decodedPath = decodeURIComponent(filePath);
                
                const imageRef = ref(storage, decodedPath);
                await deleteObject(imageRef);
             } catch (storageError) {
                 console.error("Warning: Failed to delete image from storage. Continuing with document deletion.", storageError);
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


  // Handle standard input/select changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // FIX: Directly assigning value, TypeScript will usually handle this context
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

  // Handle form submission (Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || formData.content === '<p></p>') {
      setError('Please fill in title and content.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setUploadProgress(null);

    try {
      let finalImageURL = formData.coverImageURL;

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
      } 
      
      const docRef = doc(db, 'blog', postId);
      await updateDoc(docRef, {
        title: formData.title,
        category: formData.category,
        status: formData.status,
        content: formData.content,
        coverImageURL: finalImageURL,
      });
      alert('Blog post updated successfully!');

      router.push('/admin/blog');

    } catch (firebaseError: unknown) { // FIX: Changed 'any' to 'unknown'
      const errorMessage = firebaseError instanceof Error ? firebaseError.message : 'An unknown error occurred during submission.';
      console.error("Failed to update post:", firebaseError);
      if (!error) { 
         setError(`Failed to save post data: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Loading state
  if (isLoading) {
    return <div className={adminStyles.loading}>Loading post data...</div>;
  }
   // Render Error state
  if (error && !isSubmitting && !isDeleting) {
    return <div className={adminStyles.errorMessage}>{error}</div>;
  }

  // Render the form
  return (
    <>
      <div className={adminStyles.pageHeader}>
        <h1>Edit Blog Post: {formData.title}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        
        {/* Cover Image Upload */}
        <div className={formStyles.formGroup}>
          <label htmlFor="coverImage">Cover Image</label>
          <div className={formStyles.imageUploadSection}>
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Cover preview"
                width={400} height={225} // 16:9 ratio
                className={formStyles.imagePreview}
              />
            ) : (
               <span>No Image Selected</span>
            )}
            <input
              type="file" id="coverImage" className={formStyles.fileInput}
              onChange={handleFileChange} accept="image/png, image/jpeg, image/webp"
            />
            <label htmlFor="coverImage" className={formStyles.uploadButton}>
              {imagePreview ? 'Change Image' : 'Choose Image'}
            </label>
            {uploadProgress !== null && uploadProgress < 100 && ( 
              <p className={formStyles.uploadProgress}>Uploading: {uploadProgress}%</p>
            )}
          </div>
        </div>

        {/* Post Title */}
        <div className={formStyles.formGroup}>
          <label htmlFor="title">Post Title *</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
        </div>

        {/* Category and Status Grid */}
        <div className={formCommonStyles.formGrid}>
            <div className={formStyles.formGroup}>
              <label htmlFor="category">Category *</label>
              <select id="category" name="category" value={formData.category} onChange={handleInputChange} required >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
             <div className={formStyles.formGroup}>
              <label htmlFor="status">Status *</label>
              <select id="status" name="status" value={formData.status} onChange={handleInputChange} required >
                {statuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
              </select>
            </div>
        </div>


        {/* Content (Rich Text Editor) */}
        <div className={formCommonStyles.fullWidth} style={{ marginTop: '1.5rem' }}>
          <div className={formStyles.formGroup}>
            <label htmlFor="content">Content *</label>
            {(formData.content !== undefined) && (
                 <RichTextEditor
                   content={formData.content}
                   onChange={handleEditorChange}
                 />
            )}
          </div>
        </div>


        {/* Error Message Display */}
        {error && !isLoading && <p className={formStyles.errorMessage}>{error}</p>}

        {/* Action Buttons Container */}
        <div className={adminStyles.actionButtonsContainer} style={{ marginTop: '2rem' }}>
            {/* Submit/Update Button */}
            <button
              type="submit"
              className={adminStyles.primaryButton}
              disabled={isSubmitting || isLoading || isDeleting}
            >
              {isSubmitting ? 'Updating...' : 'Update Post'}
            </button>
            
            {/* Delete Button */}
            <button 
                type="button" 
                onClick={handleDelete} 
                className={adminStyles.dangerButton}
                disabled={isDeleting || isSubmitting}
            >
                {isDeleting ? 'Deleting...' : 'Delete Post'}
            </button>
        </div>
        
      </form>
    </>
  );
};

export default AdminEditPostPage;