// src/components/FounderNote/FounderNote.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import styles from '../../app/page.module.css'; // Make sure path is correct based on your folder structure
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface FounderSettings {
    quote: string;
    name: string;
    title: string;
    philosophy: string;
    imageURL: string;
    showFounderImage: boolean;
}

const defaultSettings: FounderSettings = {
    quote: "Engineering the future isn't just about code; it's about building solutions that ensure digital accountability and relentless performance.",
    name: "Gadadhar Bairagya",
    title: "CEO & Lead Developer",
    philosophy: "Our mission at ZORK DI is rooted in crafting clean, scalable, and complex software solutions that meet the highest standards of quality and efficiency.",
    imageURL: "/images/founder-profile-placeholder.jpg",
    showFounderImage: false,
};

const FounderNote: React.FC = () => {
    const [settings, setSettings] = useState<FounderSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    const DOC_REF = useMemo(() => doc(db, 'cms', 'founder_settings'), []);

    const fetchFounderSettings = useCallback(async () => {
        try {
            const docSnap = await getDoc(DOC_REF);

            if (docSnap.exists()) {
                const fetchedData = docSnap.data();
                const mergedData = { ...defaultSettings, ...fetchedData } as FounderSettings;
                setSettings(mergedData);
            }
        } catch (error) {
            console.error("Error fetching founder settings:", error);
        } finally {
            setIsLoading(false);
        }
    }, [DOC_REF]);

    useEffect(() => {
        fetchFounderSettings();
    }, [fetchFounderSettings]);

    if (isLoading) {
        return (
             <section className={styles.founderNoteSection} style={{minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                 <p style={{ opacity: 0.7, color: 'white' }}>Loading Founder&apos;s Vision...</p>
             </section>
        );
    }

    const { quote, name, title, philosophy, imageURL, showFounderImage } = settings;
    const finalImageURL = (imageURL && imageURL !== "") ? imageURL : defaultSettings.imageURL;

    return (
        <section className={styles.founderNoteSection}>
            <div className={styles.founderNoteWrapper}>
                
                {showFounderImage && finalImageURL && (
                    <AnimationWrapper delay={0.1}>
                        <div className={styles.founderImageContainer}>
                            <Image
                                src={finalImageURL} 
                                alt={name}
                                fill
                                style={{ 
                                    objectFit: 'cover',
                                    borderRadius: '50%', 
                                }}
                                className={styles.founderImage}
                                sizes="(max-width: 768px) 250px, 300px"
                            />
                        </div>
                    </AnimationWrapper>
                )}
                
                <div className={styles.founderContent}>
                    <AnimationWrapper delay={0.2}>
                        <h3 className={styles.founderQuote}>
                            {quote}
                        </h3>
                    </AnimationWrapper>
                    
                    <AnimationWrapper delay={0.3}>
                        <p className={styles.founderName}>
                            — {name}, <span className={styles.founderTitle}>{title}</span>
                        </p>
                    </AnimationWrapper>
                    
                    <AnimationWrapper delay={0.4}>
                        <p className={styles.founderPhilosophy}>
                            {philosophy}
                        </p>
                    </AnimationWrapper>
                </div>
            </div>
        </section>
    );
};

export default FounderNote;