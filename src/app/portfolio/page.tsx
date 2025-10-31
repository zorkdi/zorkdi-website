// src/app/portfolio/page.tsx

"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'; // FIX: Timestamp import removed

import styles from './portfolio.module.css';

// Type definitions
interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  coverImageURL: string;
}

// Dummy Categories
const allCategories = ['All', 'Web App', 'Mobile App', 'Finance Solution', 'Custom Software', 'UI/UX Design'];

const PortfolioPage = () => {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch Portfolio Items (Real-time)
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const itemsCollectionRef = collection(db, 'portfolio');
        const itemsQuery = query(
            itemsCollectionRef,
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || 'Untitled Project',
                    category: data.category || 'Uncategorized',
                    coverImageURL: data.coverImageURL || '',
                } as PortfolioItem;
            });
            setItems(fetchedItems);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching portfolio items:", err);
            setError("Failed to load portfolio items.");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. Filter Logic (useMemo for optimization)
    const filteredItems = useMemo(() => {
        if (activeFilter === 'All') return items;
        return items.filter(item => item.category === activeFilter);
    }, [items, activeFilter]);


    return (
        <main className={styles.main}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <h1>Our Digital Creations</h1>
                <p>We&apos;re proud of the solutions we&apos;ve built. Explore our latest work and client success stories.</p> {/* FIX: Apostrophe escaped */}
            </section>

            {/* Filters */}
            <div className={styles.filters}>
                {allCategories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveFilter(category)}
                        className={category === activeFilter ? styles.activeFilter : ''}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Portfolio Grid */}
            <section className={styles.portfolioGrid}>
                {isLoading ? (
                    <div className={styles.loading}>Loading amazing projects...</div>
                ) : error ? (
                    <div className={styles.errorMessage}>{error}</div>
                ) : filteredItems.length === 0 ? (
                    <div className={styles.noProjects}>
                        <p>No projects found in the {activeFilter} category.</p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <Link href={`/portfolio/${item.id}`} key={item.id} className={styles.portfolioItem}>
                            <div className={styles.portfolioImagePlaceholder}>
                                {item.coverImageURL ? (
                                    <Image
                                        src={item.coverImageURL}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className={styles.portfolioImage}
                                    />
                                ) : (
                                    <span className={styles.imagePlaceholderText}>
                                        Image Placeholder
                                    </span>
                                )}
                            </div>
                            <div className={styles.portfolioItemInfo}>
                                <h3>{item.title}</h3>
                                <p>{item.category}</p>
                            </div>
                        </Link>
                    ))
                )}
            </section>
        </main>
    );
};

export default PortfolioPage;