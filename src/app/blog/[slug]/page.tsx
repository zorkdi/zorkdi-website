// src/app/blog/[slug]/page.tsx

import styles from './post.module.css';
import { notFound } from 'next/navigation';
import Image from 'next/image'; // NAYA: Image component import kiya

// NAYA: Firebase se data laane ke liye functions import kiye
import { db } from '@/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

// NAYA: Blog post ke data ka structure define kiya
interface Post {
  title: string;
  category: string;
  content: string;
  coverImageURL: string;
  publishedAt: Timestamp;
}

// NAYA: Server Component mein data fetching
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
        <div className={styles.postImageContainer}>
          {post.coverImageURL && (
            <Image
              src={post.coverImageURL}
              alt={post.title}
              fill
              style={{ objectFit: 'cover' }}
              priority // Taaki image jaldi load ho
            />
          )}
        </div>
        <h1 className={styles.postTitle}>{post.title}</h1>
        <p className={styles.postCategory}>{post.category}</p>
        <div className={styles.postContent}>
          <p>{post.content}</p>
          {/* Yahan par future mein poora blog content (HTML/Markdown) aayega */}
        </div>
      </article>
    </main>
  );
};

export default BlogPostPage;