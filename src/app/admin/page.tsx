// app/admin/page.tsx

"use client";

import styles from './admin.module.css';
import Link from 'next/link';
// === YAHAN CHANGE KIYA GAYA HAI ===
// FaChartLine ko main import list mein add kiya
import { FaUsers, FaTasks, FaFeatherAlt, FaChartLine, FaEnvelope } from 'react-icons/fa'; 
import { useAuth } from '@/context/AuthContext';

// NAYA: Abhi dummy hook use kar rahe hain
const useDashboardStats = () => ({
    stats: [
        { title: 'New Project Requests', value: 3, icon: FaTasks, link: '/admin/projects', unread: true },
        { title: 'New Client Chats', value: 5, icon: FaUsers, link: '/admin/chat', unread: true },
        { title: 'New Client Mail', value: 2, icon: FaEnvelope, link: '/admin/mail', unread: true }, // NAYA: Client Mail Stat Card add kiya
        { title: 'Total Blog Posts', value: 12, icon: FaFeatherAlt, link: '/admin/blog', unread: false },
        { title: 'Total Portfolio Items', value: 8, icon: FaChartLine, link: '/admin/portfolio', unread: false },
    ],
    loading: false,
    error: null
});


const AdminDashboardPage = () => {
  const { userProfile } = useAuth();
  const { stats, loading, error } = useDashboardStats(); 

  // User ka naam display karne ke liye logic
  const userName = userProfile?.fullName || userProfile?.email?.split('@')[0] || 'Admin';

  if (loading) {
      return <div className={styles.loading}>Loading Dashboard Data...</div>;
  }
  
  if (error) {
      return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1>Dashboard</h1>
      </div>
      
      {/* Welcome Message Section */}
      <section className={styles.welcomeMessage}>
          <h2>Welcome Back, {userName}!</h2>
          <p>
              Yahan aap apne business ka high-level overview dekh sakte hain. Niche diye gaye stats par dhyaan dein aur apne pending tasks ko complete karein.
          </p>
          <div className={styles.actionButtonsContainer}>
              <Link href="/admin/projects" className={styles.primaryButton}>Review Projects</Link>
              <Link href="/admin/blog/new" className={styles.secondaryCtaButton} style={{color: 'var(--color-neon-green)'}}>Create New Post</Link>
          </div>
      </section>

      {/* Stats Grid */}
      <section style={{ marginTop: '3rem' }}>
          <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                  // Link ko hi statCard jaisa style kiya gaya hai
                  <Link href={stat.link} key={index} style={{textDecoration: 'none'}}>
                      <div className={`${styles.statCard} ${stat.unread ? styles.unreadCard : ''}`}>
                          <h2 style={{ display: 'flex', alignItems: 'center' }}>
                              <stat.icon style={{ marginRight: '0.75rem', color: 'var(--color-secondary-accent)' }}/>
                              {stat.title}
                          </h2>
                          <p>{stat.value}</p>
                      </div>
                  </Link>
              ))}
          </div>
      </section>
      
      {/* === YAHAN NAYA SECTION ADD KIYA GAYA HAI === */}
      <section className={styles.welcomeMessage} style={{ marginTop: '3rem', borderTop: '1px solid var(--color-glass-light)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-neon-light)' }}>
              <FaChartLine /> Website Analytics
          </h2>
          <p>
              Aapka Google Analytics setup ho gaya hai. Yahan click karke aap apne daily, monthly, aur total visitors ki poori report ek naye tab mein dekh sakte hain.
          </p>
          <div className={styles.actionButtonsContainer}>
              <Link 
                href="https://analytics.google.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.primaryButton}
              >
                  View Full Analytics Report
              </Link>
          </div>
      </section>
      
      {/* Quick Actions Section (Placeholder) */}
      <div className={styles.dataContainer} style={{marginTop: '2rem'}}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-neon-green)'}}>Quick Actions</h2>
          <p style={{opacity: 0.8}}>Yahan aap future mein important tasks ya To-Do list add kar sakte hain.</p>
      </div>
    </>
  );
};

export default AdminDashboardPage;