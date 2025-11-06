// src/app/blog/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore'; 

import styles from './blog.module.css';
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
import Image from 'next/image';
// FIX: Unused icons (FaPlus, FaTrashAlt, FaPen, FaExternalLinkAlt) ko remove kar diya
import { FaSpinner } from 'react-icons/fa'; 

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    summary: string;
    category: string;
    coverImageURL: string;
    createdAt: Date; 
}

// Fallback data
const fallbackPosts: BlogPost[] = [
    { id: 'dummy', title: 'No Blog Posts Found', slug: '#', summary: 'The latest tech insights will appear here once you publish your first blog post from the admin panel.', category: 'INFO', coverImageURL: '', createdAt: new Date() },
];

const BlogPage = () => {
    const [posts, setPosts] = useState<BlogPost[]>(fallbackPosts);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = () => {
            setIsLoading(true);
            
            try {
                const q = query(
                    collection(db, 'blog'),
                    orderBy('createdAt', 'desc'),
                );
                
                // onSnapshot for real-time updates
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    if (querySnapshot.empty) {
                        setPosts(fallbackPosts);
                        setIsLoading(false);
                        return;
                    }

                    const fetchedPosts: BlogPost[] = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        
                        // FIX: Timestamp to Date conversion for consistency
                        const createdAtDate = data.createdAt instanceof Timestamp 
                            ? data.createdAt.toDate() 
                            : new Date(); 

                        return {
                            id: doc.id,
                            title: data.title || 'Untitled Post',
                            slug: data.slug || doc.id, 
                            summary: data.summary || data.content?.substring(0, 150).replace(/<\/?[^>]+(>|$)/g, "") + '...' || 'No summary available.',
                            category: data.category || 'Tutorial',
                            coverImageURL: data.coverImageURL || '',
                            createdAt: createdAtDate,
                        };
                    });
                    setPosts(fetchedPosts);
                    setIsLoading(false);

                }, (error) => {
                    console.error("Error fetching blog posts (onSnapshot):", error);
                    setPosts(fallbackPosts);
                    setIsLoading(false);
                });
                
                return () => unsubscribe(); // Cleanup listener

            } catch (error) {
                console.error("Error setting up fetch listener:", error);
                setPosts(fallbackPosts);
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const isFallback = posts.length === 1 && posts[0].id === 'dummy';

    return (
        <main className={styles.main}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <h1>ZORK DI Blog</h1>
                <p>Insights, tutorials, and stories from the world of technology.</p>
            </section>

            {/* Blog Grid */}
            <section>
                {isLoading ? (
                    <div className={styles.loading} style={{textAlign: 'center', padding: '3rem'}}>
                        <FaSpinner style={{ animation: 'spin 1s linear infinite', marginRight: '1rem', fontSize: '2rem' }}/> Loading posts...
                    </div>
                ) : isFallback ? (
                    <div className={styles.noPosts}>
                        {posts[0].summary}
                    </div>
                ) : (
                    <div className={styles.blogGrid}>
                        {posts.map((post, index) => (
                            <AnimationWrapper key={post.id} delay={index * 0.1}>
                                <Link href={`/blog/${post.slug}`} className={styles.blogCard}>
                                    <div className={styles.cardImageContainer}>
                                        {post.coverImageURL ? (
                                            <Image
                                                src={post.coverImageURL}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 350px"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className={styles.imagePlaceholderText}>No Image</div>
                                        )}
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardCategory}>{post.category}</p>
                                        <h2>{post.title}</h2>
                                        <p className={styles.cardDate}>
                                            Published on: {post.createdAt ? post.createdAt.toLocaleDateString('en-GB') : 'Draft'}
                                        </p>
                                    </div>
                                </Link>
                            </AnimationWrapper>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default BlogPage;