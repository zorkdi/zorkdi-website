// src/app/reviews/page.tsx

"use client";

// FIX: 'React' ko import kiya taaki cloneElement error solve ho
import React, { useState, useEffect, useCallback } from 'react'; 
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
    
    // NAYA STATE: Overall stats ke liye
    const [totalReviewsCount, setTotalReviewsCount] = useState(0);
    const [averageRating, setAverageRating] = useState(0);


    const REVIEWS_PER_PAGE = 9; // 3x3 grid achha lagega

    // NAYA FUNCTION: Total count aur average rating calculate karne ke liye
    const fetchTotalStats = useCallback(async () => {
        try {
            const reviewsRef = collection(db, 'reviews');
            const qAll = query(reviewsRef, where('status', '==', 'approved'));
            const snapshot = await getDocs(qAll);

            const count = snapshot.size;
            setTotalReviewsCount(count);
            
            if (count > 0) {
                const totalRating = snapshot.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
                const avg = totalRating / count;
                setAverageRating(avg);
            } else {
                 setAverageRating(0);
            }
        } catch (error) {
            console.error("Error fetching total stats:", error);
        }
    }, []);

    const fetchReviews = useCallback(async (direction: 'next' | 'prev' | 'initial' = 'initial') => {
        setLoading(true);
        try {
            let q;
            const reviewsRef = collection(db, 'reviews');
            
            const baseConstraints = [
                where('status', '==', 'approved'),
                // where('type', '==', 'full_review'), // Ise optional rakhte hain, taaki saare reviews dikhein
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
                 // Agar next page khali hai aur hum aage badhne ki koshish kar rahe hain
                 if (direction === 'next') {
                     alert("You have reached the end of the reviews list.");
                 }
                 // Agar hum piche jaane ki koshish karein jab first doc na ho, toh kuch nahi karenge.
            }

        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [lastDoc, firstDoc]); 

    useEffect(() => {
        fetchTotalStats(); // Total stats shuru mein fetch kiye
        fetchReviews('initial');
    }, [fetchReviews, fetchTotalStats]); // fetchTotalStats ko dependency mein add kiya

    const renderStars = (rating: number) => {
        const roundedRating = Math.round(rating);
        return [...Array(5)].map((_, i) => (
            // #ffc107 is bright yellow/gold
            <FaStar key={i} color={i < roundedRating ? "#ffc107" : "#e4e5e9"} style={{ fontSize: '2rem', margin: '0 2px' }} /> 
        ));
    };
    
    // Helper to format average rating
    const formattedRating = averageRating.toFixed(1);

    return (
        <main className={styles.main}>
            <section className={styles.heroSection} style={{ minHeight: '50vh', padding: '8rem 2rem 4rem' }}>
                <h1 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>All Client Reviews</h1>
                <p className={styles.sectionSubtitle} style={{ opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
                    See what our clients have to say about their experience working with ZORK DI.
                </p>
                
                {/* Overall Rating Display */}
                 <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <div style={{ display: 'inline-flex', gap: '5px', color: 'var(--color-neon-green)' }}>
                        {renderStars(averageRating)}
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--color-neon-light)' }}>
                        {formattedRating} / 5.0 Rating
                    </p>
                    <p style={{ opacity: 0.7 }}>Based on {totalReviewsCount} total client reviews</p>
                </div>
            </section>

            <section className={styles.servicesSection} style={{ marginTop: '0', paddingTop: '4rem', paddingBottom: '8rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-neon-green)', fontSize: '1.5rem' }}>Loading Reviews...</div>
                ) : (
                    <>
                        {reviews.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '4rem', opacity: 0.8 }}>No approved reviews found yet.</p>
                        ) : (
                            // WhyUsGrid class is used for the review cards (jaisa homepage mein kiya tha)
                            <div className={styles.whyUsGrid} style={{ marginTop: '0', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                                {reviews.map((review, index) => (
                                    <AnimationWrapper key={review.id} delay={index * 0.1}>
                                        <div className={styles.whyUsItem} style={{ textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                            <FaQuoteLeft style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2rem', opacity: 0.1, color: 'var(--color-neon-green)' }} />
                                            <div style={{ display: 'flex', gap: '5px', marginBottom: '1rem' }}>
                                                {/* Star rating ko smaller size mein render kiya */}
                                                {renderStars(review.rating).map(star => React.cloneElement(star, { style: { fontSize: '1rem', margin: '0 1px' } }))}
                                            </div>
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
                        )}

                        {/* Pagination Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '4rem' }}>
                            <button 
                                onClick={() => fetchReviews('prev')} 
                                // FIX: Button styles ko CSS Modules se liya
                                className={`${styles.heroButton} ${styles.secondary}`} 
                                disabled={page === 1 || loading}
                                style={{ padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '10px', opacity: page === 1 ? 0.5 : 1 }}
                            >
                                <FaArrowLeft /> Previous
                            </button>
                            <button 
                                onClick={() => fetchReviews('next')} 
                                // FIX: Button styles ko CSS Modules se liya
                                className={styles.heroButton}
                                disabled={reviews.length < REVIEWS_PER_PAGE || loading}
                                style={{ padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '10px', opacity: reviews.length < REVIEWS_PER_PAGE ? 0.5 : 1 }}
                            >
                                Next <FaArrowRight />
                            </button>
                        </div>
                         <p style={{textAlign: 'center', marginTop: '1rem', opacity: 0.6}}>Page {page} / (approx. {Math.ceil(totalReviewsCount / REVIEWS_PER_PAGE)})</p>
                    </>
                )}
            </section>
        </main>
    );
};

export default ReviewsPage;