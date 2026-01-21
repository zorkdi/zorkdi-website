// src/components/HomeClient.tsx

"use client"; 

import Link from 'next/link';
import styles from '@/app/page.module.css'; 
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
    FaBell,
    FaBolt,
    FaWallet,
    FaHome,
    FaChartPie,
    FaCog,
    FaShieldAlt,
    FaLock,
    FaCheckCircle
} from "react-icons/fa";
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
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

// --- Interfaces (UPDATED: Dates are now strings) ---
export interface ServiceOffering { id: string; title: string; description: string; offerings: string[]; }
export interface ServicesContent { heroHeadline: string; heroSubheadline: string; heroButtonText: string; services: ServiceOffering[]; }
export interface BlogPreview { id: string; title: string; slug: string; coverImageURL: string; summary: string; createdAt: string | null; }
export interface PortfolioPreview { id: string; title: string; category: string; coverImageURL: string; content: string; }
export interface Review { id: string; userName: string; rating: number; comment: string; createdAt: string | null; }
export interface GlobalSettings { statProjects: string; statTeam: string; statClients: string; statYears: string; }

// --- Props Interface ---
interface HomeClientProps {
    serviceContent: ServicesContent;
    blogPosts: BlogPreview[];
    portfolioProjects: PortfolioPreview[];
    latestReviews: Review[];
    averageRating: number;
    totalReviewsCount: number;
    globalSettings: GlobalSettings;
}

