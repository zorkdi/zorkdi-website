// src/components/Header/Header.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import styles from './Header.module.css';
import { CgMenuRight, CgClose } from "react-icons/cg";
import { FaUserCircle, FaShieldAlt, FaEnvelope } from "react-icons/fa"; 
import { useAuth } from '../../context/AuthContext'; 
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

interface BrandingData {
  websiteTitle: string;
  websiteTagline: string; 
  headerLogoURL: string; 
}

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

  const closeMenus = () => {
      setMenuOpen(false);
      setProfileMenuOpen(false);
  };

  useEffect(() => {
    if (menuOpen) setProfileMenuOpen(false);
  }, [menuOpen]);
  
  useEffect(() => {
    if (profileMenuOpen) setMenuOpen(false);
  }, [profileMenuOpen]); 

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
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
        
        {/* --- LEFT: LOGO --- */}
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src={logoSrc} 
              alt={`${branding.websiteTitle} Logo`}
              width={50} 
              height={50}
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
        
        {/* --- MOBILE: HAMBURGER BUTTON --- */}
        <button 
            className={styles.hamburgerButton} 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
        >
            {menuOpen ? <CgClose /> : <CgMenuRight />}
        </button>

        {/* --- CENTER: DESKTOP NAV --- */}
        <nav className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/portfolio">Portfolio</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </nav>

        {/* --- RIGHT: CONTROLS --- */}
        <div className={styles.rightControls}>
          
          {/* 1. Shield Button (UPDATED LINK) */}
          <Link 
            href="/ishield-lock" 
            className={`${styles.headerButtonBase} ${styles.shieldCtaButton}`}
          >
            <FaShieldAlt /> iShield Lock
          </Link>
          
          {/* 2. Start Project Button */}
          <Link 
            href="/new-project" 
            className={`${styles.headerButtonBase} ${styles.primaryCtaButton}`}
          >
            Start Project
          </Link>

          {/* 3. CONTACT BUTTON */}
          <Link 
            href="/contact" 
            className={`${styles.headerButtonBase} ${styles.contactButton}`}
          >
            <FaEnvelope style={{marginRight: '8px'}}/> Contact
          </Link>
          
          {/* 4. PROFILE DROPDOWN */}
          <div className={styles.profileMenuContainer} ref={profileMenuRef}>
            {!authLoading && currentUser && userProfile?.photoURL ? (
                <Image 
                src={userProfile.photoURL} 
                alt="Profile" 
                width={42} 
                height={42} 
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
                    <li><button onClick={handleLogout} style={{color: '#ff4d4d'}}>Logout</button></li>
                    </ul>
                ) : (
                    <ul>
                    <li><Link href="/login" onClick={closeMenus}>Login / Sign Up</Link></li>
                    </ul>
                )}
                </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE FULLSCREEN MENU --- */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
          <nav>
            <ul className={styles.mobileNavLinks}>
              <li><Link href="/" onClick={closeMenus}>Home</Link></li>
              <li><Link href="/services" onClick={closeMenus}>Services</Link></li>
              <li><Link href="/portfolio" onClick={closeMenus}>Portfolio</Link></li>
              {/* Mobile Link Fixed */}
              <li><Link href="/ishield-lock" onClick={closeMenus} style={{color: '#8E2DE2'}}>iShield Lock</Link></li>
              <li><Link href="/blog" onClick={closeMenus}>Blog</Link></li>
              <li><Link href="/contact" onClick={closeMenus}>Contact Us</Link></li>
              <li><Link href="/new-project" className={styles.mobileCta} onClick={closeMenus}>Start a Project</Link></li> 
            </ul>
          </nav>
        </div>
    </header>
  );
};

export default Header;