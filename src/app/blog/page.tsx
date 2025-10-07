import Link from 'next/link';
import styles from './blog.module.css';

// Abhi ke liye hum blog posts ka data yahan hardcode kar rahe hain.
const blogPosts = [
  {
    title: 'How to Optimize Your Flutter App Performance',
    category: 'TUTORIAL',
    excerpt: 'A deep dive into techniques and best practices to make your Flutter applications run smoother and faster.',
    slug: 'flutter-performance',
  },
  {
    title: 'Top 5 Security Practices for Next.js Apps',
    category: 'WEB SECURITY',
    excerpt: 'Protect your Next.js application from common vulnerabilities with these essential security tips.',
    slug: 'nextjs-security',
  },
  {
    title: 'Understanding Firestore: A Deep Dive for Beginners',
    category: 'FIREBASE',
    excerpt: 'Learn the fundamentals of Firestore, its data model, and how to perform queries effectively.',
    slug: 'firestore-deep-dive',
  },
  {
    title: 'The Power of Component-Based Architecture',
    category: 'SOFTWARE DESIGN',
    excerpt: 'Explore how building applications with reusable components can drastically improve your workflow and code quality.',
    slug: 'component-architecture',
  },
];

const BlogPage = () => {
  return (
    <main className={styles.main}>
      {/* ===== Hero Section ===== */}
      <section className={styles.hero}>
        <h1>Tech Insights & Tutorials</h1>
        <p>Our thoughts on the latest trends, guides, and technologies that shape the future.</p>
      </section>

      {/* ===== Blog Grid ===== */}
      <section className={styles.blogGrid}>
        {blogPosts.map((post, index) => (
          <Link href={`/blog/${post.slug}`} key={index} className={styles.blogCard}>
            <div className={styles.cardImagePlaceholder}></div>
            <div className={styles.cardContent}>
              <p className={styles.cardCategory}>{post.category}</p>
              <h2>{post.title}</h2>
              <p className={styles.cardExcerpt}>{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
};

export default BlogPage;