// app/page.tsx

"use client"; 

import Link from 'next/link';
import styles from './page.module.css';
// FIX 1: Ratings ke liye FaStar aur FaQuoteLeft icons ko add kiya
import { FaLaptopCode, FaMobileAlt, FaDraftingCompass, FaRegLightbulb, FaUserShield, FaRocket, FaNewspaper, FaChartLine, FaDesktop, FaStar, FaQuoteLeft } from "react-icons/fa";
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
// Firestore imports mein 'where' add kiya reviews filtering ke liye
import { doc, getDoc, collection, query, orderBy, limit, getDocs, Timestamp, where } from 'firebase/firestore';
import { db } from '@/firebase';
import Image from 'next/image'; 

import React, { useState, useEffect } from 'react';
// FIX 2: ReviewModal ko import kiya
import ReviewModal from '@/components/ReviewModal/ReviewModal';

// Helper Components ko define kiya
const ServiceIcon = ({ icon: Icon }: { icon: React.ElementType }) => <Icon />;
const WhyUsIcon = ({ icon: Icon }: { icon: React.ElementType }) => <Icon />;


// --- Interfaces ---
interface ServiceOffering { id: string; title: string; description: string; offerings: string[]; }
interface ServicesContent { heroHeadline: string; heroSubheadline: string; heroButtonText: string; services: ServiceOffering[]; }
interface BlogPreview { id: string; title: string; slug: string; coverImageURL: string; summary: string; createdAt: Timestamp | null; }

// Portfolio Interface
interface PortfolioPreview { 
    id: string; 
    title: string; 
    category: string; 
    coverImageURL: string; 
    content: string; 
}

// NAYA: Review Interface
interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Timestamp;
}

// NAYA: Function to render Star Rating
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


// --- Fallback Data (Instant Rendering Ke Liye) ---
const fallbackServiceData: ServicesContent = {
    heroHeadline: "Our Digital Engineering Services",
    heroSubheadline: "Transforming complex ideas into clean, high-performance, and scalable software solutions.",
    heroButtonText: "Explore Our Services", 
    services: [
        { id: '1', title: 'Custom Web Apps', description: 'Building fast, secure, and resilient web applications using modern frameworks like Next.js and React.', offerings: [] },
        { id: '2', title: 'Mobile App Development', description: 'Creating engaging native and cross-platform mobile experiences for iOS and Android devices.', offerings: [] },
        { id: '3', title: 'UI/UX Design & Branding', description: 'Focusing on user-centric design to create intuitive, beautiful interfaces that drive user engagement.', offerings: [] },
    ],
};
const fallbackBlogPosts: BlogPreview[] = [
    { id: 'dummy1', title: 'No Blog Posts Found', slug: '#', coverImageURL: '', summary: 'The latest tech insights will appear here once you publish your first blog post from the admin panel.', createdAt: null },
];
const fallbackPortfolio: PortfolioPreview[] = [
    { id: 'p1', title: 'Quantum E-commerce', category: 'Web App', coverImageURL: '', content: 'A short description of the project.' },
    { id: 'p2', title: 'Aura FinTech Dashboard', category: 'Finance', coverImageURL: '', content: 'A short description of the project.' },
    { id: 'p3', title: 'SaaS Management Portal', category: 'Custom Software', coverImageURL: '', content: 'A short description of the project.' },
];

// Icon mapping (Service icons ke liye)
const iconMap: { [key: string]: React.ElementType } = {
    'Web App': FaLaptopCode,
    'Mobile App': FaMobileAlt,
    'UI/UX': FaDraftingCompass,
    'Custom Software': FaRocket, 
    'Digital Marketing': FaChartLine, 
    'Desktop Solutions': FaDesktop, 
};

// --- Data Fetching Functions ---

const fetchServiceContent = async (): Promise<ServicesContent> => {
    try {
        const docRef = doc(db, 'cms', 'services_page');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { ...fallbackServiceData, ...docSnap.data() as ServicesContent };
        }
    } catch (error) {
        console.error("Error fetching services content:", error);
    }
    return fallbackServiceData;
};

const fetchBlogPosts = async (): Promise<BlogPreview[]> => {
    try {
        const q = query(
            collection(db, 'blog'),
            orderBy('createdAt', 'desc'),
            limit(3) 
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) return fallbackBlogPosts;

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                slug: data.slug,
                coverImageURL: data.coverImageURL || '',
                summary: data.summary || data.content?.substring(0, 80).replace(/<\/?[^>]+(>|$)/g, "") + '...',
                createdAt: data.createdAt || null, 
            } as BlogPreview;
        });

    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return fallbackBlogPosts;
    }
};

