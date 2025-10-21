// src/app/admin/blog/page.tsx

import Link from 'next/link';
import { db } from '@/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import styles from '../admin.module.css'; // Hum admin ki main CSS file use karenge

// Blog post ke data ka structure
interface Post {
  id: string;
  title: string;
  category: string;
  publishedAt: Timestamp;
}

// Server Component mein data fetching
async function getBlogPosts() {
  const postsCollection = collection(db, 'blogs');
  const q = query(postsCollection, orderBy('publishedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const posts = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Post[];
  
  return posts;
}

const AdminBlogPage = async () => {
  const posts = await getBlogPosts();

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Manage Blog Posts</h1>
        <Link href="/admin/blog/new" className={styles.primaryButton}>
          + Add New Post
        </Link>
      </div>

      <div className={styles.dataContainer}>
        {posts.length > 0 ? (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Published Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.category}</td>
                  <td>{new Date(post.publishedAt.seconds * 1000).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/blog/edit/${post.id}`} className={styles.actionLink}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No blog posts found. Click 'Add New Post' to create one.</p>
        )}
      </div>
    </div>
  );
};

export default AdminBlogPage;