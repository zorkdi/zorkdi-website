// src/app/blog/[slug]/BlogContent.tsx

"use client"; // CRITICAL: Yeh client component hai

import Image from 'next/image';
import { db } from '@/firebase';
// CRITICAL FIX: Sahi modular functions ko import kiya, ab 'limit' bhi shamil hai
import { Timestamp, collection, query, where, getDocs, limit } from 'firebase/firestore'; 
import styles from '@/app/blog/[slug]/blog-detail.module.css'; 
import { useEffect, useState } from 'react'; 
import React from 'react';
import { FaCalendarAlt, FaTag, FaSpinner } from 'react-icons/fa'; // Icons add kiye
import Link from 'next/link';

// Define Blog Post structure
interface BlogPost {
  title: string;
  category: string;
  content: string; // This will be HTML
  coverImageURL: string;
  createdAt: Timestamp | null;
}

// Props interface
interface BlogContentProps {
  slug: string; // Slug jo Server Component se aayega
}

// Client Component
const BlogContent = ({ slug }: BlogContentProps) => {
    const [post, setPost] = useState<BlogPost | null>(null); 
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data function (ab client side par run hoga)
    const getBlogPostBySlug = async (postSlug: string): Promise<BlogPost | null> => {
      try {
        // 1. Collection Reference banaya
        const blogCollectionRef = collection(db, 'blog'); 
        
        // 2. Naye modular syntax se Query banaya (limit ab imported hai)
        const q = query(
            blogCollectionRef, 
            where('slug', '==', postSlug), 
            // NOTE: Agar aapke Blog Posts mein status field ho, to yeh check theek hai.
            // where('status', '==', 'Published'), 
            limit(1)
        );

        // 3. Query ko execute kiya
        const querySnapshot = await getDocs(q); 
        
        if (querySnapshot.empty) {
            return null;
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
        // Custom 404 UI dikhaenge
        return (
            <main className={styles.main} style={{textAlign: 'center', minHeight: '80vh', paddingTop: '10rem'}}>
                <h1 style={{color: '#ff4757', fontSize: '3rem'}}>404 - Post Not Found</h1>
                <p style={{marginTop: '1rem', opacity: 0.8, fontSize: '1.2rem'}}>The blog post you are looking for does not exist or has been removed.</p>
                {/* Link to Blog Listing Page */}
                <Link href="/blog" style={{ marginTop: '2rem', display: 'inline-block', padding: '0.8rem 2rem', backgroundColor: 'var(--color-neon-green)', color: 'var(--color-dark-navy)', borderRadius: '8px', fontWeight: '600' }}>
                    Go to Blog Listing
                </Link>
            </main>
        );
    }
    
    // ImageRow class ko replace karna zaroori hai taaki CSS apply ho
    const contentWithImageRow = post.content.replace(/<div class="ImageRow"/g, `<div class="ImageRow ${styles.imageRow}"`);

    return (
        <main className={styles.main}>
          <article>
            {/* Cover Image */}
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
                <div className={styles.founderImagePlaceholder} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>No Image</div>
              )}
            </div>

            {/* Title and Meta */}
            <h1 className={styles.postTitle}>{post.title}</h1>
            <div className={styles.postMeta}>
                <span style={{ color: 'var(--color-neon-green)' }}><FaTag style={{marginRight: '0.5rem'}}/>{post.category || 'TUTORIAL'}</span>
                <span><FaCalendarAlt style={{marginRight: '0.5rem'}}/> Published on: {formatDate(post.createdAt)}</span>
            </div>

            {/* Formatted Content (Rendered from HTML) */}
            <div
              className={styles.postContent} 
              dangerouslySetInnerHTML={{ __html: contentWithImageRow }} 
            />
          </article>
        </main>
    );
};

export default BlogContent;
