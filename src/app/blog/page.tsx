// src/app/blog/page.tsx

"use client"; // NAYA: Animation component ke liye "use client" zaroori hai

import Link from 'next/link';
import Image from 'next/image';
import styles from './blog.module.css';
// NAYA: Firebase/Data fetching removed from client component
// NAYA: AnimationWrapper component ko import kiya
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
// NAYA: useEffect and useState for client-side data fetching
import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';

// Blog post ke data ka structure define kiya
interface Post {
  id: string;
  title: string;
  category: string;
  slug: string;
  coverImageURL: string;
  publishedAt: Timestamp;
}

// NAYA: Data fetching ab client-side hoga
const BlogPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBlogPosts = async () => {
      try {
        const postsCollection = collection(db, 'blogs');
        const q = query(postsCollection, orderBy('publishedAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];

        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        // Handle error state if needed
      } finally {
        setLoading(false);
      }
    };

    getBlogPosts();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1>ZORK DI Blog</h1>
        <p>Insights, tutorials, and stories from the world of technology.</p>
      </section>

      <div className={styles.blogGrid}>
        {loading ? (
          // Optional: Add a loading indicator
          <p className={styles.noPosts}>Loading posts...</p>
        ) : posts.length > 0 ? (
          posts.map((post, index) => (
            // NAYA: Har blog card ko AnimationWrapper se wrap kiya
            <AnimationWrapper key={post.id} delay={(index * 0.1) + 0.1}>
              <Link href={`/blog/${post.slug}`} className={styles.blogCard}>
                <div className={styles.cardImageContainer}>
                  {post.coverImageURL ? (
                    <Image
                      src={post.coverImageURL}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <span className={styles.imagePlaceholderText}>No Image</span>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.cardCategory}>{post.category}</p>
                  <h2>{post.title}</h2>
                  <p className={styles.cardDate}>
                    Published on: {post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </Link>
            </AnimationWrapper>
          ))
        ) : (
          <p className={styles.noPosts}>No blog posts found. Check back soon!</p>
        )}
      </div>
    </main>
  );
};

export default BlogPage;