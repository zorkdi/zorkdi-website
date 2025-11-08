// src/components/TrustBar/TrustBar.tsx

"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from '../../app/page.module.css'; 
// Firestore imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Type for a single logo item (CMS se sync)
interface LogoItem {
    id: string; 
    name: string;
    logoPath: string; // Image URL
}

// Type for Firestore data structure
interface TrustSettings {
    logos: LogoItem[];
}

// Fallback data
const fallbackLogos: LogoItem[] = [
    // CRITICAL FIX: Jab tak files nahi hain, logoPath ko empty string rakha, jisse 404 request na jaye
    { id: '1', name: "Synergy Bio", logoPath: "" },
    { id: '2', name: "Fusion Corp", logoPath: "" },
    { id: '3', name: "Aura FinTech", logoPath: "" },
    { id: '4', name: "Velocity Media", logoPath: "" },
    { id: '5', name: "Quantum Labs", logoPath: "" },
];

/**
 * TrustBar component: Hero section ke theek neeche client logos ka
 * continuously scrolling strip dikhane ke liye.
 */
const TrustBar = () => {
    const [logos, setLogos] = useState<LogoItem[]>(fallbackLogos);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTrustSettings = useCallback(async () => {
        try {
            const docRef = doc(db, 'cms', 'trust_settings');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const fetchedLogos = (docSnap.data() as TrustSettings).logos;
                if (fetchedLogos && fetchedLogos.length > 0) {
                    setLogos(fetchedLogos);
                } else {
                     // Agar Firestore mein data hai, but logos array empty hai, toh fallback use karo
                    setLogos(fallbackLogos); 
                }
            } else {
                // Agar document hi exist nahi karta, toh fallback use karo
                setLogos(fallbackLogos);
            }
        } catch (error) {
            console.error("Error fetching trust settings:", error);
            setLogos(fallbackLogos); // Error hone par bhi fallback use karo
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchTrustSettings();
    }, [fetchTrustSettings]); 

    // Hum logos ko 2 baar duplicate karte hain taaki seamless scrolling loop ho
    const duplicatedLogos = useMemo(() => {
        if (logos.length === 0) return fallbackLogos; 
        // Logos ko duplicate kiya for smooth loop effect
        return [...logos, ...logos]; 
    }, [logos]);

    // Agar data load ho raha ho aur koi logo nahi hai, toh render na karein
    // NOTE: Hum render kar rahe hain taaki "TRUSTED BY..." text dikhe
    if (isLoading && logos.length === 0) return null;


    return (
        // NAYA CLASS: TrustBar container, page.module.css mein define hoga
        <div className={styles.trustBarSection}>
            <div className={styles.trustBarContent}>
                <p className={styles.trustBarText}>TRUSTED BY LEADING BRANDS & STARTUPS</p>
                {/* Scrollable strip container */}
                <div className={styles.logoStrip}>
                    <div className={styles.logoTrack}>
                        {duplicatedLogos.map((client, index) => (
                            <div key={`${client.id}-${index}`} className={styles.logoItem}>
                                {
                                    // FIX 2: Check kiya ki agar logoPath hai, toh hi Image component dikhao
                                    client.logoPath && client.logoPath !== "" ? (
                                        <Image
                                            src={client.logoPath} 
                                            alt={client.name}
                                            // FIX 1: Width aur Height ko badhaya (120x40 se 200x60 kiya)
                                            width={200} 
                                            height={60} 
                                            style={{ 
                                                objectFit: 'contain', 
                                                filter: 'grayscale(100%) brightness(200%)', // Light/White filter for dark background
                                                opacity: 0.8, // Opacity badhaya
                                            }}
                                        />
                                    ) : (
                                        // FIX 3: Agar path empty hai, toh ek placeholder div dikhao
                                        <div style={{ 
                                            width: '200px', 
                                            height: '60px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '0.8rem', 
                                            opacity: 0.5,
                                            border: '1px dashed rgba(255,255,255,0.1)' 
                                        }}>
                                            {client.name}
                                        </div>
                                    )
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrustBar;