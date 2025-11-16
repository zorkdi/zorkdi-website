// app/page.tsx

"use client"; 

import Link from 'next/link';
import styles from './page.module.css';
// NAYA: Unused icons (FaMobileAlt, FaChartLine, FaDesktop, FaQuoteLeft) hata diye
import { FaLaptopCode, FaDraftingCompass, FaRegLightbulb, FaUserShield, FaRocket, FaNewspaper, FaStar, FaArrowRight } from "react-icons/fa";
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, Timestamp, where } from 'firebase/firestore';
import { db } from '@/firebase';
import Image from 'next/image'; 

import React, { useState, useEffect } from 'react';
import ReviewModal from '@/components/ReviewModal/ReviewModal';

// Components (Inko CSS restyle kar dega)
import VisitorTracker from "@/components/VisitorTracker/VisitorTracker";
// NAYA: Unused import (AnimatedBackground) hata diya
// import AnimatedBackground from "@/components/AnimatedBackground/AnimatedBackground";
import TrustBar from "@/components/TrustBar/TrustBar";
import TestimonialSlider from "@/components/TestimonialSlider/TestimonialSlider";
import CallToActionBar from "@/components/CallToActionBar/CallToActionBar";
import FounderNote from "@/components/FounderNote/FounderNote";

// === NAYA: SECURITY FIX - AuthContext import kiya ===
import { useAuth } from '@/context/AuthContext';


// Helper Components
const FeatureIcon = ({ icon: Icon }: { icon: React.ElementType }) => <Icon />;


// --- Interfaces ---
interface ServiceOffering { id: string; title: string; description: string; offerings: string[]; }
interface ServicesContent { heroHeadline: string; heroSubheadline: string; heroButtonText: string; services: ServiceOffering[]; }
interface BlogPreview { id: string; title: string; slug: string; coverImageURL: string; summary: string; createdAt: Timestamp | null; }

interface PortfolioPreview { 
    id: string; 
    title: string; 
    category: string; 
    coverImageURL: string; 
    content: string; 
}

interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Timestamp;
}

// NAYA: Global Settings (Stats ke liye)
interface GlobalSettings {
    statProjects: string;
    statTeam: string;
    statClients: string;
    statYears: string;
}


