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
    storyParagraph1: string;
    storyParagraph2: string;
    missionTitle: string;
    missionText: string;
    visionTitle: string;
    visionText: string;
    valuesTitle: string;
    founderImageUrl: string; // URL for the founder's image
}

const defaultContent: AboutContent = {
    heroTitle: "Redefining Digital Experiences.",
    heroSubtitle: "We are ZorkDI: The force accelerating the next generation of web development.",
    storyTitle: "Our Story: Built on Passion and Precision",
    storyParagraph1: "ZorkDI was founded with a simple, yet ambitious goal: to bridge the gap between complex technology and compelling user experience. We started as a small team of innovators, fuelled by coffee and a shared passion for clean code and flawless design.",
    storyParagraph2: "Today, we've grown into a full-service digital agency, but our core philosophy remains the same—every line of code and every pixel matters. We believe that the best digital solutions are built not just with tools, but with dedication and a deep understanding of our clients' visions.",
    missionTitle: "Our Mission",
    missionText: "To empower businesses globally with cutting-edge, scalable, and secure digital platforms that drive measurable growth and transform the way they interact with their customers.",
    visionTitle: "Our Vision",
    visionText: "To be the recognized leader in bespoke digital innovation, setting the benchmark for quality, speed, and client satisfaction in the tech industry worldwide.",
    valuesTitle: "Core Values",
    founderImageUrl: "/images/founder.jpg", // Default placeholder image
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
                    setContent({
                        ...defaultContent, // Keep defaults for fields not in CMS
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
                    <p style={{ marginBottom: '1.5rem' }}>
                        {content.storyParagraph1}
                    </p>
                    <p>
                        {content.storyParagraph2}
                    </p>
                </div>
                <div className={styles.founderImageContainer}>
                    {/* Yahan par Founder ki Image aayegi, abhi placeholder use kiya hai */}
                    {content.founderImageUrl && content.founderImageUrl !== defaultContent.founderImageUrl ? (
                        // <Image /> component use kiya for optimization
                        <Image 
                            src={content.founderImageUrl} 
                            alt="Founder of ZorkDI" 
                            fill 
                            sizes="(max-width: 768px) 200px, 450px" // Responsive size for performance
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