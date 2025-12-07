// src/app/admin/layout.tsx

"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './admin.module.css';
import { 
    FaTachometerAlt, FaFeatherAlt, FaUsers, FaTasks, FaCog, FaChartLine, FaSignOutAlt, FaEnvelope, FaUserTie, FaBuilding,
    FaBookOpen,
    FaShieldAlt,
    FaUserPlus // NAYA ICON: Distributor Leads ke liye
} from 'react-icons/fa';
import { CgClose } from 'react-icons/cg';
import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore'; 

// --- Admin Navigation Links ---
const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: FaTachometerAlt },
    { name: 'Distributor Leads', href: '/admin/distributor-requests', icon: FaUserPlus }, // <-- NEW LINK
    { name: 'Shield Partners', href: '/admin/shield-partners', icon: FaShieldAlt },
    { name: 'Project Requests', href: '/admin/projects', icon: FaTasks },
    { name: 'Blog Posts', href: '/admin/blog', icon: FaFeatherAlt },
    { name: 'Portfolio', href: '/admin/portfolio', icon: FaChartLine },
    { name: 'Case Studies', href: '/admin/case-studies', icon: FaBookOpen },
    { name: 'Client Chat', href: '/admin/chat', icon: FaUsers },
    { name: 'Client Inbox', href: '/admin/mail', icon: FaEnvelope },
    { name: 'Founder Profile', href: '/admin/founder', icon: FaUserTie },
    { name: 'Trust Settings', href: '/admin/trust', icon: FaBuilding },
    { name: 'Settings', href: '/admin/settings', icon: FaCog },
];

// --- Access Denied Component ---
const AccessDenied = ({ errorMessage }: { errorMessage: string }) => (
    <div className={styles.accessDeniedContainer}>
        <h1>Access Denied!</h1>
        <p>{errorMessage}</p>
        <Link href="/login" className={styles.primaryButton} style={{marginTop: '2rem'}}>Go to Login</Link>
    </div>
);

// --- Admin Layout Component ---
export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { currentUser, loading: authLoading } = useAuth(); 
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [adminUID, setAdminUID] = useState<string | null>(null);
    const [cmsLoading, setCmsLoading] = useState(true);

    // 1. Fetch Admin UID for Access Control
    useEffect(() => {
        const fetchAdminUID = async () => {
            try {
                const docRef = doc(db, 'cms', 'global_settings');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAdminUID(docSnap.data().adminUID || 'eWCjS5yqHvSuafrJ5IbWlT6Kmyf2'); 
                } else {
                    setAdminUID('eWCjS5yqHvSuafrJ5IbWlT6Kmyf2'); 
                }
            } catch (error) {
                console.error("Error fetching admin UID:", error);
                setAdminUID('eWCjS5yqHvSuafrJ5IbWlT6Kmyf2'); 
            } finally {
                setCmsLoading(false);
            }
        };
        fetchAdminUID();
    }, []);

    // Check Authentication and Authorization status
    const isAuthorized = currentUser && adminUID && currentUser.uid === adminUID;

    if (authLoading || cmsLoading) {
        return <div className={styles.loading}>Loading Admin Panel...</div>;
    }
    
    if (!currentUser) {
        return <AccessDenied errorMessage="Please login to access the Admin Dashboard." />;
    }

    if (!isAuthorized) {
        return <AccessDenied errorMessage="Your account is not authorized for Admin access." />;
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error("Admin Logout error:", error);
        }
    };
    
    // --- Sidebar & Main Content Render ---
    return (
        <div className={styles.adminLayout}>
            {/* Sidebar (Desktop & Mobile) */}
            <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                
                {/* Mobile Close Button */}
                <button 
                    className={styles.hamburgerButton} 
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }} 
                >
                    <CgClose />
                </button>
                
                <h2>ZORK DI Admin</h2>
                <nav>
                    <ul>
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
                            return (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href} 
                                        onClick={() => setSidebarOpen(false)}
                                        className={isActive ? styles.activeLink : ''}
                                    >
                                        <link.icon style={{ marginRight: '1rem', fontSize: '1.2rem' }} />
                                        {link.name}
                                    </Link>
                                </li>
                            );
                        })}
                        {/* Logout Link */}
                        <li>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                <FaSignOutAlt style={{ marginRight: '1rem', fontSize: '1.2rem' }} />
                                Logout
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className={styles.mainContent}>
                 {/* Mobile Open Button */}
                 <button 
                    className={styles.hamburgerButton} 
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open sidebar"
                    style={{ position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: 998, display: sidebarOpen ? 'none' : 'block' }} 
                >
                    <FaTachometerAlt />
                </button>
                {children}
            </div>
        </div>
    );
}