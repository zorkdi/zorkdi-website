import Image from 'next/image';
import styles from './about.module.css';

const AboutPage = () => {
  return (
    <main className={styles.main}>
      {/* ===== Hero Section ===== */}
      <section className={styles.hero}>
        <h1>We Don't Just Build Software, We Build Trust.</h1>
        <p>Learn more about the vision, mission, and the people behind ZORK DI.</p>
      </section>

      {/* ===== Our Story Section ===== */}
      <section className={styles.storySection}>
        <div className={styles.storyContent}>
          <h2>Our Story: The "Why" Behind ZORK DI</h2>
          <p>ZORK DI was founded by Gadadhar Bairagya with a simple idea: to make cutting-edge technology accessible and to empower businesses of all sizes to thrive in the digital world. We saw a gap between brilliant ideas and the complex technical execution required to bring them to life. Our mission is to bridge that gap with expertise, passion, and a commitment to quality.</p>
        </div>
        <div className={styles.founderImagePlaceholder}>
          Image of Gadadhar Bairagya
        </div>
      </section>

      {/* ===== Mission & Vision Section ===== */}
      <section className={styles.missionVisionSection}>
        <div className={styles.missionCard}>
          <h3>Our Mission</h3>
          <p>To build high-quality, secure, and scalable digital products that solve real-world problems and deliver tangible results for our clients.</p>
        </div>
        <div className={styles.visionCard}>
          <h3>Our Vision</h3>
          <p>To become a leading name in custom software development, recognized globally for our innovation, reliability, and client-centric approach.</p>
        </div>
      </section>

      {/* ===== Core Values Section ===== */}
      <section className={styles.valuesSection}>
        <h2 className={styles.sectionTitle}>Our Core Values</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>🤝</div>
            <h4>Partnership</h4>
            <p>We work with you, not just for you. Your goals become our goals.</p>
          </div>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>🏆</div>
            <h4>Quality First</h4>
            <p>We are obsessed with quality and never compromise on delivering a polished product.</p>
          </div>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>💡</div>
            <h4>Innovation</h4>
            <p>We stay ahead of the curve, leveraging the latest tech to build future-proof solutions.</p>
          </div>
        </div>
      </section>

    </main>
  );
};

export default AboutPage;