// src/app/admin/portfolio/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
// FIX: useRouter ko hata diya kyunki woh use nahi ho raha
import { db } from '@/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

import styles from '../admin.module.css';
import { FaPlus, FaTrashAlt, FaPen, FaExternalLinkAlt } from 'react-icons/fa'; 

// Type definitions
interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  coverImageURL: string;
  createdAt: Date;
}

// Dummy Categories for filters
const allCategories = ['All', 'Web App', 'Mobile App', 'Finance Solution', 'Custom Software', 'UI/UX Design'];

const AdminPortfolioPage = () => {
  // FIX: useRouter ko hata diya
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // NAYA: Filtering State
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // 1. Fetch Portfolio Items (Real-time)
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
                title: data.title || 'Untitled Project',
                category: data.category || 'Uncategorized',
                coverImageURL: data.coverImageURL || '',
                // Firestore Timestamp ko Date mein convert karna
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(), 
            } as PortfolioItem;
        });
        setItems(fetchedItems);
        setIsLoading(false);
    }, (err) => {
        console.error("Error fetching portfolio items:", err);
        setError("Failed to load portfolio items. Check console.");
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Client-side Filtering Logic
  const filteredItems = items.filter(item => {
      if (activeFilter === 'All') return true;
      return item.category === activeFilter;
  });

  // 3. Delete Logic (Placeholder)
  const handleDelete = (item: PortfolioItem) => {
      if (confirm(`Are you sure you want to delete the portfolio item: "${item.title}"?`)) {
          // Future: Implement Firestore delete and Storage delete here
          alert(`Deleting is not yet implemented. Pretending to delete: ${item.title}`);
      }
  };


  return (
    <>
      <div className={styles.pageHeader}>
        <h1>Manage Portfolio</h1>
        <Link href="/admin/portfolio/new" className={styles.primaryButton}>
          <FaPlus style={{ marginRight: '0.5rem' }}/> New Item
        </Link>
      </div>

      {/* --- Filter Section --- */}
      <div className={styles.dataContainer} style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {allCategories.map(category => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            // Active filter ke liye styling classes use kiye
            className={`${styles.primaryButton} ${activeFilter === category ? styles.activeFilter : ''}`}
            style={{ 
                padding: '0.6rem 1.2rem', 
                backgroundColor: activeFilter === category ? 'var(--color-secondary-accent)' : 'var(--color-dark-navy)',
                color: activeFilter === category ? 'var(--color-off-white)' : 'var(--color-neon-green)',
                border: activeFilter === category ? 'none' : '1px solid var(--color-neon-green)',
                boxShadow: activeFilter === category ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none',
                transform: activeFilter === category ? 'translateY(-3px)' : 'none',
            }}
          >
            {category} ({category === 'All' ? items.length : items.filter(i => i.category === category).length})
          </button>
        ))}
      </div>

      {/* --- Items Table --- */}
      <div className={styles.dataContainer}>
        {isLoading ? (
          <div className={styles.loading}>Loading portfolio items...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : filteredItems.length === 0 ? (
          <p style={{textAlign: 'center', opacity: 0.8}}>No {activeFilter === 'All' ? '' : activeFilter} items found.</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.createdAt.toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/portfolio/edit/${item.id}`} className={styles.actionLink} style={{marginRight: '1rem'}}>
                       <FaPen /> Edit
                    </Link>
                    <a href={`/portfolio/${item.id}`} target="_blank" rel="noopener noreferrer" className={styles.actionLink} style={{marginRight: '1rem', color: 'var(--color-neon-green)'}}>
                       <FaExternalLinkAlt /> View
                    </a>
                    <button 
                        onClick={() => handleDelete(item)} 
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

export default AdminPortfolioPage;