// --- Fallback Data (Instant Rendering Ke Liye) ---
const fallbackServiceData: ServicesContent = {
    heroHeadline: "Our Digital Engineering Services",
    heroSubheadline: "Transforming complex ideas into clean, high-performance, and scalable software solutions.",
    heroButtonText: "Explore Our Services", 
    services: [
        { id: '1', title: 'Custom Web Apps', description: 'Building fast, secure, and resilient web applications using modern frameworks.', offerings: [] },
        { id: '2', title: 'Mobile App Development', description: 'Creating engaging native and cross-platform mobile experiences for iOS and Android.', offerings: [] },
        { id: '3', title: 'UI/UX Design & Branding', description: 'Focusing on user-centric design to create intuitive, beautiful interfaces.', offerings: [] },
        { id: '4', title: 'Custom Software', description: 'Tailored software development for unique business needs and internal tools.', offerings: [] },
        { id: '5', title: 'Digital Marketing', description: 'Driving measurable ROI through data-backed SEO, content strategy, and campaign.', offerings: [] },
        { id: '6', title: 'Desktop Solutions', description: 'Building robust, high-performance Windows and cross-platform desktop software.', offerings: [] },
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
// NAYA: Fallback Stats
const fallbackGlobalSettings: GlobalSettings = {
    statProjects: "...",
    statTeam: "...",
    statClients: "...",
    statYears: "...",
};


// --- Data Fetching Functions ---
// (Yeh functions waise hi rahenge, content fetch karte hain)

const fetchServiceContent = async (): Promise<ServicesContent> => {
    try {
        const docRef = doc(db, 'cms', 'services_page');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as Partial<ServicesContent>;
            // Ensure services array exists and is not empty
            if (data.services && data.services.length > 0) {
                 return { ...fallbackServiceData, ...data };
            }
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

const fetchLatestReviewsAndStats = async (): Promise<{ reviews: Review[], avgRating: number, totalCount: number }> => {
    try {
        const reviewsRef = collection(db, 'reviews');
        const qAllApproved = query(reviewsRef, where('status', '==', 'approved'));
        const snapshotAll = await getDocs(qAllApproved);
        
        const totalCount = snapshotAll.size;
        let avgRating = 0;
        
        if (totalCount > 0) {
            const totalRating = snapshotAll.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
            avgRating = totalRating / totalCount;
        }

        const qLatest = query(qAllApproved, orderBy('createdAt', 'desc'), limit(10)); // LIMIT badhaya for slider
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

// NAYA: Stats data fetch karne ka function
const fetchGlobalSettings = async (): Promise<GlobalSettings> => {
    try {
        const docRef = doc(db, 'cms', 'global_settings');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                statProjects: data.statProjects || fallbackGlobalSettings.statProjects,
                statTeam: data.statTeam || fallbackGlobalSettings.statTeam,
                statClients: data.statClients || fallbackGlobalSettings.statClients,
                statYears: data.statYears || fallbackGlobalSettings.statYears,
            };
        }
    } catch (error) {
        console.error("Error fetching global settings:", error);
    }
    return fallbackGlobalSettings;
};


const HomePage = () => {
    // === NAYA: SECURITY FIX - Auth hook ko initialize kiya ===
    const { currentUser, userProfile } = useAuth();
    
    const [serviceContent, setServiceContent] = useState<ServicesContent>(fallbackServiceData);
    const [blogPosts, setBlogPosts] = useState<BlogPreview[]>(fallbackBlogPosts); 
    const [portfolioProjects, setPortfolioProjects] = useState<PortfolioPreview[]>(fallbackPortfolio); 
    
    const [latestReviews, setLatestReviews] = useState<Review[]>([]);
    const [totalReviewsCount, setTotalReviewsCount] = useState(0);
    const [averageRating, setAverageRating] = useState(0); 
    
    // NAYA: Global Settings state
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(fallbackGlobalSettings);

    const [isLoading, setIsLoading] = useState(true); 
    // NAYA: Unused state (isClient) hata diya
    // const [isClient, setIsClient] = useState(false); 

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    
    const openReviewModal = () => setIsReviewModalOpen(true);
    const closeReviewModal = () => {
        setIsReviewModalOpen(false);
        fetchData(); 
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // NAYA: fetchGlobalSettings ko Promise.all mein add kiya
            const [fetchedServices, fetchedPosts, fetchedProjects, statsResult, fetchedGlobalSettings] = await Promise.all([
                fetchServiceContent(), 
                fetchBlogPosts(), 
                fetchPortfolioProjects(),
                fetchLatestReviewsAndStats(),
                fetchGlobalSettings() // Naya fetch
            ]);
            
            setServiceContent(fetchedServices);
            setBlogPosts(fetchedPosts);
            setPortfolioProjects(fetchedProjects); 
            setLatestReviews(statsResult.reviews); 
            setAverageRating(statsResult.avgRating);
            setTotalReviewsCount(statsResult.totalCount); 
            setGlobalSettings(fetchedGlobalSettings); // Naya state set kiya

        } catch (error) {
            console.error("Error fetching homepage content in client useEffect:", error);
        } finally {
            setIsLoading(false); 
        }
    };
    
    useEffect(() => {
        // NAYA: Unused state (isClient) hata diya
        // setIsClient(true); 
        fetchData();
    }, []); 


    // Helper: StarRating (Overall)
    const renderOverallStars = (rating: number) => {
        const totalStars = 5;
        const roundedRating = Math.round(rating);
        return [...Array(totalStars)].map((_, i) => (
            <FaStar 
                key={i} 
                style={{ color: i < roundedRating ? 'var(--color-neon-green)' : '#444' }} 
            />
        ));
    };
    
    
    return (
        <main className={styles.main}>
            {/* NAYA: Unused component (AnimatedBackground) hata diya */}
            <VisitorTracker />
            
            {/* --- 
            --- NAYA: HERO SECTION (VIDEO BACKGROUND)
            ---
            */}
            <div className={styles.heroSpacer}>
                 <section className={styles.heroFixedContent}>
                    
                    {/* --- NAYA: HERO VIDEO BACKGROUND --- */}
                    <video 
                        className={styles.heroBackgroundVideo}
                        src="/videos/hero-bg.mp4" // YAHAN APNA VIDEO PATH DAALEIN (e.g., /videos/hero-bg.mp4)
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                    />
                    {/* --- END VIDEO --- */}

                    <div className={styles.heroContentWrapper}> 
                        
                        {/* === NAYA: SECURITY FIX === */}
                        {currentUser && userProfile?.email === 'admin@zorkdi.com' && (
                            <AnimationWrapper delay={0.1}>
                                <Link href="/admin" className={styles.newFeatureLozenge}>
                                    <span>New Feature</span>
                                    Checkout the team dashboard <FaArrowRight style={{ fontSize: '0.8rem' }} />
                                </Link>
                            </AnimationWrapper>
                        )}
                        
                        <AnimationWrapper delay={0.2}>
                            <h1 className={styles.heroHeadline}>{serviceContent.heroHeadline}</h1>
                        </AnimationWrapper>
                        <AnimationWrapper delay={0.3}>
                            <p className={styles.heroSubheadline}>{serviceContent.heroSubheadline}</p>
                        </AnimationWrapper>
                        
                        <AnimationWrapper delay={0.4}>
                            <div className={styles.heroButtonContainer}>
                                
                                {/* === FIX: BUTTON STYLE CHANGE === */}
                                <Link 
                                    href="/new-project" 
                                    className={`${styles.heroButton} ${styles.primaryOutline}`} /* heroPrimaryButton se primaryOutline kiya */
                                >
                                    Start a Project
                                </Link>
                                
                                {/* === FIX: BUTTON STYLE CHANGE === */}
                                <Link 
                                    href="/services" 
                                    className={`${styles.heroButton} ${styles.secondary}`} /* primaryOutline se secondary (purple) kiya */
                                >
                                    {serviceContent.heroButtonText}
                                </Link>
                            </div>
                        </AnimationWrapper>
                    </div>
                </section>
            </div>
            
            {/* --- 
            --- TRUST BAR (Component) 
            ---
            */}
            <TrustBar /> 


            {/* --- 
            --- NAYA: FEATURES SECTION (Medvolve Style) 
            ---
            */}
            <section className={styles.featuresSection}>
                <div className={styles.featuresGrid}>
                    <AnimationWrapper>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><FeatureIcon icon={FaUserShield} /></div>
                            <h3>Secure & Scalable</h3>
                            <p>Our solutions are built with security first and engineered to grow with your business.</p>
                        </div>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.2}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><FeatureIcon icon={FaRegLightbulb} /></div>
                            <h3>Innovative Mindset</h3>
                            <p>We leverage cutting-edge technologies to deliver truly modern and efficient products.</p>
                        </div>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.4}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><FeatureIcon icon={FaRocket} /></div>
                            <h3>Speed & Delivery</h3>
                            <p>Agile development focused on fast iteration and timely, high-quality product delivery.</p>
                        </div>
                    </AnimationWrapper>
                </div>
            </section>
            

            {/* --- 
            --- NAYA: "EMPOWERING" SECTION (FounderNote Component)
            ---
            */}
            <FounderNote />
            
            
            {/* --- 
            --- NAYA: STATS SECTION (DYNAMIC)
            ---
            */}
            <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    <AnimationWrapper>
                        <div className={styles.statItem}>
                            {/* NAYA: Dynamic Data */}
                            <div className={styles.statNumber}>{globalSettings.statProjects}</div>
                            <div className={styles.statLabel}>Projects Delivered</div>
                        </div>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.2}>
                        <div className={styles.statItem}>
                            {/* NAYA: Dynamic Data */}
                            <div className={styles.statNumber}>{globalSettings.statTeam}</div>
                            <div className={styles.statLabel}>Team Members</div>
                        </div>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.4}>
                         <div className={styles.statItem}>
                            {/* NAYA: Dynamic Data */}
                            <div className={styles.statNumber}>{globalSettings.statClients}</div>
                            <div className={styles.statLabel}>Happy Clients</div>
                        </div>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.6}>
                         <div className={styles.statItem}>
                            {/* NAYA: Dynamic Data */}
                            <div className={styles.statNumber}>{globalSettings.statYears}</div>
                            <div className={styles.statLabel}>Years of Experience</div>
                        </div>
                    </AnimationWrapper>
                </div>
            </section>

            
            {/* --- 
            --- NAYA: SERVICES SECTION (Medvolve Style) 
            ---
            */}
            <section className={styles.servicesSection}>
                <h2 className={styles.sectionTitle}>Our Core Services</h2>
                <p className={styles.sectionSubtitle}>We provide a wide range of digital services, from web and mobile development to complete software solutions.</p>
                
                <div className={styles.servicesGrid}>
                    {serviceContent.services.map((service, index) => {
                        return (
                            <AnimationWrapper key={service.id} delay={index * 0.1}>
                                <div className={styles.serviceCard}>
                                    <h3>{service.title}</h3>
                                    <p>{service.description}</p>
                                </div>
                            </AnimationWrapper>
                        );
                    })}
                </div>
            </section>

            
            {/* --- 
            --- NAYA: VIDEO BANNER SECTION (Medvolve Style)
            ---
            */}
            <section className={styles.videoBannerSection}>
                 <video 
                    className={styles.videoBanner}
                    src="/videos/banner-video.mp4" // YAHAN APNA VIDEO PATH DAALEIN (e.g., /videos/banner-video.mp4)
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                />
                <div className={styles.videoOverlay}></div>
            </section>
            {/* --- (End Video Banner) --- */}
            

            {/* --- 
            --- NAYA: PORTFOLIO SECTION (Medvolve Inspired) 
            ---
            */}
            <section className={styles.portfolioSection}>
                <div className={styles.portfolioHeader}>
                    <h2 className={styles.sectionTitle}>Featured Work</h2>
                     <Link 
                        href="/portfolio" 
                        className={`${styles.heroButton} ${styles.heroPrimaryButton} ${styles.portfolioCtaButton}`} 
                    >
                        View All Projects
                    </Link>
                </div>
                
                <div className={styles.portfolioCarousel}>
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
                                            <span>No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.portfolioContent}>
                                    <p className={styles.portfolioCategory}>{project.category}</p>
                                    <h3>{project.title}</h3>
                                    <p>{project.content}</p> 
                                </div>
                            </Link>
                        </AnimationWrapper>
                    ))}
                </div>
            </section>
            
            
            {/* --- 
            --- NAYA: CTA BAR (Medvolve Inspired)
            ---
            */}
            <CallToActionBar />
            

            {/* --- 
            --- NAYA: WHY CHOOSE US (Medvolve Style) 
            ---
            */}
            <section className={styles.whyUsSection}>
                 <h2 className={styles.sectionTitle}>Why Choose ZORK DI?</h2>
                 <p className={styles.sectionSubtitle}>We are committed to delivering excellence and innovation in everything we do.</p>
                <div className={styles.whyUsGrid}>
                    <AnimationWrapper>
                        <div className={styles.whyUsItem}>
                            <div className={styles.whyUsIcon}><FeatureIcon icon={FaDraftingCompass} /></div>
                            <h3>Expertise in AI</h3>
                            <p>Leveraging advanced AI to build intelligent and efficient solutions for your business.</p>
                        </div>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.2}>
                        <div className={styles.whyUsItem}>
                            <div className={styles.whyUsIcon}><FeatureIcon icon={FaLaptopCode} /></div>
                            <h3>Seamless Integration</h3>
                            <p>Our products are designed to integrate perfectly with your existing digital ecosystem.</p>
                        </div>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.4}>
                        <div className={styles.whyUsItem}>
                            <div className={styles.whyUsIcon}><FeatureIcon icon={FaRocket} /></div>
                            <h3>Cutting-Edge Tech</h3>
                            <p>We stay ahead of the curve, utilizing the latest technologies to ensure future-proof products.</p>
                        </div>
                    </AnimationWrapper>
                </div>
            </section>
            
            
            {/* --- 
            --- NAYA: TESTIMONIALS SECTION (Medvolve Style) 
            ---
            */}
            <section className={styles.testimonialsSection}>
                {/* FIX: Header (Title + Rating) */}
                <div className={styles.testimonialHeader}>
                    <div className={styles.testimonialTitleWrapper}>
                        <h2 className={styles.sectionTitle}>Client Testimonials</h2>
                        <p className={styles.sectionSubtitle}>See what our clients say about our work.</p>
                    </div>
                    
                    {!isLoading && totalReviewsCount > 0 && (
                        <div className={styles.testimonialRatingWrapper}>
                            <div className={styles.overallRatingStars}>
                                {renderOverallStars(averageRating)}
                            </div>
                            <p className={styles.overallRatingText}>{averageRating.toFixed(1)} / 5.0 Rating</p>
                            <p className={styles.overallRatingCount}>Based on {totalReviewsCount} client reviews</p>
                        </div>
                    )}
                </div>
                
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading testimonials...</div>
                ) : (
                    <>
                        {/* Slider Component (CSS isko restyle karega) */}
                        <TestimonialSlider reviews={latestReviews} />
                        
                        {/* NAYA: Action Buttons (Center aligned) */}
                        <div className={styles.testimonialActions}>
                            <button 
                                onClick={openReviewModal} 
                                className={`${styles.heroButton} ${styles.primaryOutline}`} 
                                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                <FaStar /> Rate Your Experience
                            </button>
                            
                            <Link href="/reviews" className={`${styles.heroButton} ${styles.secondary}`}>
                                View All Reviews
                            </Link>
                        </div>
                    </>
                )}
            </section>
            
            
            {/* --- 
            --- NAYA: BLOG SECTION (Medvolve Inspired) 
            ---
            */}
            <section className={styles.blogSection}>
                <h2 className={styles.sectionTitle}>Latest Tech Insights</h2>
                <p className={styles.sectionSubtitle}>Stay updated with the latest in web development, design, and mobile tech.</p>
                
                {blogPosts[0]?.id === 'dummy1' && blogPosts.length === 1 ? (
                    <div style={{ padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', opacity: 0.8, maxWidth: '600px', backgroundColor: 'var(--color-deep-blue)'}}>
                        <FaNewspaper style={{marginRight: '0.5rem', color: 'var(--color-neon-green)'}}/> 
                        {blogPosts[0].summary}
                    </div>
                ) : (
                    <div className={styles.blogGrid}>
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
                                                <span>No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* NAYA: Blog Card content structure */}
                                    <div className={styles.blogCardContent}>
                                        <p className={styles.blogDate}>
                                            {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Draft'}
                                        </p>
                                        <h3>{post.title}</h3>
                                        <p>{post.summary}</p>
                                    </div>
                                </Link>
                            </AnimationWrapper>
                        ))}
                    </div>
                )}
                
                <Link 
                    href="/blog" 
                    className={`${styles.heroButton} ${styles.primaryOutline} ${styles.blogCtaButton}`} 
                >
                    Read All Insights
                </Link>
            </section>

            {/* Review Modal component (Waise hi rahega) */}
            <ReviewModal 
                isOpen={isReviewModalOpen} 
                onClose={closeReviewModal} 
            />
        </main>
    );
};

export default HomePage;