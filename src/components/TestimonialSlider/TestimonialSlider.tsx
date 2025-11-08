// src/components/TestimonialSlider/TestimonialSlider.tsx

"use client";

import React, { useRef } from 'react';
import styles from '../../app/page.module.css';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Review Interface (page.tsx se copy kiya)
interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: any;
}

interface TestimonialSliderProps {
    reviews: Review[];
}

// Function to render Star Rating (page.tsx se copy kiya)
const StarRating = ({ rating }: { rating: number }) => {
    const totalStars = 5;
    const filledStars = Math.round(rating);
    const stars = [];

    for (let i = 1; i <= totalStars; i++) {
        stars.push(
            <FaStar 
                key={i} 
                style={{ color: i <= filledStars ? 'var(--color-neon-green)' : '#444', marginRight: '3px' }} 
            />
        );
    }

    return <div style={{ display: 'flex', fontSize: '1.1rem' }}>{stars}</div>;
};

const TestimonialSlider: React.FC<TestimonialSliderProps> = ({ reviews }) => {
    
    // NAYA: Scrolling functionality ke liye ref use kiya
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const cardWidth = scrollRef.current.querySelector(`.${styles.testimonialCard}`)?.clientWidth || 350;
            const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
            
            scrollRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    
    if (reviews.length === 0) {
        return <p style={{ textAlign: 'center', opacity: 0.8 }}>No approved testimonials yet. Be the first to rate us!</p>;
    }


    return (
        <div className={styles.sliderContainer}>
            
            {/* Left Scroll Button */}
            <button 
                className={`${styles.sliderControl} ${styles.left}`} 
                onClick={() => scroll('left')}
                aria-label="Scroll left"
            >
                <FaChevronLeft />
            </button>
            
            {/* Scrollable Track */}
            <div className={styles.sliderTrackWrapper}>
                <div className={styles.sliderTrack} ref={scrollRef}>
                    {reviews.map((review, index) => (
                        <div key={review.id} className={styles.testimonialCard}>
                            <FaQuoteLeft className={styles.quoteIcon} />
                            
                            <p className={styles.reviewComment}>
                                {review.comment}
                            </p>
                            
                            <div className={styles.reviewFooter}>
                                <div className={styles.reviewerName}>{review.userName}</div>
                                <StarRating rating={review.rating} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Scroll Button */}
             <button 
                className={`${styles.sliderControl} ${styles.right}`} 
                onClick={() => scroll('right')}
                aria-label="Scroll right"
            >
                <FaChevronRight />
            </button>
        </div>
    );
};

export default TestimonialSlider;