// src/app/portfolio/page.tsx

"use client"; // Needs to be client for filtering state

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link component
import styles from './portfolio.module.css';
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';

// Import Firebase functions
import { db } from '@/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';

// Define Portfolio Item structure from Firestore
interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  coverImageURL: string;
  createdAt?: Timestamp; // Optional timestamp
}

// Predefined categories for filtering
const categories = ['All', 'Web App', 'Mobile App', 'Custom Software', 'UI/UX Design'];

const PortfolioPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]); // State for fetched items
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch data from Firestore on component mount
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const portfolioCollection = collection(db, 'portfolio');
        const querySnapshot = await getDocs(portfolioCollection); // Fetch without sorting for now

        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || 'No Title',
          category: doc.data().category || 'Uncategorized',
          coverImageURL: doc.data().coverImageURL || '/placeholder.jpg', // Fallback image
          createdAt: doc.data().createdAt,
        })) as PortfolioItem[];

         // Sort manually after fetching if createdAt exists
        items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

        setPortfolioItems(items);
      } catch (err) {
        console.error("Error fetching portfolio items:", err);
        setError("Failed to load portfolio items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []); // Empty dependency array means run once on mount

  // Filter items based on the active category
  const filteredItems = activeFilter === 'All'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeFilter);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1>Our Work</h1>
        <p>Explore some of the projects we've crafted, showcasing our expertise across various technologies and industries.</p>
      </section>

      {/* Filter Buttons */}
      <AnimationWrapper delay={0.1}>
        <div className={styles.filters}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={activeFilter === category ? styles.activeFilter : ''}
              disabled={loading} // Disable buttons while loading
            >
              {category}
            </button>
          ))}
        </div>
      </AnimationWrapper>

      {/* Portfolio Grid */}
      <div className={styles.portfolioGrid}>
        {loading ? (
          <p className={styles.loading}>Loading projects...</p> // Show loading message
        ) : error ? (
            <p className={styles.errorMessage}>{error}</p> // Show error message
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <AnimationWrapper key={item.id} delay={(index * 0.1) + 0.2}>
              {/* Wrap the card content in a Link */}
              <Link href={`/portfolio/${item.id}`} className={styles.portfolioItem}>
                <div className={styles.portfolioImagePlaceholder}>
                  {/* Use Next/Image */}
                  <Image
                    src={item.coverImageURL}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 50vw" // Adjust sizes as needed
                    priority={index < 3} // Prioritize loading first few images
                  />
                </div>
                <div className={styles.portfolioItemInfo}>
                  <h3>{item.title}</h3>
                  <p>{item.category}</p>
                </div>
              </Link> {/* Close the Link tag */}
            </AnimationWrapper>
          ))
        ) : (
          <p className={styles.noProjects}>No projects found for this category.</p> // No projects message
        )}
      </div>
    </main>
  );
};

export default PortfolioPage;