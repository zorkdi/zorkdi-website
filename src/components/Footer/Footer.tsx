// src/components/Footer/Footer.tsx

import styles from './Footer.module.css';
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link'; 
import Image from 'next/image'; 
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
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                websiteTitle: data.websiteTitle || defaultSocials.websiteTitle, 
                websiteTagline: data.websiteTagline || defaultSocials.websiteTagline, 
                headerLogoURL: data.headerLogoURL || defaultSocials.headerLogoURL, 
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
    const settings = await getGlobalSettings(); 

    const logoSrc = (settings.headerLogoURL && settings.headerLogoURL.trim() !== "")
        ? settings.headerLogoURL
        : defaultSocials.headerLogoURL; // Fallback to default logo

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footerTop}>
                    
                    {/* NAYA: Column 1: Brand Info (Logo, Title, Tagline) */}
                    <div className={styles.footerBrand}>
                        <Link href="/" className={styles.logoLink} aria-label={`${settings.websiteTitle} Home`}>
                            <Image
                                src={logoSrc} 
                                alt={`${settings.websiteTitle} Logo`}
                                className={styles.logoImage} 
                                width={40} 
                                height={40}
                                priority 
                            />
                            <h3 className={styles.brandTitle}>{settings.websiteTitle}</h3>
                        </Link>
                        
                        {/* FIX: Tagline ke liye naya wrapper add kiya hai */}
                        <div className={styles.taglineWrapper}>
                            <p className={styles.tagline}>
                                {settings.websiteTagline}
                            </p>
                        </div>

                        {/* === NAYA: FOOTER VIDEO SCREEN === */}
                        <div className={styles.footerVideoScreen}>
                            <video
                                src="/videos/footer.mp4" // Path to your video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className={styles.footerVideo}
                            />
                        </div>
                        {/* === END OF NAYA SECTION === */}

                    </div>
                    
                    {/* NAYA: Column 2 & 3 - Links Grid */}
                    <div className={styles.footerLinksGrid}>
                        {/* Column 2: Company */}
                        <div className={styles.footerLinkColumn}>
                            <h3>Company</h3>
                            <ul>
                                <li><Link href="/about">About Us</Link></li>
                                <li><Link href="/services">Services</Link></li>
                                <li><Link href="/portfolio">Portfolio</Link></li>
                                <li><Link href="/contact">Contact</Link></li>
                            </ul>
                        </div>
                        
                        {/* Column 3: Resources */}
                        <div className={styles.footerLinkColumn}>
                            <h3>Resources</h3>
                            <ul>
                                <li><Link href="/blog">Blog</Link></li>
                                <li><Link href="/faq">FAQ</Link></li>
                                <li><Link href="/case-studies">Case Studies</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* FIX: NAYA COLUMN 4: CONNECT (Socials) */}
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
                
                {/* FIX: Bottom Bar ab sirf copyright dikhayega */}
                <div className={styles.footerBottom}>
                    <p>© 2025 {settings.websiteTitle}. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;