const fetchPortfolioProjects = async (): Promise<PortfolioPreview[]> => {
    try {
        const q = query(
            collection(db, 'portfolio'), 
            orderBy('createdAt', 'desc'),
            limit(3) 
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) return fallbackPortfolio;

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            // FIX: Portfolio content ko clean kiya taaki glitch na ho (Glitch Fix)
            const cleanContent = data.content ? data.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').substring(0, 80) + '...' : 'Project description is missing.';

            return {
                id: doc.id,
                title: data.title,
                category: data.category,
                content: cleanContent, 
                coverImageURL: data.coverImageURL || '',
            } as PortfolioPreview;
        });

    } catch (error) {
        console.error("Error fetching portfolio projects:", error);
        return fallbackPortfolio; 
    }
};

// NAYA FUNCTION: Reviews fetch karna AUR Overall Stats Calculate karna
const fetchLatestReviewsAndStats = async (): Promise<{ reviews: Review[], avgRating: number, totalCount: number }> => {
    try {
        const reviewsRef = collection(db, 'reviews');
        // Pehle saare approved reviews fetch karo stats ke liye
        const qAllApproved = query(reviewsRef, where('status', '==', 'approved'));
        const snapshotAll = await getDocs(qAllApproved);
        
        const totalCount = snapshotAll.size;
        let avgRating = 0;
        
        if (totalCount > 0) {
            const totalRating = snapshotAll.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
            avgRating = totalRating / totalCount;
        }

        // Fir top 3 reviews fetch karo display ke liye
        const qLatest = query(qAllApproved, orderBy('createdAt', 'desc'), limit(3));
        const snapshotLatest = await getDocs(qLatest);
        
        const latestReviews = snapshotLatest.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userName: data.userName || 'Anonymous',
                rating: data.rating || 5,
                comment: data.comment || 'Excellent service!',
                createdAt: data.createdAt as Timestamp,
            } as Review;
        });
        
        return { reviews: latestReviews, avgRating, totalCount };

    } catch (error) {
        console.error("Error fetching latest reviews and stats:", error);
        return { reviews: [], avgRating: 0, totalCount: 0 }; 
    }
};


