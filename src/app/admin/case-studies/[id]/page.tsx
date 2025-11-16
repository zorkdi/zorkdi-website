// src/app/case-studies/[id]/page.tsx

import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import Image from 'next/image';
import styles from './case-study-detail.module.css';
import { notFound } from 'next/navigation'; // 404 error ke liye
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';

// Case Study ka data structure
interface CaseStudyData {
  title: string;
  category: string;
  summary: string;
  content: string; // Yeh main rich text content hoga
  coverImageURL: string;
  createdAt?: Timestamp;
}

// Data fetch karne ka function
async function getCaseStudy(id: string): Promise<CaseStudyData | null> {
  try {
    const docRef = doc(db, 'caseStudies', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Data ko CaseStudyData type mein cast kiya
      return docSnap.data() as CaseStudyData;
    } else {
      // Document nahi mila
      return null;
    }
  } catch (error) {
    console.error("Error fetching case study:", error);
    return null;
  }
}

// Page component (Async Server Component)
export default async function CaseStudyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const study = await getCaseStudy(id);

  // Agar study nahi mili, toh 404 page dikhao
  if (!study) {
    notFound();
  }

  return (
    <main className={styles.pageContainer}>
      {/* Header Section */}
      <AnimationWrapper>
        <header className={styles.header}>
          {study.coverImageURL && (
            <Image
              src={study.coverImageURL}
              alt={study.title}
              fill
              className={styles.headerImage}
              priority
            />
          )}
          <div className={styles.headerOverlay}></div>
          <div className={styles.headerContent}>
            <p className={styles.category}>{study.category}</p>
            <h1>{study.title}</h1>
            <p>{study.summary}</p>
          </div>
        </header>
      </AnimationWrapper>

      {/* Content Section */}
      <AnimationWrapper delay={0.2}>
        <section className={styles.contentArea}>
          <div
            className={styles.contentBody}
            // Markdown jaisa simple text formatting (newlines) show karega
            // Agar aap real Markdown/HTML use karna chahte hain, toh yahan parser lagega
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {study.content}
          </div>
        </section>
      </AnimationWrapper>
    </main>
  );
}