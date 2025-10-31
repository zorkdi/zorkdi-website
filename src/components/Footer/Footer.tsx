import styles from './Footer.module.css';
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link'; 
import Image from 'next/image'; // NAYA: Next/Image component import kiya
import React from 'react';

// Interface for Global Settings data structure
interface GlobalSettings {
  websiteTitle: string; 
  websiteTagline: string; 
  socialLinkedin: string;
  socialTwitter: string;
  socialInstagram: string;
  socialFacebook: string;
}

// Default/Fallback social links
const defaultSocials: GlobalSettings = {
    websiteTitle: "ZORK DI",
    websiteTagline: "Empowering Ideas With Technology.", 
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
    const socials = await getGlobalSettings(); 

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footerTop}>
                    
                    {/* Column 1: Brand Info (Logo & Title) */}
                    <div className={styles.footerBrand}>
                        <Link href="/" className={styles.logoLink} aria-label={`${socials.websiteTitle} Home`}>
                            {/* FIX: <img> tag ko <Image> component se replace kiya */}
                            <Image
                                src="/logo.png" 
                                alt={`${socials.websiteTitle} Logo`}
                                className={styles.logoImage} 
                                width={40} // FIX: Image ki width set ki
                                height={40} // FIX: Image ki height set ki (CSS mein height: 40px se adjust hoga)
                                priority // LCP improve karne ke liye priority diya
                            />
                        </Link>
                        {/* Brand Title */}
                        <h3 className={styles.brandTitle}>{socials.websiteTitle}</h3>
                        {/* Tagline */}
                        <p className={styles.tagline}>{socials.websiteTagline}</p>
                    </div>
                    
                    {/* Column 2: Connect (Social Links) */}
                    <div className={styles.footerSocial}>
                        <h3>Connect</h3>
                        <ul className={styles.socialList}>
                            <li>
                                <a href={socials.socialLinkedin} target="_blank" rel="noopener noreferrer">
                                    <FaLinkedin /> <span>LinkedIn</span>
                                </a>
                            </li>
                            <li>
                                <a href={socials.socialTwitter} target="_blank" rel="noopener noreferrer">
                                    <FaTwitter /> <span>Twitter</span>
                                </a>
                            </li>
                            <li>
                                <a href={socials.socialInstagram} target="_blank" rel="noopener noreferrer">
                                    <FaInstagram /> <span>Instagram</span>
                                </a>
                            </li>
                            <li>
                                <a href={socials.socialFacebook} target="_blank" rel="noopener noreferrer">
                                    <FaFacebook /> <span>Facebook</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>© 2025 {socials.websiteTitle}. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;