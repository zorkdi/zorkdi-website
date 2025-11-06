// components/Header/Header.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Already imported
import styles from './Header.module.css';
import { CgMenuRight, CgClose } from "react-icons/cg";
import { FaUserCircle } from "react-icons/fa"; // Default profile icon ke liye
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore'; 

// Global settings data type
interface BrandingData {
  websiteTitle: string;
  websiteTagline: string;
}

// Default/Fallback values (Used during loading or if CMS fails)
const defaultBranding: BrandingData = {
    websiteTitle: "ZORK DI",
    websiteTagline: "Empowering Ideas With Technology",
};

const Header = () => {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // Branding state
  const [branding, setBranding] = useState<BrandingData>(defaultBranding);
  const [brandingLoading, setBrandingLoading] = useState(true);

  // Function to close both menus
  const closeMenus = () => {
      setMenuOpen(false);
      setProfileMenuOpen(false);
  };
  
  // Fetch branding data from CMS
  useEffect(() => {
      const fetchBranding = async () => {
          try {
              const docRef = doc(db, 'cms', 'global_settings');
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                  const data = docSnap.data();
                  setBranding({
                      websiteTitle: data.websiteTitle || defaultBranding.websiteTitle,
                      websiteTagline: data.websiteTagline || defaultBranding.websiteTagline,
                  });
              }
          } catch (error) {
              console.error("Failed to fetch branding from CMS:", error);
          } finally {
              setBrandingLoading(false);
          }
      };
      fetchBranding();
  }, []); 

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


  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt={`${branding.websiteTitle} Logo`}
              width={55} 
              height={55}
              priority
              className={styles.logoImage}
            />
            <div className={styles.logoTextContainer}>
              {/* Dynamic Brand Name and Tagline */}
              <span className={styles.brandName}>
                 {brandingLoading ? defaultBranding.websiteTitle : branding.websiteTitle}
              </span>
              <span className={styles.brandTagline}>
                 {brandingLoading ? defaultBranding.websiteTagline : branding.websiteTagline}
              </span>
            </div>
          </Link>
        </div>
        
        <nav className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/portfolio">Portfolio</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </nav>

        <div className={styles.rightControls}>
          <Link href="/contact" className={styles.secondaryCtaButton}>Contact</Link>
          <Link href="/new-project" className={styles.primaryCtaButton}>Start a Project</Link>
          
          <div className={styles.profileMenuContainer} ref={profileMenuRef}>
            
            {/* Agar logged in hai aur photo hai, toh Image component dikhao */}
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
                /* Agar logged in nahi hai ya photo nahi hai, toh FaUserCircle icon dikhao */
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
                    {/* Admin link add kiya */}
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

          <button 
            className={styles.hamburgerButton} 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <CgClose /> : <CgMenuRight />}
          </button>
        </div>
      </div>

      {menuOpen && (
        // Close button mobile menu ke andar add kiya
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