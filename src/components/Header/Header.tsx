// components/Header/Header.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import styles from './Header.module.css';
import { CgMenuRight, CgClose } from "react-icons/cg";
import { FaUserCircle } from "react-icons/fa"; 
import { useAuth } from '../../context/AuthContext'; 
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
// === YAHAN SE 'db' AUR 'getDoc' HATA DIYA GAYA HAI ===

// Global settings data type
interface BrandingData {
  websiteTitle: string;
  websiteTagline: string; 
  headerLogoURL: string; // Logo ke liye field
}

// Default/Fallback values
const defaultBranding: BrandingData = {
    websiteTitle: "ZORK DI",
    websiteTagline: "Empowering Ideas With Technology",
    headerLogoURL: "/logo.png", // Default logo
};

// === YAHAN CHANGE KIYA GAYA HAI (Props receive karne ke liye) ===
interface HeaderProps {
    globalSettings: BrandingData;
}

const Header = ({ globalSettings }: HeaderProps) => {
  const { currentUser, userProfile, loading: authLoading } = useAuth(); 
  const router = useRouter();
  
  // === YAHAN CHANGE KIYA GAYA HAI (const add kiya) ===
  const [menuOpen, setMenuOpen] = useState(false);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // === YAHAN CHANGE KIYA GAYA HAI ===
  // 'branding' state, 'brandingLoading' state, aur 'fetchBranding' useEffect ko poori tarah HATA diya gaya hai
  // Hum ab 'globalSettings' prop ko direct use karenge
  const branding = globalSettings || defaultBranding;
  // ===================================

  // Function to close both menus
  const closeMenus = () => {
      setMenuOpen(false);
      setProfileMenuOpen(false);
  };

  // Mobile menu toggle hone par profile dropdown close karna
  useEffect(() => {
    if (menuOpen) {
      setProfileMenuOpen(false);
    }
  }, [menuOpen]);
  
  // Profile menu toggle hone par mobile menu close karna
  useEffect(() => {
    if (profileMenuOpen) {
      setMenuOpen(false);
    }
  }, [profileMenuOpen]); 

  // Esc key listener aur click outside functionality
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    
    // Esc Key Handler
    const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            closeMenus(); // Dono menus ko close karo
        }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc); // Esc key listener add kiya
    
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEsc); // Cleanup
    };
  }, [profileMenuRef]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeMenus(); // Updated to use closeMenus
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // === YAHAN CHANGE KIYA GAYA HAI ===
  // Nayi logic yeh check karegi ki logoURL valid hai ya nahi
  // 'brandingLoading' state ab nahi hai, toh check hata diya
  const logoSrc = (branding.headerLogoURL && branding.headerLogoURL.trim() !== "") 
        ? branding.headerLogoURL // Agar valid hai, toh database wala URL use karo
        : defaultBranding.headerLogoURL; // Agar khaali hai, toh default URL use karo

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            {/* === YAHAN CHANGE KIYA GAYA HAI === */}
            <Image
              src={logoSrc} // Naya variable yahan use kiya
              alt={`${branding.websiteTitle} Logo`}
              width={55} 
              height={55}
              priority
              className={styles.logoImage}
            />
            <div className={styles.logoTextContainer}>
              {/* Dynamic Brand Name and Tagline */}
              {/* === YAHAN CHANGE KIYA GAYA HAI ('brandingLoading' check hataya) === */}
              <span className={styles.brandName}>
                 {branding.websiteTitle}
              </span>
              <span className={styles.brandTagline}>
                 {branding.websiteTagline}
              </span>
            </div>
          </Link>
        </div>
        
        <button 
            className={styles.hamburgerButton} 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{ display: 'none' }} 
        >
            {menuOpen ? <CgClose /> : <CgMenuRight />}
        </button>


        <nav className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/portfolio">Portfolio</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </nav>

        <div className={styles.rightControls}>
          {/* Desktop Only CTAs */}
          <Link href="/contact" className={styles.secondaryCtaButton}>Contact</Link>
          <Link href="/new-project" className={styles.primaryCtaButton}>Start a Project</Link>
          
          {!authLoading && (
              <>
                  <Link 
                      href="/new-project" 
                      className={`${styles.primaryCtaButton} ${styles.mobileCtaButtonVisible}`} 
                  >
                      Start a Project
                  </Link>
              
                  <div className={styles.profileMenuContainer} ref={profileMenuRef}>
                    
                    {currentUser && userProfile?.photoURL ? (
                      <Image 
                        src={userProfile.photoURL} 
                        alt="Profile" 
                        width={40} 
                        height={40} 
                        className={styles.profileImage}
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
                      />
                    ) : (
                      <button 
                        className={styles.profileIcon} 
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        aria-label="Profile menu"
                      >
                        <FaUserCircle /> 
                      </button>
                    )}
                    
                    {profileMenuOpen && (
                      <div className={styles.profileDropdown}>
                        {currentUser ? (
                          <ul>
                            {userProfile?.email === 'admin@zorkdi.com' && (
                                <li><Link href="/admin" onClick={closeMenus}>Admin Dashboard</Link></li>
                            )}
                            <li><Link href="/profile" onClick={closeMenus}>My Profile</Link></li>
                            <li><Link href="/my-projects" onClick={closeMenus}>My Projects</Link></li>
                            <li><button onClick={handleLogout}>Logout</button></li>
                          </ul>
                        ) : (
                          <ul>
                            <li><Link href="/login" onClick={closeMenus}>Login</Link></li>
                            <li><Link href="/signup" onClick={closeMenus}>Sign Up</Link></li>
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
              </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <button 
            className={styles.hamburgerButton} 
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }} 
          >
            <CgClose />
          </button>
          <nav>
            <ul className={styles.mobileNavLinks}>
              <li><Link href="/services" onClick={closeMenus}>Services</Link></li>
              <li><Link href="/portfolio" onClick={closeMenus}>Portfolio</Link></li>
              <li><Link href="/about" onClick={closeMenus}>About Us</Link></li>
              <li><Link href="/blog" onClick={closeMenus}>Blog</Link></li>
              <li><Link href="/contact" onClick={closeMenus}>Contact</Link></li>
              <li><Link href="/new-project" className={styles.mobileCta} onClick={closeMenus}>Start a Project</Link></li> 
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;