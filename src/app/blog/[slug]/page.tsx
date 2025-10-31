// src/app/blog/[slug]/page.tsx

import styles from './post.module.css';
import { notFound } from 'next/navigation';
import Image from 'next/image'; 

// Firebase se data laane ke liye functions import kiye
import { db } from '@/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

// Blog post ke data ka structure define kiya
interface Post {
  title: string;
  category: string;
  content: string; // Rich Text (HTML)
  coverImageURL: string;
  publishedAt: Timestamp;
}

// Server Component mein data fetching
async function getPost(slug: string) {
  const postsCollection = collection(db, 'blogs');
  const q = query(postsCollection, where("slug", "==", slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null; // Agar post nahi mila to null return karo
  }

  const postData = querySnapshot.docs[0].data() as Post;
  return postData;
}

const BlogPostPage = async ({ params }: { params: { slug: string } }) => {
  const post = await getPost(params.slug);

  if (!post) {
    notFound(); // Agar post null hai, to 404 page dikhao
  }

  return (
    <main className={styles.main}>
      <article>
        {/* Cover Image */}
        <div className={styles.postImageContainer}>
          {post.coverImageURL && (
            <Image
              src={post.coverImageURL}
              alt={post.title}
              fill
              style={{ objectFit: 'cover' }}
              priority 
            />
          )}
        </div>
        
        {/* Title and Category */}
        <h1 className={styles.postTitle}>{post.title}</h1>
        <p className={styles.postCategory}>{post.category}</p>
        
        {/* FIX: Content ko dangerouslySetInnerHTML se render karna */}
        <div 
          className={styles.postContent}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Published Date Display */}
        <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '3rem', textAlign: 'center' }}>
          Published on: {post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
        </p>
      </article>
    </main>
  );
};

export default BlogPostPage;
