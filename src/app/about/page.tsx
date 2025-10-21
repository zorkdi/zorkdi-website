// src/app/about/page.tsx

"use client"; // NAYA: Animation component ke liye "use client" zaroori hai

import styles from './about.module.css';
// NAYA: AnimationWrapper component ko import kiya
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';

// Dummy icons (replace with actual icons)
const ValueIcon = () => <span>⭐</span>;

const AboutPage = () => {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>About ZORK DI</h1>
        <p>Empowering Ideas With Technology - We are a passionate team dedicated to crafting exceptional digital experiences.</p>
      </section>

      {/* Story Section */}
      <AnimationWrapper delay={0.1}>
        <section className={styles.storySection}>
          <div className={styles.storyContent}>
            <h2>Our Story</h2>
            <p>Founded with a vision to bridge the gap between innovative ideas and cutting-edge technology, ZORK DI started as a small team with big ambitions. We believe in the transformative power of technology and strive to create solutions that not only meet but exceed expectations, driving growth and success for our clients.</p>
            <p>Our journey has been fueled by a commitment to quality, collaboration, and continuous learning.</p>
          </div>
          <div className={styles.founderImagePlaceholder}>Founder Image</div>
        </section>
      </AnimationWrapper>

      {/* Mission & Vision Section */}
      <section className={styles.missionVisionSection}>
        <AnimationWrapper delay={0.2}>
          <div className={styles.missionCard}>
            <h3>Our Mission</h3>
            <p>To empower businesses and individuals by transforming their ideas into high-performance, scalable, and user-centric digital solutions.</p>
          </div>
        </AnimationWrapper>
        <AnimationWrapper delay={0.3}>
          <div className={styles.visionCard}>
            <h3>Our Vision</h3>
            <p>To be a globally recognized tech brand known for innovation, quality, and delivering tangible results through custom technology solutions.</p>
          </div>
        </AnimationWrapper>
      </section>

      {/* Core Values Section */}
      <section className={styles.valuesSection}>
        <h2 className={styles.sectionTitle}>Our Core Values</h2>
        <div className={styles.valuesGrid}>
          <AnimationWrapper delay={0.4}>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}><ValueIcon /></div>
              <h4>Innovation</h4>
              <p>Constantly exploring new technologies and approaches.</p>
            </div>
          </AnimationWrapper>
          <AnimationWrapper delay={0.5}>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}><ValueIcon /></div>
              <h4>Quality</h4>
              <p>Delivering robust, reliable, and polished solutions.</p>
            </div>
          </AnimationWrapper>
          <AnimationWrapper delay={0.6}>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}><ValueIcon /></div>
              <h4>Collaboration</h4>
              <p>Working closely with clients as true partners.</p>
            </div>
          </AnimationWrapper>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;