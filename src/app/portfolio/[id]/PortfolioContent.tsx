// src/app/portfolio/[id]/PortfolioContent.tsx

"use client"; // CRITICAL: Yeh client component hai

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import styles from './portfolio-detail.module.css';
import { useEffect, useState } from 'react'; 
import React from 'react';

// Define Portfolio Item structure
interface PortfolioItem {
  title: string;
  category: string;
  content: string; // This will be HTML
  coverImageURL: string;
  createdAt?: Timestamp;
}

// Props interface
interface PortfolioContentProps {
  id: string; // ID jo Server Component se aayegi
}

// Client Component
const PortfolioContent = ({ id }: PortfolioContentProps) => {
    const [item, setItem] = useState<PortfolioItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data function (ab client side par run hoga)
    const getPortfolioItem = async (docId: string): Promise<PortfolioItem | null> => {
      try {
        const docRef = doc(db, 'portfolio', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return docSnap.data() as PortfolioItem;
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error fetching portfolio item:", error);
        return null;
      }
    }

    useEffect(() => {
        // Fix: Client side par fetching karne se Next.js error nahi aayega
        if (id) {
            getPortfolioItem(id).then(fetchedItem => {
                if (!fetchedItem) {
                    setItem(null); 
                } else {
                    setItem(fetchedItem);
                }
                setIsLoading(false);
            })
            // .catch() block hata diya, kyonki error already console.error mein logged hai
        } else {
            setIsLoading(false);
        }
    }, [id]);

    if (isLoading) {
        // Loading state
        return (
            <main className={styles.main} style={{textAlign: 'center', minHeight: '80vh', paddingTop: '10rem'}}>
                <div style={{color: 'var(--color-neon-green)', fontSize: '2rem'}}>
                    <p style={{marginBottom: '1rem'}}>Loading Project Details...</p>
                    <div style={{
                        display: 'inline-block',
                        width: '40px',
                        height: '40px',
                        border: '4px solid rgba(0, 245, 200, 0.3)',
                        borderTopColor: 'var(--color-neon-green)',
                        borderRadius: '50%',
                        animation: 'spin 1s ease-in-out infinite'
                    }} />
                    {/* CSS for spin animation global CSS mein hona chahiye */}
                </div>
            </main>
        ); 
    }

    // Agar item nahi mila
    if (!item) {
        // notFound() hook ko client component mein use nahi kar sakte,
        // isliye hum custom 404 UI dikhaenge
        return (
            <main className={styles.main} style={{textAlign: 'center', minHeight: '80vh', paddingTop: '10rem'}}>
                <h1 style={{color: '#ff4757'}}>404 - Project Not Found</h1>
                <p style={{marginTop: '1rem', opacity: 0.8}}>The portfolio item you are looking for does not exist.</p>
            </main>
        );
    }
    
    // ImageRow class ko replace karne ke liye, taaki CSS apply ho.
    // NOTE: Agar aapne pichle baar portfolio-detail.module.css ko replace kar diya hai,
    // toh images aur typography ab theek dikhne chahiye.
    const contentWithImageRow = item.content.replace(/<div class="ImageRow"/g, `<div class="ImageRow ${styles.imageRow}"`);


    return (
        <main className={styles.main}>
          <article>
            {/* Cover Image */}
            <div className={styles.coverImageContainer}>
              {item.coverImageURL && (
                <Image
                  src={item.coverImageURL}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority 
                  sizes="(max-width: 768px) 100vw, 900px" 
                />
              )}
            </div>

            {/* Title and Category */}
            <h1 className={styles.projectTitle}>{item.title}</h1>
            <p className={styles.projectCategory}>{item.category}</p>

            {/* Formatted Content (Rendered from HTML) */}
            <div
              className={styles.projectContent} 
              dangerouslySetInnerHTML={{ __html: contentWithImageRow }} 
            />
          </article>
        </main>
    );
};

export default PortfolioContent;
