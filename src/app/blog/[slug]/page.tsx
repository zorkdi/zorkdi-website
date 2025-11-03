// src/app/blog/[slug]/page.tsx

import styles from './post.module.css';
import { notFound } from 'next/navigation';
import Image from 'next/image'; 
import { FaCalendarAlt } from 'react-icons/fa'; // NAYA: Calendar icon

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

  // FIX: docs[0].data() se data fetch kiya
  const postData = querySnapshot.docs[0].data() as Post;
  return postData;
}

const BlogPostPage = async ({ params }: { params: { slug: string } }) => {
  const post = await getPost(params.slug);

  if (!post) {
    notFound(); // Agar post null hai, to 404 page dikhao
  }

  // NAYA: Date formatting
  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : 'Draft';

  return (
    <main className={styles.main}>
      <article>
        
        {/* Title */}
        <h1 className={styles.postTitle}>{post.title}</h1>
        
        {/* NAYA: Category aur Published Date ko ek hi div mein professional look diya */}
        <div className={styles.postMeta}>
          <p className={styles.postCategory}>{post.category}</p>
          <span className={styles.publishedDate}>
            <FaCalendarAlt style={{marginRight: '0.5rem', opacity: 0.8}}/>
            {formattedDate}
          </span>
        </div>


        {/* Cover Image */}
        {post.coverImageURL && (
            <div className={styles.postImageContainer}>
              <Image
                src={post.coverImageURL}
                alt={post.title}
                fill
                style={{ objectFit: 'cover' }}
                priority 
              />
            </div>
        )}
        
        
        {/* Content ko dangerouslySetInnerHTML se render karna */}
        <div 
          className={styles.postContent}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* FIX: Purana Published Date display hata diya */}
      </article>
    </main>
  );
};

export default BlogPostPage;