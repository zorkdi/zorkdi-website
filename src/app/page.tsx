// app/page.tsx

"use client"; // NAYA: Animation component ke liye "use client" zaroori hai

import Link from 'next/link';
import styles from './page.module.css';
// NAYA: AnimationWrapper component ka import path theek kiya
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';

// Yeh icons dummy hain, aap inki jagah react-icons se asli icons use kar sakte hain
const ServiceIcon = () => <span>🚀</span>;
const WhyUsIcon = () => <span>💡</span>;

const HomePage = () => {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroHeadline}>Engineering Your Vision into Reality.</h1>
        <p className={styles.heroSubheadline}>We transform your ideas into high-performance applications, websites, and software that drive growth and user engagement.</p>
        <Link href="/services" className={styles.heroButton}>Explore Our Services</Link>
      </section>

      {/* Services Section */}
      <section className={styles.servicesSection}>
        <h2 className={styles.sectionTitle}>Our Services</h2>
        <div className={styles.servicesGrid}>
          {/* Har service card ko AnimationWrapper se wrap kiya */}
          <AnimationWrapper>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}><ServiceIcon /></div>
              <h3>Custom Web Apps</h3>
              <p>Scalable and secure web applications tailored to your business needs.</p>
            </div>
          </AnimationWrapper>
          <AnimationWrapper delay={0.2}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}><ServiceIcon /></div>
              <h3>Mobile App Development</h3>
              <p>Engaging iOS and Android apps that captivate your audience.</p>
            </div>
          </AnimationWrapper>
          <AnimationWrapper delay={0.4}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}><ServiceIcon /></div>
              <h3>UI/UX Design</h3>
              <p>Intuitive and beautiful designs that provide a seamless user experience.</p>
            </div>
          </AnimationWrapper>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className={styles.portfolioSection}>
        <h2 className={styles.sectionTitle}>Our Work</h2>
        <div className={styles.portfolioGrid}>
          <div className={styles.portfolioItem}>
            <div className={styles.portfolioImagePlaceholder}>Project 1</div>
            <h3>Project Title 1</h3>
            <p>A short description of the project.</p>
          </div>
          <div className={styles.portfolioItem}>
            <div className={styles.portfolioImagePlaceholder}>Project 2</div>
            <h3>Project Title 2</h3>
            <p>A short description of the project.</p>
          </div>
          <div className={styles.portfolioItem}>
            <div className={styles.portfolioImagePlaceholder}>Project 3</div>
            <h3>Project Title 3</h3>
            <p>A short description of the project.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className={styles.whyUsSection}>
        <h2 className={styles.sectionTitle}>Why Choose ZORK DI?</h2>
        <div className={styles.whyUsGrid}>
          <AnimationWrapper>
            <div className={styles.whyUsItem}>
              <div className={styles.whyUsIcon}><WhyUsIcon /></div>
              <h3>Expert Team</h3>
              <p>Our team consists of highly skilled developers, designers, and strategists.</p>
            </div>
          </AnimationWrapper>
          <AnimationWrapper delay={0.2}>
            <div className={styles.whyUsItem}>
              <div className={styles.whyUsIcon}><WhyUsIcon /></div>
              <h3>Client-Centric</h3>
              <p>We work closely with you to ensure your vision is perfectly realized.</p>
            </div>
          </AnimationWrapper>
          <AnimationWrapper delay={0.4}>
            <div className={styles.whyUsItem}>
              <div className={styles.whyUsIcon}><WhyUsIcon /></div>
              <h3>Future Proof</h3>
              <p>We use the latest technologies to build scalable and robust solutions.</p>
            </div>
          </AnimationWrapper>
        </div>
      </section>
      
      {/* Dummy sections, inko baad mein asli content se replace kar sakte hain */}
      <section className={styles.testimonialsSection}>
        <h2 className={styles.sectionTitle}>Testimonials</h2>
      </section>
      <section className={styles.blogSection}>
        <h2 className={styles.sectionTitle}>From The Blog</h2>
      </section>
    </main>
  );
};

export default HomePage;