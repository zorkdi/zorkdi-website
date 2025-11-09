// src/components/CallToActionBar/CallToActionBar.tsx

import React from 'react';
import Link from 'next/link';
import styles from '../../app/page.module.css';
// import { FaRocket } from 'react-icons/fa'; // Icon hata diya hai
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';

/**
 * CallToActionBar component: Full-width, high-impact CTA bar 
 * jo user ko project shuru karne ke liye prompt karta hai.
 */
const CallToActionBar: React.FC = () => {
    return (
        <section className={styles.ctaBarSection}>
            <div className={styles.ctaBarContent}>
                
                {/* NAYA: Text content ke liye wrapper */}
                <div className={styles.ctaTextWrapper}>
                    <AnimationWrapper delay={0.1}>
                        <h2 className={styles.ctaHeadline}>
                            {/* CHANGE: Text update kiya */}
                            Are You Ready to Launch Your Next Digital Project?
                        </h2>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.2}>
                        <p className={styles.ctaSubheadline}>
                            {/* === YAHAN CHANGE KIYA GAYA HAI === */}
                            Let&apos;s transform your vision into a scalable, high-performance reality with ZORK DI.
                        </p>
                    </AnimationWrapper>
                </div>

                {/* NAYA: Button ke liye wrapper */}
                <div className={styles.ctaButtonWrapper}>
                    <AnimationWrapper delay={0.3}>
                        {/* Hero Primary Button style reuse kiya for maximum impact */}
                        <Link 
                            href="/new-project" 
                            className={`${styles.heroButton} ${styles.ctaPrimaryButton}`} 
                        >
                            {/* CHANGE: Icon hata diya */}
                            {/* <FaRocket style={{ marginRight: '10px' }} /> */}
                            
                            {/* CHANGE: Button text update kiya */}
                            <span className={styles.buttonText}>Start Your Project</span>
                            <span className={styles.buttonBorderGlow}></span>
                        </Link>
                    </AnimationWrapper>
                </div>

            </div>
        </section>
    );
};

export default CallToActionBar;