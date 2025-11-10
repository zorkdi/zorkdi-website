// src/app/blog/[slug]/BlogContent.tsx

"use client"; // CRITICAL: Yeh client component hai

import Image from 'next/image';
import { db } from '@/firebase';
// === YAHAN CHANGE KIYA GAYA HAI ===
import { Timestamp, collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore'; 
import styles from '@/app/blog/[slug]/blog-detail.module.css'; // Is file ko hum agle step mein update karenge
import { useEffect, useState } from 'react'; 
import React from 'react';
import { FaCalendarAlt, FaTag, FaSpinner } from 'react-icons/fa'; 
import Link from 'next/link';
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper'; // AnimationWrapper import kiya

// === YAHAN CHANGE KIYA GAYA HAI ===

// Naya Interface Content Block ke liye
interface ContentBlock {
  id: string;
  headline: string;
  text: string;
  imageURL: string;
  layout: 'text-left-image-right' | 'image-left-text-right' | 'text-only' | 'image-only';
}

// Blog Post structure update kiya
interface BlogPost {
  title: string;
  category: string;
  // content: string; // <-- Hata diya
  contentBlocks: ContentBlock[]; // <-- Add kiya
  coverImageURL: string;
  createdAt: Timestamp | null;
  isPublished: boolean; // Yeh bhi check kar sakte hain
}

// Props interface
interface BlogContentProps {
  slug: string; // Slug jo Server Component se aayega
}

// Helper function jo text ko paragraphs mein badlega
const renderTextWithParagraphs = (text: string) => {
    // Har line break ko <p> tag se replace karo
    return text.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
    ));
};


// Client Component
const BlogContent = ({ slug }: BlogContentProps) => {
    const [post, setPost] = useState<BlogPost | null>(null); 
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data function
    const getBlogPostBySlug = async (postSlug: string): Promise<BlogPost | null> => {
      try {
        const blogCollectionRef = collection(db, 'blog'); 
        
        const q = query(
            blogCollectionRef, 
            where('slug', '==', postSlug), 
            // where('isPublished', '==', true), // Isko enable kar sakte hain production mein
            limit(1)
        );

        const querySnapshot = await getDocs(q); 
        
        if (querySnapshot.empty) {
            // Slug se nahi mila, toh ID se try karo (fallback)
            try {
                const docRef = doc(db, 'blog', postSlug);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return {
                        ...docSnap.data(),
                        createdAt: docSnap.data().createdAt || null,
                    } as BlogPost;
                }
            } catch (idError) {
                console.error("Not found by slug, and failed to find by ID:", idError);
                return null;
            }
            return null; // Dono se nahi mila
        }

        // Post milne par
        const docSnap = querySnapshot.docs[0];
        return {
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt || null,
        } as BlogPost;

      } catch (error) {
        console.error("Error fetching blog post:", error);
        return null;
      }
    }

    useEffect(() => {
        if (slug) {
            getBlogPostBySlug(slug).then(fetchedPost => {
                setPost(fetchedPost);
                setIsLoading(false);
            })
        } else {
            setIsLoading(false);
        }
    }, [slug]);


    // Helper for formatting date
    const formatDate = (timestamp: Timestamp | null) => {
        if (!timestamp) return 'Date N/A';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    if (isLoading) {
        // Loading state
        return (
            <main className={styles.main} style={{textAlign: 'center', minHeight: '80vh', paddingTop: '10rem'}}>
                <div style={{color: 'var(--color-neon-green)', fontSize: '2rem'}}>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '3rem', margin: '0 auto', marginBottom: '1rem' }} />
                    <p style={{marginBottom: '1rem'}}>Loading Blog Post...</p>
                </div>
            </main>
        ); 
    }

    // Agar post nahi mila
    if (!post) {
        return (
            <main className={styles.main} style={{textAlign: 'center', minHeight: '80vh', paddingTop: '10rem'}}>
                <h1 style={{color: '#ff4757', fontSize: '3rem'}}>404 - Post Not Found</h1>
                <p style={{marginTop: '1rem', opacity: 0.8, fontSize: '1.2rem'}}>The blog post you are looking for does not exist or has been removed.</p>
                <Link href="/blog" style={{ marginTop: '2rem', display: 'inline-block', padding: '0.8rem 2rem', backgroundColor: 'var(--color-neon-green)', color: 'var(--color-dark-navy)', borderRadius: '8px', fontWeight: '600' }}>
                    Go to Blog Listing
                </Link>
            </main>
        );
    }
    
    // === YAHAN POORA RENDER LOGIC BADAL GAYA HAI ===

    return (
        <main className={styles.main}>
          <article>
            {/* Cover Image */}
            <AnimationWrapper>
                <div className={styles.coverImageContainer}>
                  {post.coverImageURL ? (
                    <Image
                      src={post.coverImageURL}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 950px" 
                      style={{ objectFit: 'cover' }}
                      priority 
                    />
                  ) : (
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>No Image</div>
                  )}
                </div>
            </AnimationWrapper>

            {/* Title and Meta */}
            <AnimationWrapper>
                <h1 className={styles.postTitle}>{post.title}</h1>
                <div className={styles.postMeta}>
                    <span style={{ color: 'var(--color-neon-green)' }}><FaTag style={{marginRight: '0.5rem'}}/>{post.category || 'TUTORIAL'}</span>
                    <span><FaCalendarAlt style={{marginRight: '0.5rem'}}/> Published on: {formatDate(post.createdAt)}</span>
                </div>
            </AnimationWrapper>

            {/* Naya Content Blocks Renderer */}
            <div className={styles.postContent}>
                {/* Loop over contentBlocks */}
                {(post.contentBlocks || []).map((block, index) => {
                    
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
                                        alt={block.headline || 'Blog Content Image'} 
                                        width={500} 
                                        height={300} 
                                        style={{width: '100%', height: 'auto', borderRadius: '8px'}}
                                    />
                                )}
                            </AnimationWrapper>
                        </div>
                    );

                    // Layout ke hisaab se render karna
                    let layoutClass = '';
                    switch (block.layout) {
                        case 'text-left-image-right':
                            layoutClass = styles.layoutImageRight;
                            return (
                                <div key={block.id} className={`${styles.layoutRow} ${layoutClass}`}>
                                    {textContent}
                                    {imageContent}
                                </div>
                            );
                        
                        case 'image-left-text-right':
                            layoutClass = styles.layoutImageLeft;
                            return (
                                <div key={block.id} className={`${styles.layoutRow} ${layoutClass}`}>
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

export default BlogContent;