// src/app/about/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image'; // NAYA: Image component import kiya
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from '@/firebase'; 
import styles from './about.module.css';
import { FaHeart, FaRocket, FaLightbulb, FaHandsHelping } from 'react-icons/fa'; // Icons for core values

// Interface for CMS Data
interface AboutContent {
    heroTitle: string;
    heroSubtitle: string;
    storyTitle: string;
    storyParagraph1: string; // Will contain HTML from Rich Text Editor
    storyParagraph2: string; // Will contain HTML from Rich Text Editor
    missionTitle: string;
    missionText: string;
    visionTitle: string;
    visionText: string;
    valuesTitle: string;
    founderImageUrl: string;
}

const defaultContent: AboutContent = {
    heroTitle: "From Vision to Code: Engineering the Future of Digital Accountability.",
    heroSubtitle: "ZORK DI is the foundational brand for precision software development.",
    storyTitle: "Our Genesis: The Drive for Uncompromised Excellence",
    storyParagraph1: "I'm Gadadhar Bairagya, the Founder and Lead Developer. Zork DI was born from a singular conviction: to establish a technology brand that stands for unyielding quality and technical mastery. I recognized the limitations of fragmented execution and the vital need for a unified, accountable source for critical software projects.",
    storyParagraph2: "Here, every line of code written here, and every strategic decision is under my direct oversight, ensuring consistent, high-performance outcomes. We provide a comprehensive system for seamless project tracking, clear milestones, and guaranteed technical delivery—a standard clients rarely find.",
    missionTitle: "Our Mission",
    missionText: "To transition clients to a model of singular accountability, personally delivering integrated, enterprise-grade software (Web, Windows, Mobile) with superior quality assurance, powering their sustained growth.",
    visionTitle: "Our Vision",
    visionText: "To evolve ZORK DI into the most trusted global technology brand, recognized for technical excellence, innovative solutions, and setting the global standard for bespoke digital engineering.",
    valuesTitle: "Core Values That Drive Us",
    founderImageUrl: "/images/founder_placeholder.jpg",
};

const AboutPage = () => {
    const [content, setContent] = useState<AboutContent>(defaultContent);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const docRef = doc(db, 'cms', 'about_page');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as AboutContent;
                    // FIX: Ensure content loads with defaults if any field is missing
                    setContent({
                        ...defaultContent, 
                        ...data,
                    });
                }
            } catch (error) {
                console.error("Error fetching about page content:", error);
            }
        };
        fetchContent();
    }, []);

    const coreValues = [
        { icon: FaRocket, title: "Innovation", description: "Continuously exploring new technologies to keep our clients ahead of the curve." },
        { icon: FaLightbulb, title: "Clarity", description: "Providing clear communication and transparent processes from concept to launch." },
        { icon: FaHeart, title: "Dedication", description: "Committing our full effort and passion to every project we undertake." },
        { icon: FaHandsHelping, title: "Integrity", description: "Building relationships based on honesty, trust, and mutual respect." },
    ];


    return (
        <main className={styles.main}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <h1>{content.heroTitle}</h1>
                <p>{content.heroSubtitle}</p>
            </section>

            {/* Our Story Section */}
            <section className={styles.storySection}>
                <div className={styles.storyContent}>
                    <h2>{content.storyTitle}</h2>
                    {/* FIX: dangerouslySetInnerHTML se HTML content ko sahi se render karna */}
                    <p 
                        style={{ marginBottom: '1.5rem' }} 
                        dangerouslySetInnerHTML={{ __html: content.storyParagraph1 }} 
                    />
                    <p 
                        dangerouslySetInnerHTML={{ __html: content.storyParagraph2 }} 
                    />
                </div>
                <div className={styles.founderImageContainer}>
                    {/* Founder Image (Image URL is from CMS) */}
                    {content.founderImageUrl && content.founderImageUrl !== defaultContent.founderImageUrl ? (
                        <Image 
                            src={content.founderImageUrl} 
                            alt="Founder of ZorkDI - Gadadhar Bairagya" 
                            fill 
                            sizes="(max-width: 768px) 200px, 450px" 
                            className={styles.founderImage}
                        />
                    ) : (
                        <div className={styles.founderImagePlaceholder}>
                            Founder Image
                        </div>
                    )}
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className={styles.missionVisionSection}>
                <div className={styles.missionCard}>
                    <h3>{content.missionTitle}</h3>
                    <p>{content.missionText}</p>
                </div>
                <div className={styles.visionCard}>
                    <h3>{content.visionTitle}</h3>
                    <p>{content.visionText}</p>
                </div>
            </section>

            {/* Core Values Section */}
            <section className={styles.valuesSection}>
                <h2 className={styles.sectionTitle}>{content.valuesTitle}</h2>
                <div className={styles.valuesGrid}>
                    {coreValues.map((value, index) => (
                        <div key={index} className={styles.valueItem}>
                            <value.icon className={styles.valueIcon} />
                            <h4>{value.title}</h4>
                            <p>{value.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default AboutPage;