// app/page.tsx

"use client"; 

import Link from 'next/link';
import styles from './page.module.css';
// FIX: FaSpinner ko remove kiya kyunki ab woh unused hai
import { FaLaptopCode, FaMobileAlt, FaDraftingCompass, FaRegLightbulb, FaUserShield, FaRocket, FaNewspaper, FaChartLine, FaDesktop } from "react-icons/fa";
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'; 
import { db } from '@/firebase';
import Image from 'next/image'; 

import React, { useState, useEffect } from 'react';

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
            return {
                id: doc.id,
                title: data.title,
                category: data.category,
                content: data.content?.substring(0, 80).replace(/<\/?[^>]+(>|$)/g, "") + '...' || 'Project description is missing.',
                coverImageURL: data.coverImageURL || '',
            } as PortfolioPreview;
        });

    } catch (error) {
        console.error("Error fetching portfolio projects:", error);
        return fallbackPortfolio; 
    }
};


const HomePage = () => {
    // Initial state ko fallback data se set kiya. isLoading state removed.
    const [serviceContent, setServiceContent] = useState<ServicesContent>(fallbackServiceData);
    const [blogPosts, setBlogPosts] = useState<BlogPreview[]>(fallbackBlogPosts); 
    const [portfolioProjects, setPortfolioProjects] = useState<PortfolioPreview[]>(fallbackPortfolio); 
    
    // Fetch Services and Blog/Portfolio Content (Runs instantly on client-side)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Content
                const [fetchedServices, fetchedPosts, fetchedProjects] = await Promise.all([
                    fetchServiceContent(), 
                    fetchBlogPosts(), 
                    fetchPortfolioProjects()
                ]);
                
                // Data fetch hone par sirf state update hogi. UI turant load ho chuka hai.
                setServiceContent(fetchedServices);
                setBlogPosts(fetchedPosts);
                setPortfolioProjects(fetchedProjects); 
            } catch (error) {
                console.error("Error fetching homepage content in client useEffect:", error);
            } 
        };
        fetchData();
    }, []);
    
    
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
                            <Link href="/services" className={styles.heroButton}>{serviceContent.heroButtonText}</Link>
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
            
            {/* Testimonials Section (Future CMS control ke liye structure rakha) */}
            <section className={styles.testimonialsSection}>
                <h2 className={styles.sectionTitle}>Client Success Stories</h2>
                <p style={{ opacity: 0.7, fontSize: '1.2rem' }}>We turn complex challenges into simple, elegant digital products. See what our clients say.</p>
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
                                            {/* FIX: Timestamp object se date string generate karna */}
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
        </main>
    );
};

export default HomePage;