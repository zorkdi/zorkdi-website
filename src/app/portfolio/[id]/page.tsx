// src/app/portfolio/[id]/page.tsx

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import styles from './portfolio-detail.module.css';

// Define Portfolio Item structure
interface PortfolioItem {
  title: string;
  category: string;
  content: string; // This will be HTML
  coverImageURL: string;
  createdAt?: Timestamp;
}

// Fetch data function (runs on server)
async function getPortfolioItem(id: string): Promise<PortfolioItem | null> {
  try {
    const docRef = doc(db, 'portfolio', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as PortfolioItem;
    } else {
      return null; // Not found
    }
  } catch (error) {
    console.error("Error fetching portfolio item:", error);
    return null; // Return null on error
  }
}

// Page component props
interface PortfolioDetailPageProps {
  params: {
    id: string; // The dynamic segment [id] from the URL
  };
}

// The Page Component (Server Component)
const PortfolioDetailPage = async (props: PortfolioDetailPageProps) => {
  // FIX: Next.js 14+ or Turbopack often requires explicit awaiting of the
  // props object (which includes dynamic segments like params) to resolve 
  // the "params should be awaited" error.
  const awaitedProps = await props;
  const { id } = awaitedProps.params;

  const item = await getPortfolioItem(id);

  // If item not found, show 404 page
  if (!item) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <article>
        {/* Cover Image */}
        <div className={styles.coverImageContainer}>
          {item.coverImageURL && (
            <Image
              src={item.coverImageURL}
              alt={item.title}
              fill
              style={{ objectFit: 'cover' }}
              priority // Load cover image faster
              sizes="(max-width: 768px) 100vw, 900px" // Adjust sizes
            />
          )}
        </div>

        {/* Title and Category */}
        <h1 className={styles.projectTitle}>{item.title}</h1>
        <p className={styles.projectCategory}>{item.category}</p>

        {/* Formatted Content (Rendered from HTML) */}
        <div
          className={styles.projectContent}
          dangerouslySetInnerHTML={{ __html: item.content }} // IMPORTANT: Renders the HTML
        />
      </article>
    </main>
  );
};

export default PortfolioDetailPage;