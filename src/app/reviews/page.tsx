// src/app/reviews/page.tsx

"use client";

import { useState, useEffect, useCallback } from 'react'; 
import { db } from '@/firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter, endBefore, limitToLast, DocumentSnapshot } from 'firebase/firestore'; 
import styles from '../page.module.css';
import { FaStar, FaQuoteLeft, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';

// Type Fix: createdAt type ko theek kiya
interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    }; 
}

const ReviewsPage = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
    const [firstDoc, setFirstDoc] = useState<DocumentSnapshot | null>(null);
    const [page, setPage] = useState(1);

    const REVIEWS_PER_PAGE = 9; // 3x3 grid achha lagega

    const fetchReviews = useCallback(async (direction: 'next' | 'prev' | 'initial' = 'initial') => {
        setLoading(true);
        try {
            let q;
            const reviewsRef = collection(db, 'reviews');
            
            const baseConstraints = [
                where('status', '==', 'approved'),
                where('type', '==', 'full_review'), 
                orderBy('createdAt', 'desc')
            ];

            if (direction === 'initial') {
                q = query(reviewsRef, ...baseConstraints, limit(REVIEWS_PER_PAGE));
            } else if (direction === 'next' && lastDoc) {
                q = query(reviewsRef, ...baseConstraints, startAfter(lastDoc), limit(REVIEWS_PER_PAGE));
            } else if (direction === 'prev' && firstDoc) {
                 q = query(reviewsRef, ...baseConstraints, endBefore(firstDoc), limitToLast(REVIEWS_PER_PAGE));
            } else {
                 q = query(reviewsRef, ...baseConstraints, limit(REVIEWS_PER_PAGE));
            }

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // Casting to Review type for safety
                const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
                setReviews(fetchedReviews);
                
                setFirstDoc(snapshot.docs[0]);
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
                
                if (direction === 'next') setPage(prev => prev + 1);
                if (direction === 'prev') setPage(prev => prev - 1);
            } else {
                 if (direction === 'next' || direction === 'prev') {
                     alert("No more reviews in this direction.");
                 }
            }

        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [lastDoc, firstDoc]); 

    useEffect(() => {
        fetchReviews('initial');
    }, [fetchReviews]); 

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <FaStar key={i} color={i < rating ? "#ffc107" : "#e4e5e9"} style={{ fontSize: '1rem' }} />
        ));
    };

    return (
        <main className={styles.main}>
            <section className={styles.heroSection} style={{ minHeight: '40vh', padding: '8rem 2rem 4rem' }}>
                <h1 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>All Client Reviews</h1>
                <p style={{ opacity: 0.8, fontSize: '1.2rem', maxWidth: '600px', textAlign: 'center' }}>
                    See what our clients have to say about their experience working with ZORK DI.
                </p>
            </section>

            <section className={styles.servicesSection} style={{ marginTop: '0', paddingTop: '0' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-neon-green)', fontSize: '1.5rem' }}>Loading Reviews...</div>
                ) : (
                    <>
                        <div className={styles.whyUsGrid} style={{ marginTop: '0' }}>
                            {reviews.map((review, index) => (
                                <AnimationWrapper key={review.id} delay={index * 0.1}>
                                    <div className={styles.whyUsItem} style={{ textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                        <FaQuoteLeft style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2rem', opacity: 0.1, color: 'var(--color-neon-green)' }} />
                                        <div style={{ display: 'flex', gap: '5px', marginBottom: '1rem' }}>
                                            {renderStars(review.rating)}
                                        </div>
                                        {/* FIX: Quotes ko remove kiya taaki unescaped entities ka issue solve ho */}
                                        <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', flexGrow: 1 }}>{review.comment}</p>
                                        <div>
                                             <h4 style={{ color: 'var(--color-neon-green)', fontWeight: 600, marginBottom: '0.2rem' }}>- {review.userName}</h4>
                                             <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                                {new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                                             </p>
                                        </div>
                                    </div>
                                </AnimationWrapper>
                            ))}
                        </div>

                        {/* Pagination Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '4rem' }}>
                            <button 
                                onClick={() => fetchReviews('prev')} 
                                disabled={page === 1 || loading}
                                className={styles.heroButton}
                                style={{ padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '10px', opacity: page === 1 ? 0.5 : 1 }}
                            >
                                <FaArrowLeft /> Previous
                            </button>
                            <button 
                                onClick={() => fetchReviews('next')} 
                                disabled={reviews.length < REVIEWS_PER_PAGE || loading}
                                className={styles.heroButton}
                                style={{ padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '10px', opacity: reviews.length < REVIEWS_PER_PAGE ? 0.5 : 1 }}
                            >
                                Next <FaArrowRight />
                            </button>
                        </div>
                         <p style={{textAlign: 'center', marginTop: '1rem', opacity: 0.6}}>Page {page}</p>
                    </>
                )}
            </section>
        </main>
    );
};

export default ReviewsPage;