// src/app/case-studies/page.tsx

import Link from 'next/link';
import Image from 'next/image';
import styles from './case-studies.module.css';
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
import { FaArrowRight } from 'react-icons/fa';

// NAYA: Firebase imports
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

// === NAYA FIX: CACHING KO DISABLE KAR RAHE HAIN ===
// Yeh line Next.js ko batayegi ki hamesha server se naya data fetch karo
export const dynamic = 'force-dynamic';
// ============================================

// Type for a single Case Study
type CaseStudy = {
  id: string;
  slug: string; // URL ke liye
  category: string;
  title: string;
  summary: string;
  imageUrl: string; 
  createdAt: Timestamp | null;
};

// NAYA: Data fetch function (Server-side)
async function fetchCaseStudies(): Promise<CaseStudy[]> {
  try {
    const q = query(collection(db, 'caseStudies'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return []; // Koi data nahi hai toh empty array
    }

    const studiesList: CaseStudy[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // FIX: Slug ab dynamic case study page par jaayega
        slug: `/case-studies/${doc.id}`, 
        category: data.category || 'Uncategorized',
        title: data.title || 'No Title',
        summary: data.summary || 'No summary provided.',
        imageUrl: data.coverImageURL || '/images/placeholder.jpg', // Ek fallback image
        createdAt: data.createdAt || null,
      };
    });
    
    return studiesList;
  } catch (err) {
    console.error("Error fetching case studies:", err);
    return []; // Error par empty array
  }
}


// Main Case Studies Page (ab yeh ek Async Server Component hai)
const CaseStudiesPage = async () => {
  
  // NAYA: Server par data fetch karna
  const caseStudiesData = await fetchCaseStudies();

  return (
    <main className={styles.caseStudiesPage}>
      <div className={styles.container}>
        <AnimationWrapper>
          <header className={styles.header}>
            <h1>Our Case Studies</h1>
            <p>
              Discover how we solve complex problems for our clients, delivering
              real results and measurable business value.
            </p>
          </header>
        </AnimationWrapper>

        <section className={styles.grid}>
          {caseStudiesData.length > 0 ? (
            caseStudiesData.map((study, index) => (
              <AnimationWrapper key={study.id} delay={0.1 * index}>
                <Link href={study.slug} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={study.imageUrl}
                      alt={study.title}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                    />
                  </div>
                  <div className={styles.content}>
                    <p className={styles.category}>{study.category}</p>
                    <h3>{study.title}</h3>
                    <p>{study.summary}</p>
                    <span className={styles.readMore}>
                      Read Full Study <FaArrowRight />
                    </span>
                  </div>
                </Link>
              </AnimationWrapper>
            ))
          ) : (
            // NAYA: Agar koi case study nahi hai toh message dikhana
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.7, padding: '3rem' }}>
              <h2>Coming Soon</h2>
              <p>We are currently compiling our detailed case studies. Please check back later!</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default CaseStudiesPage;