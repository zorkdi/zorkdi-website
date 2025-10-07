"use client"; // Form ko interactive banane ke liye

import { useState } from 'react';
import styles from './contact.module.css';
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, email, message });
    alert('Thank you for your message!');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <main className={styles.main}>
      {/* ===== Hero Section ===== */}
      <section className={styles.hero}>
        <h1>Get in Touch</h1>
        <p>Have a project in mind or just want to say hello? We would love to hear from you.</p>
      </section>

      {/* ===== Main Content Section ===== */}
      <section className={styles.contactSection}>
        {/* Left Side: Contact Info */}
        <div className={styles.contactInfo}>
          <h2>Contact Information</h2>
          <p>Fill up the form and our team will get back to you within 24 hours.</p>
          
          <div className={styles.infoItem}>
            <strong>Email:</strong>
            <a href="mailto:contact@zorkdi.com"> contact@zorkdi.com</a>
          </div>

          <div className={styles.socials}>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea 
              id="message" 
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className={styles.submitButton}>Send Message</button>
        </form>
      </section>
    </main>
  );
};

export default ContactPage;