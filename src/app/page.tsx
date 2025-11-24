// app/page.tsx

"use client"; 

import Link from 'next/link';
import styles from './page.module.css';
import { 
    FaLaptopCode, 
    FaDraftingCompass, 
    FaRegLightbulb, 
    FaUserShield, 
    FaRocket, 
    FaNewspaper, 
    FaStar, 
    FaArrowRight, 
    FaMobileAlt, 
    FaAndroid, 
    FaApple, 
    FaDownload,
    FaTimes,
    // Naye Icons Clean UI ke liye
    FaBell,
    FaBolt,
    FaWallet,
    FaHome,
    FaChartPie,
    FaCog
} from "react-icons/fa";
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, Timestamp, where } from 'firebase/firestore';
import { db } from '@/firebase';
import Image from 'next/image'; 

import React, { useState, useEffect, useRef } from 'react';
import ReviewModal from '@/components/ReviewModal/ReviewModal';

// Components
import VisitorTracker from "@/components/VisitorTracker/VisitorTracker";
import TrustBar from "@/components/TrustBar/TrustBar";
import TestimonialSlider from "@/components/TestimonialSlider/TestimonialSlider";
import CallToActionBar from "@/components/CallToActionBar/CallToActionBar";
import FounderNote from "@/components/FounderNote/FounderNote";

import { useAuth } from '@/context/AuthContext';

// Helper Components
const FeatureIcon = ({ icon: Icon }: { icon: React.ElementType }) => <Icon />;

// --- Interfaces ---
interface ServiceOffering { id: string; title: string; description: string; offerings: string[]; }
interface ServicesContent { heroHeadline: string; heroSubheadline: string; heroButtonText: string; services: ServiceOffering[]; }
interface BlogPreview { id: string; title: string; slug: string; coverImageURL: string; summary: string; createdAt: Timestamp | null; }
interface PortfolioPreview { id: string; title: string; category: string; coverImageURL: string; content: string; }
interface Review { id: string; userName: string; rating: number; comment: string; createdAt: Timestamp; }
interface GlobalSettings { statProjects: string; statTeam: string; statClients: string; statYears: string; }

// --- Fallback Data ---
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
const fallbackGlobalSettings: GlobalSettings = {
    statProjects: "...", statTeam: "...", statClients: "...", statYears: "...",
};

// --- Fetch Functions ---
const fetchServiceContent = async (): Promise<ServicesContent> => {
    try {
        const docRef = doc(db, 'cms', 'services_page');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as Partial<ServicesContent>;
            if (data.services && data.services.length > 0) return { ...fallbackServiceData, ...data };
        }
    } catch (error) { console.error("Error", error); }
    return fallbackServiceData;
};
const fetchBlogPosts = async (): Promise<BlogPreview[]> => {
    try {
        const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return fallbackBlogPosts;
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, title: data.title, slug: data.slug, coverImageURL: data.coverImageURL || '', summary: data.summary || data.content?.substring(0, 80).replace(/<\/?[^>]+(>|$)/g, "") + '...', createdAt: data.createdAt || null, } as BlogPreview;
        });
    } catch (error) { return fallbackBlogPosts; }
};
const fetchPortfolioProjects = async (): Promise<PortfolioPreview[]> => {
    try {
        const q = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return fallbackPortfolio;
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const cleanContent = data.content ? data.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').substring(0, 80) + '...' : 'Project description is missing.';
            return { id: doc.id, title: data.title, category: data.category, content: cleanContent, coverImageURL: data.coverImageURL || '', } as PortfolioPreview;
        });
    } catch (error) { return fallbackPortfolio; }
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
        const qLatest = query(qAllApproved, orderBy('createdAt', 'desc'), limit(10));
        const snapshotLatest = await getDocs(qLatest);
        const latestReviews = snapshotLatest.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, userName: data.userName || 'Anonymous', rating: data.rating || 5, comment: data.comment || 'Excellent service!', createdAt: data.createdAt as Timestamp, } as Review;
        });
        return { reviews: latestReviews, avgRating, totalCount };
    } catch (error) { return { reviews: [], avgRating: 0, totalCount: 0 }; }
};
const fetchGlobalSettings = async (): Promise<GlobalSettings> => {
    try {
        const docRef = doc(db, 'cms', 'global_settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return { statProjects: data.statProjects || fallbackGlobalSettings.statProjects, statTeam: data.statTeam || fallbackGlobalSettings.statTeam, statClients: data.statClients || fallbackGlobalSettings.statClients, statYears: data.statYears || fallbackGlobalSettings.statYears, };
        }
    } catch (error) { console.error("Error", error); }
    return fallbackGlobalSettings;
};