const HomePage = () => {
    // Initial state ko fallback data se set kiya. isLoading state removed.
    const [serviceContent, setServiceContent] = useState<ServicesContent>(fallbackServiceData);
    const [blogPosts, setBlogPosts] = useState<BlogPreview[]>(fallbackBlogPosts); 
    const [portfolioProjects, setPortfolioProjects] = useState<PortfolioPreview[]>(fallbackPortfolio); 
    
    // NAYA STATE: Reviews aur Stats ke liye
    const [latestReviews, setLatestReviews] = useState<Review[]>([]);
    const [totalReviewsCount, setTotalReviewsCount] = useState(0); // NAYA STATE
    const [averageRating, setAverageRating] = useState(0); // NAYA STATE

    const [isLoading, setIsLoading] = useState(true); // Loading state add kiya

    // NAYA STATE: Review Modal ko manage karne ke liye
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    
    // Handlers for Review Modal
    const openReviewModal = () => {
        setIsReviewModalOpen(true);
    };

    const closeReviewModal = () => {
        setIsReviewModalOpen(false);
        // Review submit hone ke baad latest reviews ko refresh karein
        fetchData(); 
    };

    // Fetch Services and Blog/Portfolio Content (Runs instantly on client-side)
    const fetchData = async () => {
        setIsLoading(true); // Loading true kiya
        try {
            // Promise.all mein reviews aur stats ek saath fetch kiye
            const [fetchedServices, fetchedPosts, fetchedProjects, statsResult] = await Promise.all([
                fetchServiceContent(), 
                fetchBlogPosts(), 
                fetchPortfolioProjects(),
                fetchLatestReviewsAndStats() // NAYA: Reviews aur Stats fetch kiye
            ]);
            
            // Data fetch hone par sirf state update hogi.
            setServiceContent(fetchedServices);
            setBlogPosts(fetchedPosts);
            setPortfolioProjects(fetchedProjects); 
            
            // Stats aur Latest Reviews ko set kiya
            setLatestReviews(statsResult.reviews); 
            setAverageRating(statsResult.avgRating); // NAYA: Average rating set kiya
            setTotalReviewsCount(statsResult.totalCount); // NAYA: Total count set kiya

        } catch (error) {
            console.error("Error fetching homepage content in client useEffect:", error);
        } finally {
            setIsLoading(false); // Loading false kiya
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // dependency array empty rakha


    // Helper: StarRating ko call karte hain average rating se
    const renderOverallStars = (rating: number) => {
        const totalStars = 5;
        const roundedRating = Math.round(rating);
        return [...Array(totalStars)].map((_, i) => (
            <FaStar 
                key={i} 
                style={{ color: i < roundedRating ? 'var(--color-neon-green)' : '#444', marginRight: '3px', fontSize: '2rem' }} 
            />
        ));
    };
    
    
    return (
        <main className={styles.main}>
            {/* HERO SECTION - IMAGE + OVERLAP FIX */}
            <div className={styles.heroSpacer}>
                 <section 
                    className={styles.heroFixedContent}
                 >
                    <div className={styles.heroContentWrapper}> 
                        <AnimationWrapper delay={0.1}>
                            <h1 className={styles.heroHeadline}>{serviceContent.heroHeadline}</h1>
                        </AnimationWrapper>
                        <AnimationWrapper delay={0.2}>
                            <p className={styles.heroSubheadline}>{serviceContent.heroSubheadline}</p>
                        </AnimationWrapper>
                        <AnimationWrapper delay={0.3}>
                            {/* FIX: Hero Button par specific PrimaryButton class lagaya */}
                            <Link 
                                href="/services" 
                                className={`${styles.heroButton} ${styles.heroPrimaryButton}`} 
                            >
                                {serviceContent.heroButtonText}
                            </Link>
                        </AnimationWrapper>
                    </div>
                </section>
            </div>


            {/* Services Section (DYNAMIC) */}
            <section className={styles.servicesSection}>
                <h2 className={styles.sectionTitle}>Our Core Services</h2>
                
                <div className={styles.servicesGrid}>
                    {serviceContent.services.map((service, index) => {
                        const IconKey = Object.keys(iconMap).find(key => service.title.includes(key)) || 'Custom Software'; 
                        const IconComponent = iconMap[IconKey];

                        return (
                            <AnimationWrapper key={service.id} delay={index * 0.2}>
                                <div className={styles.serviceCard}>
                                    <div className={styles.serviceIcon}>
                                        <ServiceIcon icon={IconComponent} />
                                    </div> 
                                    <h3>{service.title}</h3>
                                    <p>{service.description}</p>
                                </div>
                            </AnimationWrapper>
                        );
                    })}
                </div>
            </section>

            {/* Portfolio Section (DYNAMIC - Featured Work) */}
            <section className={styles.portfolioSection}>
                <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>Featured Work</h2>
                <div className={styles.portfolioScrollContainer}>
                    {portfolioProjects.map((project, index) => (
                        <AnimationWrapper key={project.id} delay={index * 0.2}>
                            <Link href={`/portfolio/${project.id}`} className={styles.portfolioCard}>
                                <div className={styles.portfolioImageWrapper}>
                                    {project.coverImageURL ? (
                                        <Image
                                            src={project.coverImageURL}
                                            alt={project.title}
                                            fill
                                            sizes="(max-width: 768px) 280px, 350px"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className={styles.noImagePlaceholder}>
                                            <span style={{ color: 'var(--color-neon-green)', fontWeight: 600 }}>No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.portfolioContent}>
                                    <p className={styles.portfolioCategory}>{project.category}</p>
                                    <h3>{project.title}</h3>
                                    <p style={{marginBottom: '1.2rem', opacity: 0.8}}>{project.content}</p> 
                                </div>
                            </Link>
                        </AnimationWrapper>
                    ))}
                </div>
                <Link href="/portfolio" className={styles.heroButton} style={{ marginTop: '3rem' }}>View All Projects</Link>
            </section>

            {/* Why Choose Us Section */}
            <section className={styles.whyUsSection}>
                <h2 className={styles.sectionTitle}>Why Choose ZORK DI?</h2>
                <div className={styles.whyUsGrid}>
                    {/* NOTE: Dummy Content maintained */}
                    <AnimationWrapper>
                        <div className={styles.whyUsItem}>
                            <div className={styles.whyUsIcon}><WhyUsIcon icon={FaUserShield} /></div>
                            <h3>Secure & Scalable</h3>
                            <p>Our solutions are built with security first and engineered to grow with your business.</p>
                        </div>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.2}>
                        <div className={styles.whyUsItem}>
                            <div className={styles.whyUsIcon}><WhyUsIcon icon={FaRegLightbulb} /></div>
                            <h3>Innovative Mindset</h3>
                            <p>We leverage cutting-edge technologies to deliver truly modern and efficient products.</p>
                        </div>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.4}>
                        <div className={styles.whyUsItem}>
                            <div className={styles.whyUsIcon}><WhyUsIcon icon={FaRocket} /></div>
                            <h3>Speed & Delivery</h3>
                            <p>Agile development focused on fast iteration and timely, high-quality product delivery.</p>
                        </div>
                    </AnimationWrapper>
                </div>
            </section>
            
            {/* NAYA FEATURE: Testimonials Section (Ratings/Reviews Display and Rate Button) */}
            <section className={styles.testimonialsSection}>
                <h2 className={styles.sectionTitle}>Client Testimonials</h2>
                {/* FIX 4: Subtitle ko sectionSubtitle class diya */}
                <p className={styles.sectionSubtitle} style={{ opacity: 0.7, fontSize: '1.2rem', marginBottom: '3rem' }}>We turn complex challenges into simple, elegant digital products. See what our clients say.</p>
                
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading testimonials...</div>
                ) : (
                    <>
                        {/* 1. Overall Rating (DYNAMIC) */}
                         <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <div style={{ display: 'inline-flex', gap: '5px', color: 'var(--color-neon-green)' }}>
                                {renderOverallStars(averageRating)} {/* DYNAMIC STARS */}
                            </div>
                            {/* FIX: Overall rating ka dynamic value */}
                            <p style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.5rem' }}>{averageRating.toFixed(1)} / 5.0 Rating</p>
                            <p style={{ opacity: 0.7 }}>Based on {totalReviewsCount} client reviews</p>
                        </div>
                        
                        {/* 2. Review Cards */}
                        {latestReviews.length > 0 ? (
                            <div className={styles.whyUsGrid} style={{ marginTop: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                                {latestReviews.map((review, index) => (
                                    <AnimationWrapper key={review.id} delay={index * 0.1}>
                                        <div className={styles.whyUsItem} style={{ textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                            <FaQuoteLeft style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2rem', opacity: 0.1, color: 'var(--color-neon-green)' }} />
                                            
                                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', flexGrow: 1 }}>
                                                {/* FIX 6: Unescaped quotes error fix - Outer quotes removed */}
                                                {review.comment}
                                            </p>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--color-off-white)' }}>- {review.userName}</div>
                                                <StarRating rating={review.rating} />
                                            </div>
                                        </div>
                                    </AnimationWrapper>
                                ))}
                            </div>
                        ) : (
                             <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.8 }}>No approved testimonials yet. Be the first to rate us!</p>
                        )}
                        
                        {/* 3. Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '3rem' }}>
                            
                            {/* NAYA BUTTON: Rate Your Rating */}
                            <button 
                                onClick={openReviewModal} 
                                className={styles.heroButton} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px'
                                }}
                            >
                                <FaStar /> Rate Your Experience
                            </button>
                            
                            {/* FIX 5: View All Reviews button ko secondary class diya */}
                            <Link href="/reviews" className={`${styles.heroButton} ${styles.secondary}`} style={{ display: 'flex', alignItems: 'center' }}>
                                View All Reviews
                            </Link>
                        </div>
                    </>
                )}
            </section>
            
            {/* Blog Section (DYNAMIC) */}
            <section className={styles.blogSection}>
                <h2 className={styles.sectionTitle}>Latest Tech Insights</h2>
                <p style={{ opacity: 0.7, fontSize: '1.2rem', marginBottom: '3rem' }}>Stay updated with the latest in web development, design, and mobile tech.</p>
                
                {blogPosts[0]?.id === 'dummy1' && blogPosts.length === 1 ? (
                    <div style={{ 
                        padding: '2rem', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: '12px', 
                        opacity: 0.8, 
                        maxWidth: '600px', 
                        margin: '0 auto',
                        backgroundColor: 'var(--color-deep-blue)'
                    }}>
                        <FaNewspaper style={{marginRight: '0.5rem', color: 'var(--color-neon-green)'}}/> 
                        {blogPosts[0].summary}
                    </div>
                ) : (
                    <div className={styles.blogGrid} style={{ gap: '2rem' }}>
                        {blogPosts.map((post, index) => (
                            <AnimationWrapper key={post.id} delay={index * 0.2}>
                                <Link href={`/blog/${post.slug}`} className={styles.blogCard}>
                                    <div className={styles.blogImageWrapper}>
                                        {post.coverImageURL ? (
                                            <Image
                                                src={post.coverImageURL}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 280px, 350px"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className={styles.noImagePlaceholder}>
                                                <span style={{ color: 'var(--color-neon-green)', fontWeight: 600 }}>No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '0 1.2rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '1.2rem', color: 'var(--color-neon-green)' }}>
                                            {/* Date formatting code is correct */}
                                            {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Draft'}
                                        </p>
                                        <h3>{post.title}</h3>
                                        <p style={{marginBottom: '1.2rem', opacity: 0.8}}>{post.summary}</p>
                                    </div>
                                </Link>
                            </AnimationWrapper>
                        ))}
                    </div>
                )}
                
                <Link href="/blog" className={styles.heroButton} style={{ marginTop: '3rem' }}>Read All Insights</Link>
            </section>

            {/* Review Modal component */}
            <ReviewModal 
                isOpen={isReviewModalOpen} 
                onClose={closeReviewModal} 
            />
        </main>
    );
};

export default HomePage;