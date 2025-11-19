// src/components/Header/Header.tsx

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

// Global settings data type
interface BrandingData {
  websiteTitle: string;
  websiteTagline: string; 
  headerLogoURL: string; 
}

// Default/Fallback values
const defaultBranding: BrandingData = {
    websiteTitle: "ZORK DI",
    websiteTagline: "Empowering Ideas With Technology",
    headerLogoURL: "/logo.png", 
};

interface HeaderProps {
    globalSettings: BrandingData;
}

const Header = ({ globalSettings }: HeaderProps) => {
  const { currentUser, userProfile, loading: authLoading } = useAuth(); 
  const router = useRouter();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const branding = globalSettings || defaultBranding;

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
            closeMenus(); 
        }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc); 
    
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEsc); 
    };
  }, [profileMenuRef]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeMenus(); 
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const logoSrc = (branding.headerLogoURL && branding.headerLogoURL.trim() !== "") 
        ? branding.headerLogoURL 
        : defaultBranding.headerLogoURL; 

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src={logoSrc} 
              alt={`${branding.websiteTitle} Logo`}
              width={55} 
              height={55}
              priority
              className={styles.logoImage}
            />
            <div className={styles.logoTextContainer}>
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
          
          <Link 
            href="/contact" 
            className={`${styles.headerButtonBase} ${styles.secondaryCtaButton}`}
          >
            Contact
          </Link>
          
          <Link 
            href="/new-project" 
            className={`${styles.headerButtonBase} ${styles.primaryCtaButton}`}
          >
            Start a Project
          </Link>
          
          {!authLoading && (
              <>
                  {/* Mobile CTA Button Hidden on Desktop */}
                  <Link 
                      href="/new-project" 
                      className={`${styles.headerButtonBase} ${styles.primaryCtaButton} ${styles.mobileCtaButtonVisible}`} 
                      style={{ display: 'none' }} 
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
                            {/* --- UPDATE: Removed separate Sign Up link --- */}
                            <li><Link href="/login" onClick={closeMenus}>Login / Sign Up</Link></li>
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
              </>
          )}
        </div>
      </div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
          
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
    </header>
  );
};

export default Header;