const HomePage = () => {
    const { currentUser, userProfile } = useAuth();
    const [serviceContent, setServiceContent] = useState<ServicesContent>(fallbackServiceData);
    const [blogPosts, setBlogPosts] = useState<BlogPreview[]>(fallbackBlogPosts);
    const [portfolioProjects, setPortfolioProjects] = useState<PortfolioPreview[]>(fallbackPortfolio);
    const [latestReviews, setLatestReviews] = useState<Review[]>([]);
    const [totalReviewsCount, setTotalReviewsCount] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(fallbackGlobalSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // --- SLIDER & MODAL STATE ---
    const [currentSlide, setCurrentSlide] = useState(0); // 0 = Services, 1 = App Promo
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);
    const slideInterval = useRef<NodeJS.Timeout | null>(null);

    // --- PLEXUS CANVAS LOGIC (Sharp & Clean) ---
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        
        // FIX: Retina Display Sharpness
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Settings for Sharp Look
        const particleCount = width < 768 ? 40 : 80; 
        const connectionDistance = 180; 
        const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];

        // ZORK DI BRAND COLORS
        const colors = ['#00F5C8', '#8b5cf6', '#ffffff']; 

        // Create Particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4, 
                vy: (Math.random() - 0.5) * 0.4, 
                size: Math.random() * 1.5 + 0.5, 
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Draw Dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 5; 
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.shadowBlur = 0; 

                // Connect lines
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        const opacity = 1 - dist / connectionDistance;
                        
                        ctx.strokeStyle = p.color === '#00F5C8' 
                            ? `rgba(0, 245, 200, ${opacity * 0.5})` 
                            : `rgba(139, 92, 246, ${opacity * 0.5})`; 
                        
                        ctx.lineWidth = 0.3; 
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // --- END PLEXUS LOGIC ---

    // --- AUTO SLIDER LOGIC ---
    useEffect(() => {
        startSlider();
        return () => stopSlider();
    }, []);

    const startSlider = () => {
        if (slideInterval.current) clearInterval(slideInterval.current);
        slideInterval.current = setInterval(() => {
            setCurrentSlide(prev => (prev === 0 ? 1 : 0));
        }, 6000); // 6 seconds slide time
    };

    const stopSlider = () => {
        if (slideInterval.current) clearInterval(slideInterval.current);
    };

    const handleDotClick = (index: number) => {
        stopSlider();
        setCurrentSlide(index);
        startSlider(); // Restart timer after manual click
    };
    // --- END SLIDER LOGIC ---

    const openReviewModal = () => setIsReviewModalOpen(true);
    const closeReviewModal = () => { setIsReviewModalOpen(false); fetchData(); };
    
    // App Modal Handlers
    const openAppModal = () => {
        setIsAppModalOpen(true);
        stopSlider(); // Stop slider when modal is open
    };
    const closeAppModal = () => {
        setIsAppModalOpen(false);
        startSlider(); // Resume slider
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [fetchedServices, fetchedPosts, fetchedProjects, statsResult, fetchedGlobalSettings] = await Promise.all([
                fetchServiceContent(), fetchBlogPosts(), fetchPortfolioProjects(), fetchLatestReviewsAndStats(), fetchGlobalSettings()
            ]);
            setServiceContent(fetchedServices); setBlogPosts(fetchedPosts); setPortfolioProjects(fetchedProjects); setLatestReviews(statsResult.reviews); setAverageRating(statsResult.avgRating); setTotalReviewsCount(statsResult.totalCount); setGlobalSettings(fetchedGlobalSettings);
        } catch (error) { console.error("Error", error); } finally { setIsLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const renderOverallStars = (rating: number) => {
        const totalStars = 5;
        const roundedRating = Math.round(rating);
        return [...Array(totalStars)].map((_, i) => (<FaStar key={i} style={{ color: i < roundedRating ? 'var(--color-neon-green)' : '#444' }} />));
    };

    return (
        <main className={styles.main}>
            <VisitorTracker />
            
            {/* --- HERO SECTION --- */}
            <div className={styles.heroSpacer}>
                 <section className={styles.heroFixedContent}>
                    
                    {/* Canvas Background */}
                    <canvas ref={canvasRef} className={styles.plexusCanvas} />

                    {/* SLIDE 1: DEFAULT SERVICES CONTENT */}
                    <div className={`${styles.heroContentWrapper} ${styles.slideOne} ${currentSlide === 0 ? styles.slideActive : styles.slideHidden}`}> 
                        {currentUser && userProfile?.email === 'admin@zorkdi.com' && (
                            <AnimationWrapper delay={0.1}>
                                <Link href="/admin" className={styles.newFeatureLozenge}>
                                    <span>Admin</span> Go to Dashboard <FaArrowRight style={{ fontSize: '0.8rem' }} />
                                </Link>
                            </AnimationWrapper>
                        )}
                        <AnimationWrapper delay={0.2}><h1 className={styles.heroHeadline}>{serviceContent.heroHeadline}</h1></AnimationWrapper>
                        <AnimationWrapper delay={0.3}><p className={styles.heroSubheadline}>{serviceContent.heroSubheadline}</p></AnimationWrapper>
                        <AnimationWrapper delay={0.4}>
                            <div className={styles.heroButtonContainer}>
                                <Link href="/new-project" className={`${styles.heroButton} ${styles.primaryOutline}`}>Start a Project</Link>
                                <Link href="/services" className={`${styles.heroButton} ${styles.secondary}`}>{serviceContent.heroButtonText}</Link>
                            </div>
                        </AnimationWrapper>
                    </div>

                    {/* SLIDE 2: APP LAUNCH PROMO (UPDATED LAYOUT) */}
                    <div className={`${styles.heroContentWrapper} ${styles.appSlideWrapper} ${styles.slideTwo} ${currentSlide === 1 ? styles.slideActive : styles.slideHidden}`}>
                        <div className={styles.appSlideText}>
                            <AnimationWrapper delay={0.1}>
                                <div className={styles.newFeatureLozenge} style={{borderColor: 'var(--color-neon-green)', color: 'var(--color-neon-green)'}}>
                                    <span style={{backgroundColor: 'var(--color-neon-green)', color: 'black'}}>NEW</span> Mobile App Launched
                                </div>
                            </AnimationWrapper>
                            <AnimationWrapper delay={0.2}>
                                <h1 className={styles.heroHeadline} style={{ fontSize: '3.5rem' }}>Experience ZORK DI on the Go.</h1>
                            </AnimationWrapper>
                            <AnimationWrapper delay={0.3}>
                                <p className={styles.heroSubheadline}>
                                    Manage your projects, track progress, and get instant support directly from your pocket. Download the official ZORK DI app today.
                                </p>
                            </AnimationWrapper>
                            <AnimationWrapper delay={0.4}>
                                <div className={styles.heroButtonContainer}>
                                    <button onClick={openAppModal} className={`${styles.heroButton} ${styles.heroPrimaryButton}`}>
                                        <FaDownload style={{ marginRight: '0.5rem' }} /> Download App
                                    </button>
                                </div>
                            </AnimationWrapper>
                        </div>

                        {/* Visual Mockup (Right Side) - NEW CLEAN UI */}
                        <div className={styles.appSlideVisual}>
                            <AnimationWrapper delay={0.5}>
                                <div className={styles.phoneMockup}>
                                    <div className={`${styles.phoneBtn} ${styles.vol}`}></div>
                                    <div className={`${styles.phoneBtn} ${styles.pwr}`}></div>
                                    
                                    <div className={styles.phoneScreen}>
                                        {/* Dynamic Island Notch */}
                                        <div className={styles.notch}>
                                            <div className={styles.notchCam}></div>
                                        </div>

                                        <div className={styles.screenContent}>
                                            <div className={styles.appHeader}>
                                                <div className={styles.logoBrand}>ZORK<span>DI</span></div>
                                                <FaBell style={{color: '#fff', fontSize: '1.1rem'}} />
                                            </div>

                                            {/* Main Glass Card */}
                                            <div className={styles.statusCard}>
                                                <div className={styles.cardTitle}>Project Status</div>
                                                <div className={styles.cardBigNum}>
                                                    94% <div className={styles.pulseDot}></div>
                                                </div>
                                                <div className={styles.graphPlaceholder}>
                                                    <div className={`${styles.gBar} ${styles.active}`} style={{height: '40%'}}></div>
                                                    <div className={`${styles.gBar} ${styles.active}`} style={{height: '60%'}}></div>
                                                    <div className={`${styles.gBar} ${styles.active}`} style={{height: '85%'}}></div>
                                                    <div className={`${styles.gBar} ${styles.active}`} style={{height: '50%'}}></div>
                                                    <div className={`${styles.gBar} ${styles.active}`} style={{height: '70%'}}></div>
                                                </div>
                                            </div>

                                            {/* Activity List */}
                                            <div className={styles.activityList}>
                                                <div className={styles.listItem}>
                                                    <div className={`${styles.iconBox} ${styles.purple}`}>
                                                        <FaBolt />
                                                    </div>
                                                    <div className={styles.itemText}>
                                                        <h4>System Live</h4>
                                                        <p>Deployment successful</p>
                                                    </div>
                                                </div>
                                                <div className={styles.listItem}>
                                                    <div className={`${styles.iconBox} ${styles.blue}`}>
                                                        <FaWallet />
                                                    </div>
                                                    <div className={styles.itemText}>
                                                        <h4>Payment Received</h4>
                                                        <p>Invoice #2024-09</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Dock */}
                                            <div className={styles.dock}>
                                                <div className={`${styles.dockItem} ${styles.active}`}><FaHome /></div>
                                                <div className={styles.dockItem}><FaChartPie /></div>
                                                <div className={styles.dockItem}><FaCog /></div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </AnimationWrapper>
                        </div>
                    </div>

                    {/* SLIDER INDICATORS (DOTS) */}
                    <div className={styles.sliderIndicators}>
                        <div 
                            className={`${styles.indicatorDot} ${currentSlide === 0 ? styles.activeDot : ''}`}
                            onClick={() => handleDotClick(0)}
                        ></div>
                        <div 
                            className={`${styles.indicatorDot} ${currentSlide === 1 ? styles.activeDot : ''}`}
                            onClick={() => handleDotClick(1)}
                        ></div>
                    </div>

                </section>
            </div>
            
            <TrustBar /> 
            
            <section className={styles.featuresSection}>
                <div className={styles.featuresGrid}>
                    <AnimationWrapper><div className={styles.featureCard}><div className={styles.featureIcon}><FeatureIcon icon={FaUserShield} /></div><h3>Secure & Scalable</h3><p>Our solutions are built with security first and engineered to grow with your business.</p></div></AnimationWrapper>
                    <AnimationWrapper delay={0.2}><div className={styles.featureCard}><div className={styles.featureIcon}><FeatureIcon icon={FaRegLightbulb} /></div><h3>Innovative Mindset</h3><p>We leverage cutting-edge technologies to deliver truly modern and efficient products.</p></div></AnimationWrapper>
                    <AnimationWrapper delay={0.4}><div className={styles.featureCard}><div className={styles.featureIcon}><FeatureIcon icon={FaRocket} /></div><h3>Speed & Delivery</h3><p>Agile development focused on fast iteration and timely, high-quality product delivery.</p></div></AnimationWrapper>
                </div>
            </section>
            
            <FounderNote />
            
            <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    <AnimationWrapper><div className={styles.statItem}><div className={styles.statNumber}>{globalSettings.statProjects}</div><div className={styles.statLabel}>Projects Delivered</div></div></AnimationWrapper>
                    <AnimationWrapper delay={0.2}><div className={styles.statItem}><div className={styles.statNumber}>{globalSettings.statTeam}</div><div className={styles.statLabel}>Team Members</div></div></AnimationWrapper>
                    <AnimationWrapper delay={0.4}><div className={styles.statItem}><div className={styles.statNumber}>{globalSettings.statClients}</div><div className={styles.statLabel}>Happy Clients</div></div></AnimationWrapper>
                    <AnimationWrapper delay={0.6}><div className={styles.statItem}><div className={styles.statNumber}>{globalSettings.statYears}</div><div className={styles.statLabel}>Years of Experience</div></div></AnimationWrapper>
                </div>
            </section>
            
            <section className={styles.servicesSection}>
                <h2 className={styles.sectionTitle}>Our Core Services</h2>
                <p className={styles.sectionSubtitle}>We provide a wide range of digital services, from web and mobile development to complete software solutions.</p>
                <div className={styles.servicesGrid}>
                    {serviceContent.services.map((service, index) => (
                        <AnimationWrapper key={service.id} delay={index * 0.1}><div className={styles.serviceCard}><h3>{service.title}</h3><p>{service.description}</p></div></AnimationWrapper>
                    ))}
                </div>
            </section>
            
            <section className={styles.portfolioSection}>
                <div className={styles.portfolioHeader}><h2 className={styles.sectionTitle}>Featured Work</h2><Link href="/portfolio" className={`${styles.heroButton} ${styles.heroPrimaryButton} ${styles.portfolioCtaButton}`}>View All Projects</Link></div>
                <div className={styles.portfolioCarousel}>
                    {portfolioProjects.map((project, index) => (
                        <AnimationWrapper key={project.id} delay={index * 0.2}>
                            <Link href={`/portfolio/${project.id}`} className={styles.portfolioCard}>
                                <div className={styles.portfolioImageWrapper}>{project.coverImageURL ? (<Image src={project.coverImageURL} alt={project.title} fill sizes="(max-width: 768px) 280px, 350px" style={{ objectFit: 'cover' }} />) : (<div className={styles.noImagePlaceholder}><span>No Image</span></div>)}</div>
                                <div className={styles.portfolioContent}><p className={styles.portfolioCategory}>{project.category}</p><h3>{project.title}</h3><p>{project.content}</p></div>
                            </Link>
                        </AnimationWrapper>
                    ))}
                </div>
            </section>
            
            <CallToActionBar />
            
            <section className={styles.whyUsSection}>
                 <h2 className={styles.sectionTitle}>Why Choose ZORK DI?</h2>
                 <p className={styles.sectionSubtitle}>We are committed to delivering excellence and innovation in everything we do.</p>
                <div className={styles.whyUsGrid}>
                    <AnimationWrapper><div className={styles.whyUsItem}><div className={styles.whyUsIcon}><FeatureIcon icon={FaDraftingCompass} /></div><h3>Expertise You Can Trust</h3><p>We believe great software is built by dedicated people. Our team consists of experienced developers and designers who are passionate about quality and precision.</p></div></AnimationWrapper>
                    <AnimationWrapper delay={0.2}><div className={styles.whyUsItem}><div className={styles.whyUsIcon}><FeatureIcon icon={FaLaptopCode} /></div><h3>Your Partner in Success</h3><p>We take the time to truly understand your business challenges. Our goal is to build solutions that not only work perfectly but also help you achieve your long-term objectives.</p></div></AnimationWrapper>
                    <AnimationWrapper delay={0.4}><div className={styles.whyUsItem}><div className={styles.whyUsIcon}><FeatureIcon icon={FaUserShield} /></div><h3>Security & Privacy by Design</h3><p>We treat your data and security as our highest priority. Our solutions are engineered with robust safeguards and strict privacy protocols from day one, ensuring your information is always protected.</p></div></AnimationWrapper>
                </div>
            </section>
            
            <section className={styles.testimonialsSection}>
                <div className={styles.testimonialHeader}>
                    <div className={styles.testimonialTitleWrapper}><h2 className={styles.sectionTitle}>Client Testimonials</h2><p className={styles.sectionSubtitle}>See what our clients say about our work.</p></div>
                    {!isLoading && totalReviewsCount > 0 && (<div className={styles.testimonialRatingWrapper}><div className={styles.overallRatingStars}>{renderOverallStars(averageRating)}</div><p className={styles.overallRatingText}>{averageRating.toFixed(1)} / 5.0 Rating</p><p className={styles.overallRatingCount}>Based on {totalReviewsCount} client reviews</p></div>)}
                </div>
                {isLoading ? (<div style={{ textAlign: 'center', padding: '2rem' }}>Loading testimonials...</div>) : (<><TestimonialSlider reviews={latestReviews} /><div className={styles.testimonialActions}><button onClick={openReviewModal} className={`${styles.heroButton} ${styles.primaryOutline}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaStar /> Rate Your Experience</button><Link href="/reviews" className={`${styles.heroButton} ${styles.secondary}`}>View All Reviews</Link></div></>)}
            </section>
            
            <section className={styles.blogSection}>
                <h2 className={styles.sectionTitle}>Latest Tech Insights</h2>
                <p className={styles.sectionSubtitle}>Stay updated with the latest in web development, design, and mobile tech.</p>
                {blogPosts[0]?.id === 'dummy1' && blogPosts.length === 1 ? (<div style={{ padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', opacity: 0.8, maxWidth: '600px', backgroundColor: 'var(--color-deep-blue)'}}><FaNewspaper style={{marginRight: '0.5rem', color: 'var(--color-neon-green)'}}/> {blogPosts[0].summary}</div>) : (<div className={styles.blogGrid}>{blogPosts.map((post, index) => (<AnimationWrapper key={post.id} delay={index * 0.2}><Link href={`/blog/${post.slug}`} className={styles.blogCard}><div className={styles.blogImageWrapper}>{post.coverImageURL ? (<Image src={post.coverImageURL} alt={post.title} fill sizes="(max-width: 768px) 280px, 350px" style={{ objectFit: 'cover' }} />) : (<div className={styles.noImagePlaceholder}><span>No Image</span></div>)}</div><div className={styles.blogCardContent}><p className={styles.blogDate}>{post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Draft'}</p><h3>{post.title}</h3><p>{post.summary}</p></div></Link></AnimationWrapper>))}</div>)}
                <Link href="/blog" className={`${styles.heroButton} ${styles.primaryOutline} ${styles.blogCtaButton}`}>Read All Insights</Link>
            </section>
            
            <ReviewModal isOpen={isReviewModalOpen} onClose={closeReviewModal} />

            {/* --- NEW: APP DOWNLOAD MODAL --- */}
            {isAppModalOpen && (
                <div className={styles.appModalOverlay} onClick={closeAppModal}>
                    <div className={styles.appModalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeModalButton} onClick={closeAppModal}>
                            <FaTimes />
                        </button>
                        
                        <div className={styles.modalHeader}>
                            <div className={styles.modalIconCircle}>
                                <FaMobileAlt />
                            </div>
                            <h3>Download ZORK DI App</h3>
                            <p>Select your device platform to begin download.</p>
                        </div>

                        <div className={styles.platformGrid}>
                            <div className={styles.platformCard}>
                                <FaAndroid className={styles.platformIcon} style={{color: '#3DDC84'}} />
                                <h4>Android</h4>
                                <p>Get APK or Play Store</p>
                                {/* CHANGE: Replaced Button with Link to public/zorkdi.apk */}
                                <a 
                                    href="/zorkdi.apk" 
                                    download="zorkdi.apk" 
                                    className={styles.downloadActionButton} 
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}
                                >
                                    Download
                                </a>
                            </div>
                            <div className={styles.platformCard}>
                                <FaApple className={styles.platformIcon} style={{color: '#fff'}} />
                                <h4>iOS</h4>
                                <p>App Store / TestFlight</p>
                                <button className={`${styles.downloadActionButton} ${styles.disabledButton}`} disabled>Coming Soon</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
};
export default HomePage;