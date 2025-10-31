// src/app/admin/blog/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
// FIX: useRouter import ki zaroorat nahi hai
import { db } from '@/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore'; // FIX: Unused 'where' ko hata diya

import styles from '../admin.module.css';
import { FaPlus, FaTrashAlt, FaPen } from 'react-icons/fa'; 

// Type definitions
interface BlogPost {
  id: string;
  title: string;
  status: 'Draft' | 'Published' | 'Archived';
  category: string;
  createdAt: Date;
}

// Dummy/Fallback data for initial display
const dummyPosts: BlogPost[] = [
    { id: '1', title: 'The Future of Next.js 15', status: 'Published', category: 'Web Development', createdAt: new Date(Date.now() - 86400000 * 5) },
    { id: '2', title: 'Why Choose Firebase for Startups', status: 'Draft', category: 'Backend & Cloud', createdAt: new Date(Date.now() - 86400000 * 2) },
    { id: '3', title: 'UI/UX Trends in Neo-Brutalism', status: 'Published', category: 'Design', createdAt: new Date(Date.now() - 86400000 * 10) },
    { id: '4', title: 'Old Post Archive', status: 'Archived', category: 'Miscellaneous', createdAt: new Date(Date.now() - 86400000 * 30) },
];


const AdminBlogPage = () => {
  // FIX: useRouter ko hata diya
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // NAYA: Filtering State
  const [activeFilter, setActiveFilter] = useState<'All' | 'Draft' | 'Published' | 'Archived'>('All');

  // 1. Fetch Blog Posts (Real-time)
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const postsCollectionRef = collection(db, 'blog');
    const postsQuery = query(
        postsCollectionRef,
        orderBy('createdAt', 'desc')
    );
    
    // Yahan hum filtering ka logic Firestore query mein nahi, client side par rakhenge, 
    // kyunki hamare paas 'All' ka bhi option hai aur post count kam hoga.
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const fetchedPosts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || 'Untitled Post',
                status: data.status || 'Draft',
                category: data.category || 'Uncategorized',
                // Firestore Timestamp ko Date mein convert karna
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(), 
            } as BlogPost;
        });
        setPosts(fetchedPosts);
        setIsLoading(false);
    }, (err) => {
        console.error("Error fetching blog posts:", err);
        setError("Failed to load blog posts. Check console.");
        setPosts(dummyPosts); // Fallback to dummy data on error
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Client-side Filtering Logic
  const filteredPosts = posts.filter(post => {
      if (activeFilter === 'All') return true;
      return post.status === activeFilter;
  });

  // 3. Status Tag utility
  const getStatusClass = (status: BlogPost['status']) => {
    switch (status) {
      case 'Published':
        return styles.statusAccepted; // Status Accepted class use kiya
      case 'Draft':
        return styles.statusPending; // Status Pending class use kiya
      case 'Archived':
        return styles.statusRejected; // Status Rejected class use kiya
      default:
        return styles.statusPending;
    }
  };

  const statusOptions = ['All', 'Published', 'Draft', 'Archived'];

  return (
    <>
      <div className={styles.pageHeader}>
        <h1>Manage Blog Posts</h1>
        <Link href="/admin/blog/new" className={styles.primaryButton}>
          <FaPlus style={{ marginRight: '0.5rem' }}/> New Post
        </Link>
      </div>

      {/* --- Filter Section --- */}
      <div className={styles.dataContainer} style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {statusOptions.map(status => (
          <button
            key={status}
            onClick={() => setActiveFilter(status as 'All' | 'Draft' | 'Published' | 'Archived')}
            // NAYA: Active filter ke liye styling
            className={`${styles.primaryButton} ${activeFilter === status ? styles.activeFilter : ''}`}
            style={{ 
                padding: '0.6rem 1.2rem', 
                backgroundColor: activeFilter === status ? 'var(--color-secondary-accent)' : 'var(--color-dark-navy)',
                color: activeFilter === status ? 'var(--color-off-white)' : 'var(--color-neon-green)',
                border: activeFilter === status ? 'none' : '1px solid var(--color-neon-green)',
                boxShadow: activeFilter === status ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none',
                transform: activeFilter === status ? 'translateY(-3px)' : 'none',
            }}
          >
            {status} ({status === 'All' ? posts.length : posts.filter(p => p.status === status).length})
          </button>
        ))}
      </div>

      {/* --- Posts Table --- */}
      <div className={styles.dataContainer}>
        {isLoading ? (
          <div className={styles.loading}>Loading posts...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : filteredPosts.length === 0 ? (
          <p style={{textAlign: 'center', opacity: 0.8}}>No {activeFilter === 'All' ? '' : activeFilter.toLowerCase()} posts found.</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.category}</td>
                  <td>
                    <span className={`${styles.statusTag} ${getStatusClass(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td>{post.createdAt.toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/blog/edit/${post.id}`} className={styles.actionLink} style={{marginRight: '1rem'}}>
                       <FaPen /> Edit
                    </Link>
                    {/* NAYA: Delete action (functional logic baad mein aayega) */}
                    <button 
                        onClick={() => alert(`Deleting post: ${post.title}`)} 
                        className={styles.actionLink} 
                        style={{ color: '#e74c3c' }}
                    >
                        <FaTrashAlt /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default AdminBlogPage;