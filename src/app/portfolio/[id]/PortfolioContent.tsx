// src/app/portfolio/[id]/PortfolioContent.tsx

"use client"; 

import Image from 'next/image';
import { db } from '@/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import styles from './portfolio-detail.module.css'; 
import { useEffect, useState } from 'react'; 
import React from 'react';
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper'; 

// Naya Interface Content Block ke liye
interface ContentBlock {
  id: string;
  headline: string;
  text: string;
  imageURL: string;
  layout: 'text-left-image-right' | 'image-left-text-right' | 'text-only' | 'image-only';
}

// Portfolio Item structure update kiya
interface PortfolioItem {
  title: string;
  category: string;
  contentBlocks: ContentBlock[]; // 'content' ko 'contentBlocks' se badla
  coverImageURL: string;
  createdAt?: Timestamp;
}

// Props interface
interface PortfolioContentProps {
  id: string; // ID jo Server Component se aayegi
}

// Helper function jo text ko paragraphs mein badlega
const renderTextWithParagraphs = (text: string) => {
    // Har line break ko <p> tag se replace karo
    return text.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
    ));
};


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
          // Data ko naye structure ke hisaab se type cast kiya
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
        if (id) {
            getPortfolioItem(id).then(fetchedItem => {
                if (!fetchedItem) {
                    setItem(null); 
                } else {
                    setItem(fetchedItem);
                }
                setIsLoading(false);
            })
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
                </div>
            </main>
        ); 
    }

    // Agar item nahi mila
    if (!item) {
        return (
            <main className={styles.main} style={{textAlign: 'center', minHeight: '80vh', paddingTop: '10rem'}}>
                <h1 style={{color: '#ff4757'}}>404 - Project Not Found</h1>
                <p style={{marginTop: '1rem', opacity: 0.8}}>The portfolio item you are looking for does not exist.</p>
            </main>
        );
    }
    
    return (
        <main className={styles.main}>
          <article>
            {/* Cover Image */}
            <AnimationWrapper>
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
            </AnimationWrapper>

            {/* Title and Category */}
            <AnimationWrapper>
                <h1 className={styles.projectTitle}>{item.title}</h1>
                <p className={styles.projectCategory}>{item.category}</p>
            </AnimationWrapper>

            {/* Naya Content Blocks Renderer */}
            <div className={styles.projectContent}>
                {/* Loop over contentBlocks */}
                {(item.contentBlocks || []).map((block, index) => {
                    
                    const hasText = block.text && block.text.trim() !== '';
                    const hasImage = block.imageURL && block.imageURL.trim() !== '';
                    const hasHeadline = block.headline && block.headline.trim() !== '';

                    // Block ke text content ko render karna
                    const textContent = (
                        <div className={styles.textBlock}>
                            <AnimationWrapper delay={index * 0.1}>
                                {hasHeadline && <h2>{block.headline}</h2>}
                                {hasText && renderTextWithParagraphs(block.text)}
                            </AnimationWrapper>
                        </div>
                    );
                    
                    // Block ke image content ko render karna
                    const imageContent = (
                        <div className={styles.imageBlock}>
                            <AnimationWrapper delay={index * 0.1 + 0.1}>
                                {hasImage && (
                                    <Image 
                                        src={block.imageURL} 
                                        alt={block.headline || 'Portfolio Content Image'} 
                                        width={500} 
                                        height={300} 
                                        style={{width: '100%', height: 'auto', borderRadius: '8px'}}
                                    />
                                )}
                            </AnimationWrapper>
                        </div>
                    );
                    
                    // === YAHAN CHANGE KIYA GAYA HAI ===
                    // Ab hum 'className' ko 'div' par laga rahe hain
                    // Aur element order ko change kar rahe hain

                    switch (block.layout) {
                        case 'text-left-image-right':
                            return (
                                <div key={block.id} className={styles.layoutRow}>
                                    {textContent}
                                    {imageContent}
                                </div>
                            );
                        
                        case 'image-left-text-right':
                            return (
                                <div key={block.id} className={styles.layoutRow}>
                                    {imageContent}
                                    {textContent}
                                </div>
                            );
                        
                        case 'image-only':
                            return (
                                <div key={block.id} className={styles.layoutFullWidthImage}>
                                    {imageContent}
                                </div>
                            );
                            
                        case 'text-only':
                        default:
                             return (
                                <div key={block.id} className={styles.layoutFullWidthText}>
                                    {textContent}
                                </div>
                            );
                    }
                })}
            </div>
          </article>
        </main>
    );
};

export default PortfolioContent;