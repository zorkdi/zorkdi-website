// app/page.tsx

"use client"; 

import Link from 'next/link';
import styles from './page.module.css';
// FIX: FaSpinner icon ko import list mein add kiya
import { FaLaptopCode, FaMobileAlt, FaDraftingCompass, FaRegLightbulb, FaUserShield, FaRocket, FaSpinner } from "react-icons/fa";
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

import React, { useState, useEffect } from 'react'; // React import ensure kiya

// Helper component for dynamic icon display (assuming it's a client component)
const ServiceIcon = ({ icon: Icon }: { icon: React.ElementType }) => <Icon />;
const WhyUsIcon = ({ icon: Icon }: { icon: React.ElementType }) => <Icon />;

// --- Interface for Services Content (Jaisa ServicesCMS.tsx mein define kiya tha) ---
interface ServiceOffering {
    id: string;
    title: string;
    description: string;
    offerings: string[]; 
}

interface ServicesContent {
    heroHeadline: string;
    heroSubheadline: string;
    services: ServiceOffering[];
}

// Dummy/Fallback data (Client-side fetching ke liye zaroori)
const fallbackServiceData: ServicesContent = {
    heroHeadline: "Engineering Your Vision into Reality.",
    heroSubheadline: "We transform your ideas into high-performance applications, websites, and software that drive growth and user engagement.",
    services: [
        { id: '1', title: 'Custom Web Apps', description: 'Scalable and secure web applications tailored to your business needs.', offerings: [] },
        { id: '2', title: 'Mobile App Development', description: 'Engaging iOS and Android apps that captivate your audience and provide native-like performance.', offerings: [] },
        { id: '3', title: 'UI/UX Design', description: 'Intuitive and beautiful designs that provide a seamless user experience, driving conversions and loyalty.', offerings: [] },
    ],
};

// Icon Map (CMS se aaye hue text ko icon se map karna)
// NOTE: Abhi hum sirf service title ke base par hardcoded icon de rahe hain.
const iconMap: { [key: string]: React.ElementType } = {
    'Web Apps': FaLaptopCode,
    'Mobile App': FaMobileAlt,
    'UI/UX': FaDraftingCompass,
    'Custom Software': FaRocket,
};

const HomePage = () => {
    const [serviceContent, setServiceContent] = useState<ServicesContent>(fallbackServiceData);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(db, 'cms', 'services_page');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setServiceContent(docSnap.data() as ServicesContent);
                }
            } catch (error) {
                console.error("Error fetching Services Content:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    // --- Render Logic ---
    return (
        <main className={styles.main}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <h1 className={styles.heroHeadline}>{fallbackServiceData.heroHeadline}</h1>
                <p className={styles.heroSubheadline}>{fallbackServiceData.heroSubheadline}</p>
                <Link href="/services" className={styles.heroButton}>Explore Our Services</Link>
            </section>

            {/* Services Section (DYNAMIC) */}
            <section className={styles.servicesSection}>
                <h2 className={styles.sectionTitle}>Our Core Services</h2>
                
                {isLoading ? (
                    <div className={styles.loadingMessage} style={{padding: '3rem', color: 'var(--color-neon-green)'}}>
                        {/* FaSpinner yahan use ho raha tha */}
                        <FaSpinner style={{animation: 'spin 1s linear infinite', marginRight: '1rem'}}/> Loading core services...
                    </div>
                ) : (
                    <div className={styles.servicesGrid}>
                        {serviceContent.services.map((service, index) => {
                            // Service Title se icon select karna (ya koi default icon)
                            const IconComponent = iconMap[Object.keys(iconMap).find(key => service.title.includes(key)) || 'Web Apps'];
                            
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
                )}
            </section>

            {/* Portfolio Section */}
            <section className={styles.portfolioSection}>
                <h2 className={styles.sectionTitle}>Featured Work</h2>
                <div className={styles.portfolioGrid}>
                    {/* NOTE: Dummy Content maintained for now */}
                    <div className={styles.portfolioItem}>
                        <div className={styles.portfolioImagePlaceholder}>Project 1 - E-commerce Platform</div>
                        <h3>Quantum E-commerce</h3>
                        <p>A short description of the project.</p>
                    </div>
                    <div className={styles.portfolioItem}>
                        <div className={styles.portfolioImagePlaceholder}>Project 2 - FinTech Dashboard</div>
                        <h3>Aura FinTech Dashboard</h3>
                        <p>A short description of the project.</p>
                    </div>
                    <div className={styles.portfolioItem}>
                        <div className={styles.portfolioImagePlaceholder}>Project 3 - SaaS Portal</div>
                        <h3>SaaS Management Portal</h3>
                        <p>A short description of the project.</p>
                    </div>
                </div>
                <Link href="/portfolio" className={styles.heroButton} style={{ marginTop: '3rem' }}>View All Projects</Link>
            </section>

            {/* Why Choose Us Section */}
            <section className={styles.whyUsSection}>
                <h2 className={styles.sectionTitle}>Why Choose ZORK DI?</h2>
                <div className={styles.whyUsGrid}>
                    {/* NOTE: Dummy Content maintained for now */}
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
            
            {/* Blog Section (Future CMS control ke liye structure rakha) */}
            <section className={styles.blogSection}>
                <h2 className={styles.sectionTitle}>Latest Tech Insights</h2>
                <p style={{ opacity: 0.7, fontSize: '1.2rem' }}>Stay updated with the latest in web development, design, and mobile tech.</p>
            </section>
        </main>
    );
};

export default HomePage;