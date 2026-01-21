// src/components/Footer/Footer.tsx

import styles from './Footer.module.css';
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link'; 
import Image from 'next/image'; 
import React from 'react';

// Interface
interface GlobalSettings {
  websiteTitle: string; 
  websiteTagline: string; 
  headerLogoURL: string; 
  socialLinkedin: string;
  socialTwitter: string;
  socialInstagram: string;
  socialFacebook: string;
}

// Default values
const defaultSocials: GlobalSettings = {
    websiteTitle: "ZORK DI",
    websiteTagline: "Empowering Ideas With Technology.", 
    headerLogoURL: "/logo.png", 
    socialLinkedin: "#",
    socialTwitter: "#",
    socialInstagram: "#",
    socialFacebook: "#",
};

// Fetcher
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
        console.error("FOOTER ERROR:", error); 
        return defaultSocials; 
    }
}

const Footer = async () => {
    const settings = await getGlobalSettings(); 

    const logoSrc = (settings.headerLogoURL && settings.headerLogoURL.trim() !== "")
        ? settings.headerLogoURL
        : defaultSocials.headerLogoURL; 

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footerTop}>
                    
                    {/* Column 1: Brand Info & Video */}
                    <div className={styles.footerBrand}>
                        <Link href="/" className={styles.logoLink} aria-label="Home">
                            <Image
                                src={logoSrc} 
                                alt="Logo"
                                className={styles.logoImage} 
                                width={50} 
                                height={50}
                                priority 
                            />
                            <h3 className={styles.brandTitle}>{settings.websiteTitle}</h3>
                        </Link>
                        
                        <div className={styles.taglineWrapper}>
                            <p className={styles.tagline}>
                                {settings.websiteTagline}
                            </p>
                        </div>

                        {/* Video Holographic Card */}
                        <div className={styles.footerVideoScreen}>
                            <video
                                src="/videos/footer.mp4" 
                                autoPlay
                                loop
                                muted
                                playsInline
                                className={styles.footerVideo}
                            />
                        </div>
                    </div>
                    
                    {/* Columns 2 & 3: Links */}
                    <div className={styles.footerLinksGrid}>
                        <div className={styles.footerLinkColumn}>
                            <h3>Company</h3>
                            <ul>
                                <li><Link href="/about">About Us</Link></li>
                                <li><Link href="/services">Services</Link></li>
                                <li><Link href="/portfolio">Portfolio</Link></li>
                                <li><Link href="/contact">Contact</Link></li>
                            </ul>
                        </div>
                        
                        <div className={styles.footerLinkColumn}>
                            <h3>Resources</h3>
                            <ul>
                                <li><Link href="/blog">Tech Insights</Link></li>
                                {/* UPDATED: Rebranded to iShield Lock with new link */}
                                <li><Link href="/ishield-lock">iShield Lock</Link></li>
                                <li><Link href="/case-studies">Case Studies</Link></li>
                                <li><Link href="/faq">FAQ</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Column 4: Socials */}
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
                
                {/* Bottom Bar */}
                <div className={styles.footerBottom}>
                    <p>© 2025 {settings.websiteTitle}. All Rights Reserved.</p>
                    <div className={styles.footerBottomLinks}>
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;