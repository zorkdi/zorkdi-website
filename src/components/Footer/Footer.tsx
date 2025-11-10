// src/components/Footer/Footer.tsx

import styles from './Footer.module.css';
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link'; 
import Image from 'next/image'; // NAYA: Next/Image component import kiya
import React from 'react';

// === YAHAN CHANGE KIYA GAYA HAI ===
// Interface for Global Settings data structure
interface GlobalSettings {
  websiteTitle: string; 
  websiteTagline: string; 
  headerLogoURL: string; // NAYA FIELD LOGO KE LIYE
  socialLinkedin: string;
  socialTwitter: string;
  socialInstagram: string;
  socialFacebook: string;
}

// Default/Fallback social links
const defaultSocials: GlobalSettings = {
    websiteTitle: "ZORK DI",
    websiteTagline: "Empowering Ideas With Technology.", 
    headerLogoURL: "/logo.png", // NAYA DEFAULT VALUE
    socialLinkedin: "#",
    socialTwitter: "#",
    socialInstagram: "#",
    socialFacebook: "#",
};

// Server Component to fetch global settings
async function getGlobalSettings(): Promise<GlobalSettings> {
    try {
        const docRef = doc(db, 'cms', 'global_settings');
        // Footer ek server component hai, build time par data fetch karega
        // Isliye yahan cache settings ki zaroorat nahi hai
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // === YAHAN CHANGE KIYA GAYA HAI ===
            return {
                websiteTitle: data.websiteTitle || defaultSocials.websiteTitle, 
                websiteTagline: data.websiteTagline || defaultSocials.websiteTagline, 
                headerLogoURL: data.headerLogoURL || defaultSocials.headerLogoURL, // NAYA LOGO FETCH
                socialLinkedin: data.socialLinkedin || defaultSocials.socialLinkedin,
                socialTwitter: data.socialTwitter || defaultSocials.socialTwitter,
                socialInstagram: data.socialInstagram || defaultSocials.socialInstagram,
                socialFacebook: data.socialFacebook || defaultSocials.socialFacebook,
            };
        } else {
            return defaultSocials;
        }
    } catch (error) {
        console.error("FOOTER ERROR: Failed to fetch Global Settings from Firestore.", error); 
        return defaultSocials; 
    }
}


// Component ko async Server Component rakha gaya hai
const Footer = async () => {
    // 'socials' ki jagah 'settings' naam rakhte hain
    const settings = await getGlobalSettings(); 

    // === YAHAN CHANGE KIYA GAYA HAI ===
    // Logic (Header.tsx se copy ki) yeh check karne ke liye ki logo URL valid hai ya nahi
    const logoSrc = (settings.headerLogoURL && settings.headerLogoURL.trim() !== "")
        ? settings.headerLogoURL
        : defaultSocials.headerLogoURL; // Fallback to default logo

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footerTop}>
                    
                    {/* Column 1: Brand Info (Logo & Title) */}
                    <div className={styles.footerBrand}>
                        <Link href="/" className={styles.logoLink} aria-label={`${settings.websiteTitle} Home`}>
                            {/* === YAHAN CHANGE KIYA GAYA HAI === */}
                            <Image
                                src={logoSrc} // Naya dynamic 'logoSrc' variable use kiya
                                alt={`${settings.websiteTitle} Logo`}
                                className={styles.logoImage} 
                                width={40} 
                                height={40}
                                priority 
                            />
                        </Link>
                        {/* Brand Title */}
                        <h3 className={styles.brandTitle}>{settings.websiteTitle}</h3>
                        {/* Tagline */}
                        <p className={styles.tagline}>{settings.websiteTagline}</p>
                    </div>
                    
                    {/* Column 2: Connect (Social Links) */}
                    <div className={styles.footerSocial}>
                        <h3>Connect</h3>
                        <ul className={styles.socialList}>
                            <li>
                                <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer">
                                    <FaLinkedin /> <span>LinkedIn</span>
                                </a>
                            </li>
                            <li>
                                <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer">
                                    <FaTwitter /> <span>Twitter</span>
                                </a>
                            </li>
                            <li>
                                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer">
                                    <FaInstagram /> <span>Instagram</span>
                                </a>
                            </li>
                            <li>
                                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer">
                                    <FaFacebook /> <span>Facebook</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>© 2025 {settings.websiteTitle}. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;