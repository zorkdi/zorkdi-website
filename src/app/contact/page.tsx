// src/app/contact/page.tsx

"use client"; // NAYA: Animation component ke liye "use client" zaroori hai

import styles from './contact.module.css';
// NAYA: AnimationWrapper component ko import kiya
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
// Icons for social links (assuming you have react-icons installed)
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";

const ContactPage = () => {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1>Get In Touch</h1>
        <p>Have a project in mind or just want to say hello? We'd love to hear from you.</p>
      </section>

      <section className={styles.contactSection}>
        {/* NAYA: Left column (Contact Info) wrapped */}
        <AnimationWrapper delay={0.1}>
          <div className={styles.contactInfo}>
            <h2>Contact Information</h2>
            <p>Reach out to us via email, phone, or connect on social media.</p>
            <div className={styles.infoItem}>
              <strong>Email</strong>
              <a href="mailto:info@zorkdi.com">info@zorkdi.com</a>
            </div>
            <div className={styles.infoItem}>
              <strong>Phone</strong>
              <span>+91-1234567890</span> {/* Replace with actual phone */}
            </div>
            <div className={styles.socials}>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            </div>
          </div>
        </AnimationWrapper>

        {/* NAYA: Right column (Form) wrapped */}
        <AnimationWrapper delay={0.3}>
          <form className={styles.contactForm}>
            <h2>Send Us a Message</h2>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" name="subject" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" required />
            </div>
            <button type="submit" className={styles.submitButton}>Send Message</button>
          </form>
        </AnimationWrapper>
      </section>
    </main>
  );
};

export default ContactPage;