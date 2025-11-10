// src/app/admin/portfolio/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// import { useRouter } from 'next/navigation'; // <-- YAHAN SE HATA DIYA (Warning fix)
import { db, storage } from '@/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp, doc, deleteDoc } from 'firebase/firestore'; 
import { ref, deleteObject } from 'firebase/storage';

import styles from './portfolio-list.module.css'; // Naya CSS
import adminStyles from '../admin.module.css'; // Common Admin CSS
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa'; 

// Portfolio item ke naye structure ka interface
interface ContentBlock {
  id: string;
  headline: string;
  text: string;
  imageURL: string;
  layout: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  coverImageURL: string;
  contentBlocks: ContentBlock[]; // contentBlocks zaroori hai images delete karne ke liye
  createdAt: Timestamp;
}

const PortfolioListPage = () => {
    const [posts, setPosts] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // const router = useRouter(); // <-- YAHAN SE HATA DIYA (Warning fix)

    // 1. Firebase se data fetch karna (real-time)
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const itemsCollectionRef = collection(db, 'portfolio');
        const itemsQuery = query(
            itemsCollectionRef,
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    category: data.category,
                    coverImageURL: data.coverImageURL,
                    contentBlocks: data.contentBlocks || [], // contentBlocks ko fetch karna
                    createdAt: data.createdAt,
                } as PortfolioItem;
            });
            setPosts(fetchedItems);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching portfolio list:", err);
            setError("Failed to fetch portfolio items. Check console.");
            setIsLoading(false);
        });

        // Cleanup listener
        return () => unsubscribe();
    }, []);

    // 2. Helper function (Storage se file delete karne ke liye)
    const deleteFileFromStorage = async (fileURL: string) => {
        if (!fileURL || !fileURL.includes('firebasestorage.googleapis.com')) {
            return; // Yeh Firebase URL nahi hai, skip karo
        }
        try {
            const urlPath = fileURL.split('/o/')[1];
            const filePath = urlPath.split('?')[0];
            const decodedPath = decodeURIComponent(filePath);
            const imageRef = ref(storage, decodedPath);
            await deleteObject(imageRef);
        } catch (storageError: unknown) { // <-- YAHAN CHANGE KIYA GAYA HAI (any se unknown)
            // Agar image pehle se delete ho gayi hai toh error mat dikhao
            // Type-safe check
            if (typeof storageError === 'object' && storageError !== null && 'code' in storageError && (storageError as {code: string}).code !== 'storage/object-not-found') {
                 console.warn(`Warning: Failed to delete image ${fileURL}.`, storageError);
            }
        }
    };

    // 3. Delete function (Post + Saari Images)
    const handleDelete = async (post: PortfolioItem) => {
        if (isDeleting) return;
        
        if (!window.confirm(`Are you sure you want to delete the project: "${post.title}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            // Step 1: Cover Image delete karo
            await deleteFileFromStorage(post.coverImageURL);

            // Step 2: Saari Content Block images delete karo
            if (post.contentBlocks && post.contentBlocks.length > 0) {
                for (const block of post.contentBlocks) {
                    await deleteFileFromStorage(block.imageURL);
                }
            }

            // Step 3: Firestore se document delete karo
            const docRef = doc(db, 'portfolio', post.id);
            await deleteDoc(docRef);
            
            alert('Portfolio project deleted successfully!');

        } catch (err) {
            console.error("Error deleting portfolio item:", err);
            setError('Failed to delete project. Check console.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {/* Header: Title + New Post Button */}
            <div className={styles.header}>
                <h1>Manage Portfolio</h1>
                <Link href="/admin/portfolio/new" className={styles.newPostButton}>
                    <FaPlus /> New Project
                </Link>
            </div>

            {error && <p className={adminStyles.errorMessage}>{error}</p>}
            
            {isLoading ? (
                <div className={styles.loading}>Loading projects...</div>
            ) : (
                <div className={styles.tableContainer}>
                    {posts.length === 0 ? (
                        <div className={styles.noPosts}>No portfolio projects found.</div>
                    ) : (
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Cover Image</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr key={post.id}>
                                        <td data-label="Cover">
                                            {post.coverImageURL ? (
                                                <Image
                                                    src={post.coverImageURL}
                                                    alt={post.title}
                                                    width={100}
                                                    height={60}
                                                    className={styles.coverImage}
                                                />
                                            ) : (
                                                <span>No Image</span>
                                            )}
                                        </td>
                                        <td data-label="Title">{post.title}</td>
                                        <td data-label="Category">{post.category}</td>
                                        <td data-label="Actions">
                                            <div className={styles.actionsCell}>
                                                <Link href={`/admin/portfolio/edit/${post.id}`} className={styles.editButton}>
                                                    <FaPen /> Edit
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(post)} 
                                                    className={styles.deleteButton}
                                                    disabled={isDeleting}
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </>
    );
};

export default PortfolioListPage;