const HomeClient: React.FC<HomeClientProps> = ({
    serviceContent,
    blogPosts,
    portfolioProjects,
    latestReviews,
    averageRating,
    totalReviewsCount,
    globalSettings
}) => {
    const { currentUser, userProfile } = useAuth();
    
    // UI State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0); 
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);
    
    const slideInterval = useRef<NodeJS.Timeout | null>(null);

    // Touch State for Swipe
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // --- PLEXUS CANVAS LOGIC ---
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const particleCount = width < 768 ? 40 : 90; 
        const connectionDistance = 160; 
        const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];
        
        const colors = ['#D4145A', '#8E2DE2', '#FFFFFF']; 

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3, 
                vy: (Math.random() - 0.5) * 0.3, 
                size: Math.random() * 2 + 0.5, 
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 8; 
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.shadowBlur = 0; 

                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        const opacity = 1 - dist / connectionDistance;
                        
                        if (p.color === '#D4145A' || p2.color === '#D4145A') {
                             ctx.strokeStyle = `rgba(212, 20, 90, ${opacity * 0.4})`; 
                        } else {
                             ctx.strokeStyle = `rgba(142, 45, 226, ${opacity * 0.4})`; 
                        }

                        ctx.lineWidth = 0.4; 
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

    // --- AUTO SLIDER LOGIC ---
    useEffect(() => {
        startSlider();
        return () => stopSlider();
    }, []);

    const startSlider = () => {
        if (slideInterval.current) clearInterval(slideInterval.current);
        slideInterval.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % 3);
        }, 4000); 
    };

    const stopSlider = () => {
        if (slideInterval.current) clearInterval(slideInterval.current);
    };

    const handleDotClick = (index: number) => {
        stopSlider();
        setCurrentSlide(index);
        startSlider(); 
    };

    const getSlideClass = (index: number) => {
        if (index === currentSlide) return styles.slideActive;
        const prevIndex = (currentSlide - 1 + 3) % 3;
        if (index === prevIndex) return styles.slideLeft;
        return styles.slideRight;
    };

    // --- SWIPE LOGIC ---
    const handleTouchStart = (e: React.TouchEvent) => {
        stopSlider(); 
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            setCurrentSlide(prev => (prev + 1) % 3);
        }
        if (isRightSwipe) {
            setCurrentSlide(prev => (prev - 1 + 3) % 3);
        }
        setTouchStart(null);
        setTouchEnd(null);
        startSlider();
    };

    const openReviewModal = () => setIsReviewModalOpen(true);
    const closeReviewModal = () => { setIsReviewModalOpen(false); };
    
    // App Modal Handlers
    const openAppModal = () => {
        setIsAppModalOpen(true);
        stopSlider(); 
    };
    const closeAppModal = () => {
        setIsAppModalOpen(false);
        startSlider(); 
    };

    const renderOverallStars = (rating: number) => {
        const totalStars = 5;
        const roundedRating = Math.round(rating);
        return [...Array(totalStars)].map((_, i) => (<FaStar key={i} style={{ color: i < roundedRating ? '#FFD700' : 'rgba(255,255,255,0.2)' }} />));
    };

    return (
        <main className={styles.main}>
            <VisitorTracker />
            
            {/* --- HERO SECTION --- */}
            <div className={styles.heroSpacer}>
                 <section 
                    className={styles.heroFixedContent}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                 >
                    <canvas ref={canvasRef} className={styles.plexusCanvas} />

                    {/* --- SLIDE 0: iSHIELD LOCK (UPDATED LINK) --- */}
                    <div className={`${styles.heroContentWrapper} ${styles.shieldSlideWrapper} ${getSlideClass(0)}`}>
                        <div className={styles.shieldSlideText}>
                            <AnimationWrapper delay={0.1}>
                                <div className={styles.newFeatureLozenge}>
                                    <span>NEW</span> ENTERPRISE SECURITY
                                </div>
                            </AnimationWrapper>
                            <AnimationWrapper delay={0.2}>
                                {/* Name Change: iShield Lock */}
                                <h1 className={styles.heroHeadline}>iShield Lock</h1>
                            </AnimationWrapper>
                            <AnimationWrapper delay={0.3}>
                                <p className={styles.heroSubheadline}>
                                    The ultimate EMI Locking & Mobile Device Management system. Secure assets, prevent fraud, and control devices globally with military-grade precision.
                                </p>
                            </AnimationWrapper>
                            <AnimationWrapper delay={0.4}>
                                <div className={styles.heroButtonContainer}>
                                    {/* Link FIXED: /ishield-lock (Changed from zorkdi-shield) */}
                                    <Link href="/ishield-lock" className={`${styles.heroButton} ${styles.heroPrimaryButton}`}>
                                        <FaShieldAlt style={{ marginRight: '0.6rem' }} /> Explore iShield
                                    </Link>
                                    {/* New Download Link (Kept as requested) */}
                                    <a 
                                        href="/ishield-lock.apk" 
                                        download="ishield-lock.apk"
                                        className={`${styles.heroButton} ${styles.primaryOutline}`}
                                        style={{textDecoration: 'none'}}
                                    >
                                        <FaDownload style={{ marginRight: '0.6rem' }} /> Download App
                                    </a>
                                </div>
                            </AnimationWrapper>
                        </div>

                        <div className={styles.shieldSlideVisual}>
                            <AnimationWrapper delay={0.5}>
                                <div className={styles.holographicShield}>
                                    <div className={styles.shieldLayer}></div>
                                    <FaLock className={styles.shieldIconMain} />
                                    <div className={styles.shieldStatusBadge}>
                                        <div className={styles.pulseDot}></div> SECURE
                                    </div>
                                </div>
                            </AnimationWrapper>
                        </div>
                    </div>


                    {/* --- SLIDE 1: DEFAULT SERVICES --- */}
                    <div className={`${styles.heroContentWrapper} ${styles.slideOne} ${getSlideClass(1)}`}> 
                        {currentUser && userProfile?.email === 'admin@zorkdi.com' && (
                            <AnimationWrapper delay={0.1}>
                                <Link href="/admin" className={styles.newFeatureLozenge}>
                                    <span>ADMIN</span> Dashboard Access <FaArrowRight style={{ fontSize: '0.8rem', marginLeft: '5px' }} />
                                </Link>
                            </AnimationWrapper>
                        )}
                        <AnimationWrapper delay={0.2}><h1 className={styles.heroHeadline}>{serviceContent.heroHeadline}</h1></AnimationWrapper>
                        <AnimationWrapper delay={0.3}><p className={styles.heroSubheadline}>{serviceContent.heroSubheadline}</p></AnimationWrapper>
                        <AnimationWrapper delay={0.4}>
                            <div className={styles.heroButtonContainer}>
                                <Link href="/new-project" className={`${styles.heroButton} ${styles.primaryOutline}`}><FaRocket style={{marginRight: '0.5rem'}}/> Start a Project</Link>
                                <Link href="/services" className={`${styles.heroButton} ${styles.heroPrimaryButton}`}>{serviceContent.heroButtonText}</Link>
                            </div>
                        </AnimationWrapper>
                    </div>

                    {/* --- SLIDE 2: APP LAUNCH PROMO --- */}
                    <div className={`${styles.heroContentWrapper} ${styles.appSlideWrapper} ${getSlideClass(2)}`}>
                        <div className={styles.appSlideText}>
                            <AnimationWrapper delay={0.1}>
                                <div className={styles.newFeatureLozenge}>
                                    <span>UPDATE</span> MOBILE APP LIVE
                                </div>
                            </AnimationWrapper>
                            <AnimationWrapper delay={0.2}>
                                <h1 className={styles.heroHeadline}>ZORK DI Mobile.</h1>
                            </AnimationWrapper>
                            <AnimationWrapper delay={0.3}>
                                <p className={styles.heroSubheadline}>
                                    Manage your digital empire from your pocket. Track projects, approve milestones, and chat with developers in real-time.
                                </p>
                            </AnimationWrapper>
                            <AnimationWrapper delay={0.4}>
                                <div className={styles.heroButtonContainer}>
                                    <button onClick={openAppModal} className={`${styles.heroButton} ${styles.heroPrimaryButton}`}>
                                        <FaDownload style={{ marginRight: '0.6rem' }} /> Download App
                                    </button>
                                </div>
                            </AnimationWrapper>
                        </div>

                        <div className={styles.appSlideVisual}>
                            <AnimationWrapper delay={0.5}>
                                <div className={styles.phoneMockup}>
                                    <div className={styles.notch}><div className={styles.notchCam}></div></div>
                                    <div className={styles.phoneScreen}>
                                        <div className={styles.screenContent}>
                                            <div className={styles.appHeader}>
                                                <div className={styles.logoBrand}>ZORK<span>DI</span></div>
                                                <FaBell style={{color: '#fff', fontSize: '1.2rem'}} />
                                            </div>

                                            <div className={styles.statusCard}>
                                                <div className={styles.cardTitle}>SYSTEM STATUS</div>
                                                <div className={styles.cardBigNum}>
                                                    100% <div className={styles.pulseDot}></div>
                                                </div>
                                                <div className={styles.graphPlaceholder}>
                                                    <div className={`${styles.gBar} ${styles.active}`} style={{height: '40%'}}></div>
                                                    <div className={`${styles.gBar} ${styles.active}`} style={{height: '60%'}}></div>
                                                    <div className={`${styles.gBar} ${styles.active}`} style={{height: '85%'}}></div>
                                                    <div className={`${styles.gBar} ${styles.active}`} style={{height: '50%'}}></div>
                                                    <div className={`${styles.gBar} ${styles.active}`} style={{height: '75%'}}></div>
                                                </div>
                                            </div>

                                            <div className={styles.activityList}>
                                                <div className={styles.listItem}>
                                                    <div className={`${styles.iconBox} ${styles.purple}`}>
                                                        <FaBolt />
                                                    </div>
                                                    <div style={{color: '#fff'}}>
                                                        <h4 style={{fontSize: '0.9rem'}}>Server Active</h4>
                                                        <p style={{fontSize: '0.7rem', opacity: 0.6}}>Latency: 12ms</p>
                                                    </div>
                                                </div>
                                                <div className={styles.listItem}>
                                                    <div className={`${styles.iconBox} ${styles.blue}`}>
                                                        <FaWallet />
                                                    </div>
                                                    <div style={{color: '#fff'}}>
                                                        <h4 style={{fontSize: '0.9rem'}}>Revenue</h4>
                                                        <p style={{fontSize: '0.7rem', opacity: 0.6}}>+24% Increase</p>
                                                    </div>
                                                </div>
                                            </div>

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

                    {/* SLIDER INDICATORS */}
                    <div className={styles.sliderIndicators}>
                        {[0, 1, 2].map((idx) => (
                            <div 
                                key={idx}
                                className={`${styles.indicatorDot} ${currentSlide === idx ? styles.activeDot : ''}`}
                                onClick={() => handleDotClick(idx)}
                            ></div>
                        ))}
                    </div>

                </section>
            </div>
            
            <TrustBar /> 
            
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
            
            <FounderNote />
            
            <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    <AnimationWrapper><div className={styles.statItem}><div className={styles.statNumber}>{globalSettings.statProjects}</div><div className={styles.statLabel}>Global Projects</div></div></AnimationWrapper>
                    <AnimationWrapper delay={0.2}><div className={styles.statItem}><div className={styles.statNumber}>{globalSettings.statTeam}</div><div className={styles.statLabel}>Expert Engineers</div></div></AnimationWrapper>
                    <AnimationWrapper delay={0.4}><div className={styles.statItem}><div className={styles.statNumber}>{globalSettings.statClients}</div><div className={styles.statLabel}>Satisfied Partners</div></div></AnimationWrapper>
                    <AnimationWrapper delay={0.6}><div className={styles.statItem}><div className={styles.statNumber}>{globalSettings.statYears}</div><div className={styles.statLabel}>Years of Excellence</div></div></AnimationWrapper>
                </div>
            </section>
            
            <section className={styles.servicesSection}>
                <h2 className={styles.sectionTitle}>Our Capabilities</h2>
                <p className={styles.sectionSubtitle}>We deliver end-to-end software engineering services designed to scale with your ambition.</p>
                <div className={styles.servicesGrid}>
                    {serviceContent.services.map((service, index) => (
                        <AnimationWrapper key={service.id} delay={index * 0.1}><div className={styles.serviceCard}><h3>{service.title}</h3><p>{service.description}</p></div></AnimationWrapper>
                    ))}
                </div>
            </section>
            
            <section className={styles.portfolioSection}>
                <div className={styles.portfolioHeader}>
                    <h2 className={styles.sectionTitle}>Featured Innovations</h2>
                </div>
                <div className={styles.portfolioCarousel}>
                    {portfolioProjects.map((project, index) => (
                        <AnimationWrapper key={project.id} delay={index * 0.2}>
                            <Link href={`/portfolio/${project.id}`} className={styles.portfolioCard}>
                                <div className={styles.portfolioImageWrapper}>{project.coverImageURL ? (<Image src={project.coverImageURL} alt={project.title} fill sizes="(max-width: 768px) 300px, 450px" style={{ objectFit: 'cover' }} />) : (<div className={styles.noImagePlaceholder} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666'}}><span>Preview Not Available</span></div>)}</div>
                                <div className={styles.portfolioContent}><p className={styles.portfolioCategory}>{project.category}</p><h3>{project.title}</h3><p>{project.content}</p></div>
                            </Link>
                        </AnimationWrapper>
                    ))}
                </div>
                {/* BUTTON MOVED HERE */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                    <Link href="/portfolio" className={`${styles.heroButton} ${styles.heroPrimaryButton} ${styles.portfolioCtaButton}`}>View Full Portfolio</Link>
                </div>
            </section>
            
            <CallToActionBar />
            
            <section className={styles.whyUsSection}>
                 <h2 className={styles.sectionTitle}>Why ZORK DI?</h2>
                 <p className={styles.sectionSubtitle}>Because you need a partner who values your vision as much as you do.</p>
                <div className={styles.whyUsGrid}>
                    <AnimationWrapper>
                        <div className={styles.whyUsItem}>
                            <div className={styles.whyUsIcon}><FeatureIcon icon={FaDraftingCompass} /></div>
                            <h3>Expertise You Can Trust</h3>
                            <p>We believe great software is built by dedicated people. Our team consists of experienced developers and designers who are passionate about quality and precision.</p>
                        </div>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.2}>
                        <div className={styles.whyUsItem}>
                            <div className={styles.whyUsIcon}><FeatureIcon icon={FaLaptopCode} /></div>
                            <h3>Your Partner in Success</h3>
                            <p>We take the time to truly understand your business challenges. Our goal is to build solutions that not only work perfectly but also help you achieve your long-term objectives.</p>
                        </div>
                    </AnimationWrapper>
                    <AnimationWrapper delay={0.4}>
                        <div className={styles.whyUsItem}>
                            <div className={styles.whyUsIcon}><FeatureIcon icon={FaUserShield} /></div>
                            <h3>Security & Privacy by Design</h3>
                            <p>We treat your data and security as our highest priority. Our solutions are engineered with robust safeguards and strict privacy protocols from day one, ensuring your information is always protected.</p>
                        </div>
                    </AnimationWrapper>
                </div>
            </section>
            
            <section className={styles.testimonialsSection}>
                <div className={styles.testimonialHeader}>
                    <div className={styles.testimonialTitleWrapper}><h2 className={styles.sectionTitle}>Client Voices</h2><p className={styles.sectionSubtitle}>Real stories from businesses we've transformed.</p></div>
                    {totalReviewsCount > 0 && (<div className={styles.testimonialRatingWrapper}><div className={styles.overallRatingStars}>{renderOverallStars(averageRating)}</div><p className={styles.overallRatingText}>{averageRating.toFixed(1)} / 5.0 Rating</p><p className={styles.overallRatingCount}>Based on {totalReviewsCount} verified reviews</p></div>)}
                </div>
                <TestimonialSlider reviews={latestReviews} />
                <div className={styles.testimonialActions}><button onClick={openReviewModal} className={`${styles.heroButton} ${styles.primaryOutline}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaStar /> Rate Your Experience</button><Link href="/reviews" className={`${styles.heroButton} ${styles.secondary}`}>Read All Reviews</Link></div>
            </section>
            
            <section className={styles.blogSection}>
                <h2 className={styles.sectionTitle}>Tech Insights</h2>
                <p className={styles.sectionSubtitle}>Deep dives into the technology shaping tomorrow.</p>
                {blogPosts[0]?.id === 'dummy1' && blogPosts.length === 1 ? (<div style={{ padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', opacity: 0.8, maxWidth: '600px', backgroundColor: 'var(--color-deep-blue)'}}><FaNewspaper style={{marginRight: '0.5rem', color: 'var(--color-neon-green)'}}/> {blogPosts[0].summary}</div>) : (<div className={styles.blogGrid}>{blogPosts.map((post, index) => (<AnimationWrapper key={post.id} delay={index * 0.2}><Link href={`/blog/${post.slug}`} className={styles.blogCard}><div className={styles.blogImageWrapper}>{post.coverImageURL ? (<Image src={post.coverImageURL} alt={post.title} fill sizes="(max-width: 768px) 300px, 400px" style={{ objectFit: 'cover' }} />) : (<div className={styles.noImagePlaceholder} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666'}}><span>No Cover</span></div>)}</div><div className={styles.blogCardContent}><p className={styles.blogDate}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recent'}</p><h3>{post.title}</h3><p>{post.summary}</p></div></Link></AnimationWrapper>))}</div>)}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                    <Link href="/blog" className={`${styles.heroButton} ${styles.primaryOutline} ${styles.blogCtaButton}`}>View All Articles</Link>
                </div>
            </section>
            
            <ReviewModal isOpen={isReviewModalOpen} onClose={closeReviewModal} />

            {/* --- APP DOWNLOAD MODAL --- */}
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
                            <h3>Get ZORK DI App</h3>
                            <p>Choose your platform to install the dashboard.</p>
                        </div>

                        <div className={styles.platformGrid}>
                            <div className={styles.platformCard}>
                                <FaAndroid className={styles.platformIcon} style={{color: '#3DDC84'}} />
                                <h4>Android</h4>
                                <p>APK / Play Store</p>
                                <a 
                                    href="/zorkdi.apk" 
                                    download="zorkdi.apk" 
                                    className={styles.downloadActionButton} 
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}
                                >
                                    Download Now
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
export default HomeClient;