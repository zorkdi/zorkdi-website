// src/app/admin/blog/edit/[postId]/page.tsx

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Firebase services
import { db, storage } from '@/firebase';
import { doc, getDoc, updateDoc, Timestamp, deleteDoc } from 'firebase/firestore'; // deleteDoc added
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// Styles
import adminStyles from '../../../admin.module.css'; // Correct path to admin styles
import newPostStyles from '../../new/new-post.module.css'; // Reuse styles from new post page

// Dynamically import the editor
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

// Define the structure for post data
interface PostData {
  title: string;
  slug: string;
  category: string;
  content: string;
  coverImageURL: string;
  publishedAt?: Timestamp; // Make optional for initial state
}

const EditPostPage = () => {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;

  // State for form data
  const [postData, setPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // States for image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // State for delete loading

  // Fetch existing post data
  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        setLoading(true); // Start loading
        setError(''); // Reset error
        try {
          const postDocRef = doc(db, 'blogs', postId);
          const docSnap = await getDoc(postDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as PostData;
            setPostData(data);
            setImagePreview(data.coverImageURL); // Set initial image preview
          } else {
            setError('Blog post not found.');
          }
        } catch (err) {
          console.error("Error fetching post:", err);
          setError('Failed to load blog post.');
        } finally {
          setLoading(false); // Stop loading
        }
      };
      fetchPost();
    }
  }, [postId]);

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPostData(prev => {
        if (!prev) return null; // Should not happen if loading is false
        const newData = { ...prev, [name]: value };
        // Update slug automatically based on title
        if (name === 'title') {
            newData.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);
        }
        return newData;
    });
  };

  // Handle editor content change
  const handleEditorChange = (htmlContent: string) => {
    setPostData(prev => prev ? { ...prev, content: htmlContent } : null);
  };

  // Handle new image selection
   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); // Store the new file
      setImagePreview(URL.createObjectURL(file)); // Show preview of new image
    }
  };

  // Handle updating the post
  const handleUpdate = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!postData || !postId) { setError('Post data is missing.'); return; }
     if (!postData.title || !postData.content || postData.content === '<p></p>') { setError('Please fill in title and content.'); return; } // Added check for empty editor
     if (!imagePreview) { setError('Please ensure a cover image is present.'); return; } // Ensure image exists

     setIsUpdating(true); setError(''); setUploadProgress(null);
     try {
         let newImageURL = postData.coverImageURL; // Assume old URL initially

         // === Step 1: If a new image was selected, upload it ===
         if (imageFile) {
             setUploadProgress(0);
             const storageRef = ref(storage, `blog_covers/${Date.now()}_${imageFile.name}`);
             const uploadTask = uploadBytesResumable(storageRef, imageFile);

             // Wait for upload to complete
             await new Promise<void>((resolve, reject) => {
                 uploadTask.on('state_changed',
                     (snapshot) => {
                         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                         setUploadProgress(Math.round(progress));
                     },
                     (uploadError) => {
                         console.error("Image upload failed:", uploadError);
                         setError("Image upload failed. Please try again.");
                         reject(uploadError); // Reject the promise on error
                     },
                     async () => {
                         newImageURL = await getDownloadURL(uploadTask.snapshot.ref);
                         resolve(); // Resolve the promise on completion
                     }
                 );
             });
         }

         // === Step 2: Update Firestore document with new data ===
         const postDocRef = doc(db, 'blogs', postId);
         await updateDoc(postDocRef, {
             title: postData.title,
             slug: postData.slug,
             category: postData.category,
             content: postData.content,
             coverImageURL: newImageURL, // Use the potentially new URL
         });

         alert('Post updated successfully!');
         router.push('/admin/blog'); // Go back to the blog list

     } catch (err) {
         // Error during upload or Firestore update
         console.error("Failed to update post:", err);
         setError("Failed to update post. Check console for details.");
     } finally {
         setIsUpdating(false);
     }
 };


  // Handle deleting the post
  const handleDelete = async () => {
      if (!postData || !postId) return;

      if (!window.confirm(`Are you sure you want to delete the post "${postData.title}"? This cannot be undone.`)) {
          return;
      }

      setIsDeleting(true); setError('');

      try {
          // Step 1: Delete the cover image from Firebase Storage
          if (postData.coverImageURL) {
              try {
                  // IMPORTANT: Use refFromURL to get the correct reference for deletion
                  const imageRef = ref(storage, postData.coverImageURL);
                  await deleteObject(imageRef);
                  console.log("Cover image deleted successfully.");
              } catch (storageError: any) {
                  // Handle cases where the image URL might be invalid or already deleted
                  if (storageError.code === 'storage/object-not-found') {
                     console.warn("Cover image not found in storage, might be already deleted or URL is invalid.");
                  } else {
                     console.error("Could not delete cover image:", storageError);
                     // Optionally, you might still want to proceed with Firestore deletion
                     // or show a more specific error to the user.
                     // setError("Failed to delete cover image, but trying to delete post data.");
                  }
              }
          }

          // Step 2: Delete the post document from Firestore
          const postDocRef = doc(db, 'blogs', postId);
          await deleteDoc(postDocRef);
          console.log("Firestore document deleted successfully.");

          alert('Post deleted successfully!');
          router.push('/admin/blog'); // Go back to the blog list

      } catch (err) {
          console.error("Failed to delete post:", err);
          setError("Failed to delete post. Check console for details.");
      } finally {
          setIsDeleting(false);
      }
  };


  if (loading) { return <div className={adminStyles.loading}>Loading post data...</div>; } // Use admin loading style
  if (error && !postData) { return <div className={adminStyles.errorMessage}>{error}</div>; }
  if (!postData) { return <div>Could not load post data.</div>; }

  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <h1>Edit Blog Post</h1>
      </div>
      <div className={adminStyles.dataContainer}>
        <form onSubmit={handleUpdate}>
          {/* Image Upload/Preview Section */}
          <div className={newPostStyles.formGroup}>
            <label htmlFor="coverImage">Cover Image (Click image to change)</label>
            <div className={newPostStyles.imageUploadSection}>
              <label htmlFor="coverImage" style={{ cursor: 'pointer' }}>
                {imagePreview ? (
                    <Image src={imagePreview} alt="Current Cover" width={300} height={169} className={newPostStyles.imagePreview} />
                ) : (
                    <span>No Image Available</span> // Placeholder if no image
                )}
              </label>
              <input type="file" id="coverImage" className={newPostStyles.fileInput} onChange={handleFileChange} accept="image/png, image/jpeg" />
              {uploadProgress !== null && <p className={newPostStyles.uploadProgress}>Uploading: {uploadProgress}%</p>}
            </div>
          </div>
          {/* Title */}
          <div className={newPostStyles.formGroup}> <label htmlFor="title">Post Title</label> <input type="text" name="title" value={postData.title} onChange={handleInputChange} required /> </div>
          {/* Slug */}
          <div className={newPostStyles.formGroup}> <label htmlFor="slug">Post Slug (URL)</label> <input type="text" name="slug" value={postData.slug} onChange={handleInputChange} required readOnly /> </div>
          {/* Category */}
          <div className={newPostStyles.formGroup}> <label htmlFor="category">Category</label> <select name="category" value={postData.category} onChange={handleInputChange}> <option>TUTORIAL</option> <option>WEB SECURITY</option> <option>FIREBASE</option> <option>SOFTWARE DESIGN</option> <option>TECHNOLOGY</option> </select> </div>
          {/* Content Editor */}
          <div className={newPostStyles.formGroup}> <label>Content</label>
            {/* Conditional rendering for RichTextEditor */}
            {postData.content !== undefined ? (
                <RichTextEditor
                    content={postData.content}
                    onChange={handleEditorChange}
                />
            ) : (
                <p>Loading editor content...</p> // Show loading while content is undefined
            )}
           </div>
          {error && <p className={newPostStyles.errorMessage}>{error}</p>}
          {/* Action Buttons */}
          <div className={adminStyles.actionButtonsContainer}>
            <button type="submit" className={`${adminStyles.primaryButton}`} disabled={isUpdating || isDeleting}> {isUpdating ? 'Updating...' : 'Update Post'} </button>
            <button type="button" onClick={handleDelete} className={`${adminStyles.dangerButton}`} disabled={isUpdating || isDeleting}> {isDeleting ? 'Deleting...' : 'Delete Post'} </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;