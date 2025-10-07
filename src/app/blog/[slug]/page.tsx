import styles from './post.module.css';
import { notFound } from 'next/navigation';

// Humne blog posts ka data yahan dobara copy kiya hai.
// Isse hum baad mein ek common file mein move karenge.
const blogPosts = [
  {
    title: 'How to Optimize Your Flutter App Performance',
    category: 'TUTORIAL',
    content: 'This is the full blog post content about Flutter performance...',
    slug: 'flutter-performance',
  },
  {
    title: 'Top 5 Security Practices for Next.js Apps',
    category: 'WEB SECURITY',
    content: 'This is the full blog post content about Next.js security...',
    slug: 'nextjs-security',
  },
  {
    title: 'Understanding Firestore: A Deep Dive for Beginners',
    category: 'FIREBASE',
    content: 'This is the full blog post content about Firestore...',
    slug: 'firestore-deep-dive',
  },
  {
    title: 'The Power of Component-Based Architecture',
    category: 'SOFTWARE DESIGN',
    content: 'This is the full blog post content about component architecture...',
    slug: 'component-architecture',
  },
];

// Yeh function URL se 'slug' leta hai aur uske hisaab se data dhoondhta hai
const BlogPostPage = ({ params }: { params: { slug: string } }) => {
  const post = blogPosts.find(p => p.slug === params.slug);

  // Agar post nahi milta, toh 404 Not Found page dikhata hai
  if (!post) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <article className={styles.postArticle}>
        <h1 className={styles.postTitle}>{post.title}</h1>
        <p className={styles.postCategory}>{post.category}</p>
        <div className={styles.postContent}>
          <p>{post.content}</p>
          {/* Yahan par future mein poora blog content aayega */}
        </div>
      </article>
    </main>
  );
};

export default BlogPostPage;