// src/app/admin/blog/new/page.tsx

"use client";

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic'; // NAYA: Dynamic import ke liye

// Firebase services import kiye
import { db, storage } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Styles import kiye
import adminStyles from '../../admin.module.css';
import styles from './new-post.module.css';

// NAYA: RichTextEditor ko dynamically import kiya
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor/RichTextEditor'), {
  ssr: false, // Server-Side Rendering ko band kar diya
  loading: () => <p>Loading editor...</p>, // Editor load hone tak yeh dikhega
});

const NewPostPage = () => {
  const router = useRouter();

  // Form data ke liye state
  const [postData, setPostData] = useState({
    title: '',
    slug: '',
    category: 'TUTORIAL',
    content: '',
  });

  // Image upload ke liye states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');

  // Form fields change hone par state update karna
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setPostData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'title') {
        newData.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);
      }
      return newData;
    });
  };

  // Editor se content (HTML) aane par state update karna
  const handleEditorChange = (htmlContent: string) => {
    setPostData(prev => ({ ...prev, content: htmlContent }));
  };

  // Image select hone par preview dikhana
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Post publish karne ki poori logic
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postData.title || postData.content === '<p></p>' || !imageFile) {
      setError('Please fill in all fields and select a cover image.');
      return;
    }
    
    setIsPublishing(true);
    setError('');
    setUploadProgress(0);

    const storageRef = ref(storage, `blog_covers/${Date.now()}_${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      }, 
      (uploadError) => {
        console.error("Image upload failed:", uploadError);
        setError("Image upload failed. Please try again.");
        setIsPublishing(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        try {
          await addDoc(collection(db, 'blogs'), {
            ...postData,
            coverImageURL: downloadURL,
            publishedAt: serverTimestamp(),
          });
          
          router.push('/admin/blog');
        } catch (firestoreError) {
          console.error("Failed to save post:", firestoreError);
          setError("Failed to save the post to the database.");
          setIsPublishing(false);
        }
      }
    );
  };

  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <h1>Add New Blog Post</h1>
      </div>

      <div className={adminStyles.dataContainer}>
        <form onSubmit={handlePublish}>
          <div className={styles.formGroup}>
            <label htmlFor="coverImage">Cover Image</label>
            <div className={styles.imageUploadSection}>
              {imagePreview && <Image src={imagePreview} alt="Image preview" width={300} height={169} className={styles.imagePreview} />}
              <input type="file" id="coverImage" className={styles.fileInput} onChange={handleFileChange} accept="image/png, image/jpeg" />
              <label htmlFor="coverImage" className={styles.uploadButton}>Choose Image</label>
              {uploadProgress !== null && <p className={styles.uploadProgress}>Uploading: {uploadProgress}%</p>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title">Post Title</label>
            <input type="text" name="title" value={postData.title} onChange={handleInputChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slug">Post Slug (URL)</label>
            <input type="text" name="slug" value={postData.slug} onChange={handleInputChange} required readOnly />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <select name="category" value={postData.category} onChange={handleInputChange}>
              <option>TUTORIAL</option>
              <option>WEB SECURITY</option>
              <option>FIREBASE</option>
              <option>SOFTWARE DESIGN</option>
              <option>TECHNOLOGY</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content">Content</label>
            <RichTextEditor
              content={postData.content}
              onChange={handleEditorChange}
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={`${adminStyles.primaryButton} ${styles.publishButton}`} disabled={isPublishing}>
            {isPublishing ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPostPage;