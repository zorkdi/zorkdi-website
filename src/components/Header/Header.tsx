// components/Header/Header.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Header.module.css';
import { CgMenuRight, CgClose, CgProfile } from "react-icons/cg";
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const Header = () => {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      setProfileMenuOpen(false);
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuRef]);


  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="ZORK DI Logo"
              width={55} 
              height={55}
              priority
            />
            <div className={styles.logoTextContainer}>
              <span className={styles.brandName}>ZORK DI</span>
              <span className={styles.brandTagline}>Empowering Ideas With Technology</span>
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
            
            {currentUser && userProfile?.photoURL ? (
              <img 
                src={userProfile.photoURL} 
                alt="Profile" 
                className={styles.profileImage}
                onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
              />
            ) : (
              <button 
                className={styles.profileIcon} 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                aria-label="Profile menu"
              >
                <CgProfile />
              </button>
            )}
            
            {profileMenuOpen && (
              <div className={styles.profileDropdown}>
                {currentUser ? (
                  <ul>
                    <li><Link href="/profile" onClick={() => setProfileMenuOpen(false)}>My Profile</Link></li>
                    {/* NAYA: "My Projects" ka link add kiya */}
                    <li><Link href="/my-projects" onClick={() => setProfileMenuOpen(false)}>My Projects</Link></li>
                    <li><Link href="/chat" onClick={() => setProfileMenuOpen(false)}>Chat</Link></li>
                    <li><button onClick={handleLogout}>Logout</button></li>
                  </ul>
                ) : (
                  <ul>
                    <li><Link href="/login" onClick={() => setProfileMenuOpen(false)}>Login</Link></li>
                    <li><Link href="/signup" onClick={() => setProfileMenuOpen(false)}>Sign Up</Link></li>
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
        <div className={styles.mobileMenu}>
          <nav>
            <ul className={styles.mobileNavLinks}>
              <li><Link href="/services" onClick={() => setMenuOpen(false)}>Services</Link></li>
              <li><Link href="/portfolio" onClick={() => setMenuOpen(false)}>Portfolio</Link></li>
              <li><Link href="/about" onClick={() => setMenuOpen(false)}>About Us</Link></li>
              <li><Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link></li>
              <li><Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
              <li><Link href="/new-project" className={styles.mobileCta} onClick={() => setMenuOpen(false)}>Start a Project</Link></li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;