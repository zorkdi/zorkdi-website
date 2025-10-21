// src/app/services/page.tsx

"use client"; // NAYA: Animation component ke liye "use client" zaroori hai

import styles from './services.module.css';
// NAYA: AnimationWrapper component ko import kiya
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';

// Dummy icons (replace with actual icons if you have them)
const ServiceIcon = () => <span>⚙️</span>;

const ServicesPage = () => {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1>Our Expertise</h1>
        <p>We offer a wide range of services to bring your digital ideas to life, ensuring quality, scalability, and performance.</p>
      </section>

      {/* NAYA: Har service item ko AnimationWrapper se wrap kiya with delay */}
      <AnimationWrapper delay={0.1}>
        <div className={styles.serviceItem}>
          <div className={styles.serviceIcon}><ServiceIcon /></div>
          <h2>Custom Web Application Development</h2>
          <p>Building robust, scalable, and secure web applications tailored precisely to your business requirements using modern technologies like Next.js, Node.js, and Firebase.</p>
          <h4>What we offer:</h4>
          <ul>
            <li>Full-Stack Development</li>
            <li>API Integration</li>
            <li>Real-time Features</li>
            <li>Cloud Deployment</li>
          </ul>
        </div>
      </AnimationWrapper>

      <AnimationWrapper delay={0.2}>
        <div className={styles.serviceItem}>
          <div className={styles.serviceIcon}><ServiceIcon /></div>
          <h2>Mobile App Development (iOS & Android)</h2>
          <p>Creating engaging and high-performance native or cross-platform mobile applications that provide seamless user experiences on both iOS and Android devices.</p>
          <h4>What we offer:</h4>
          <ul>
            <li>Native iOS (Swift)</li>
            <li>Native Android (Kotlin)</li>
            <li>Cross-Platform (Flutter/React Native)</li>
            <li>App Store Deployment</li>
          </ul>
        </div>
      </AnimationWrapper>

      <AnimationWrapper delay={0.3}>
        <div className={styles.serviceItem}>
          <div className={styles.serviceIcon}><ServiceIcon /></div>
          <h2>UI/UX Design & Prototyping</h2>
          <p>Designing intuitive, user-friendly, and visually stunning interfaces that enhance user engagement and align perfectly with your brand identity.</p>
          <h4>What we offer:</h4>
          <ul>
            <li>User Research & Persona</li>
            <li>Wireframing & Prototyping</li>
            <li>Interface Design</li>
            <li>Usability Testing</li>
          </ul>
        </div>
      </AnimationWrapper>

       <AnimationWrapper delay={0.4}>
        <div className={styles.serviceItem}>
          <div className={styles.serviceIcon}><ServiceIcon /></div>
          <h2>Custom Software Solutions</h2>
          <p>Developing specialized software tailored to automate processes, improve efficiency, and solve unique business challenges that off-the-shelf software cannot.</p>
          <h4>What we offer:</h4>
          <ul>
            <li>Desktop Applications</li>
            <li>Business Process Automation</li>
            <li>System Integration</li>
            <li>Maintenance & Support</li>
          </ul>
        </div>
      </AnimationWrapper>

    </main>
  );
};

export default ServicesPage;