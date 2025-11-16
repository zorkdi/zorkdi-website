// src/app/admin/case-studies/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

// Admin styles
import adminStyles from '../admin.module.css';
// FIX: File ka naam theek kar diya hai
import styles from './case-studies-admin.module.css';
import { FaPlus } from 'react-icons/fa';

// Case Study ka data structure
interface CaseStudy {
  id: string;
  title: string;
  category: string;
  coverImageURL: string;
  createdAt: Timestamp | null;
}

const CaseStudiesAdminPage = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Firestore se data fetch karna
  useEffect(() => {
    const fetchCaseStudies = async () => {
      setIsLoading(true);
      setError('');
      try {
        const q = query(collection(db, 'caseStudies'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const studiesList: CaseStudy[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'No Title',
            category: data.category || 'Uncategorized',
            coverImageURL: data.coverImageURL || '',
            createdAt: data.createdAt || null,
          };
        });
        
        setCaseStudies(studiesList);
      } catch (err) {
        console.error("Error fetching case studies:", err);
        setError('Failed to load case studies. Please check the console.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaseStudies();
  }, []);

  // Helper function to format date
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'No Date';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className={adminStyles.pageHeader}>
        <h1>Case Studies</h1>
        <Link href="/admin/case-studies/new" className={adminStyles.primaryButton} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <FaPlus /> Add New Study
        </Link>
      </div>

      {isLoading && <div className={adminStyles.loading}>Loading Case Studies...</div>}
      {error && <div className={adminStyles.errorMessage}>{error}</div>}

      {!isLoading && !error && (
        <div className={adminStyles.dataContainer}>
          <table className={adminStyles.dataTable}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {caseStudies.length > 0 ? (
                caseStudies.map(study => (
                  <tr key={study.id}>
                    <td>
                      {study.coverImageURL ? (
                        <Image
                          src={study.coverImageURL}
                          alt={study.title}
                          width={120}
                          height={70}
                          className={styles.imagePreview}
                        />
                      ) : (
                        <div className={styles.noImage}>No Image</div>
                      )}
                    </td>
                    <td className={styles.titleColumn}>{study.title}</td>
                    <td className={styles.categoryColumn}>{study.category}</td>
                    <td>{formatDate(study.createdAt)}</td>
                    <td>
                      <Link 
                        href={`/admin/case-studies/edit/${study.id}`} 
                        className={adminStyles.actionLink}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  {/* === FIX YAHAN HAI === */}
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                    No case studies found. Click &apos;Add New Study&apos; to get started.
                  </td>
                  {/* ===================== */}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default CaseStudiesAdminPage;