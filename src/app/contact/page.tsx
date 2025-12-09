// src/app/contact/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import styles from './contact.module.css'; // Import Module CSS
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaInstagram, FaFacebookF, FaSpinner } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface GlobalSettings {
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    socialLinkedin: string;
    socialTwitter: string;
    socialInstagram: string;
    socialFacebook: string;
}

const initialGlobalData: GlobalSettings = {
    contactEmail: "info@zorkdi.com",
    contactPhone: "+1 (555) 555-5555",
    contactAddress: "123 Digital Blvd, Suite 100, Tech City, USA",
    socialLinkedin: "#",
    socialTwitter: "#",
    socialInstagram: "#",
    socialFacebook: "#",
};

const initialFormData = {
    name: '',
    email: '',
    subject: '',
    message: '',
};

const ContactPage = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [globalData, setGlobalData] = useState<GlobalSettings>(initialGlobalData); 
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isGlobalDataFetching, setIsGlobalDataFetching] = useState(true);

    useEffect(() => {
        const fetchGlobalData = async () => {
            try {
                const docRef = doc(db, 'cms', 'global_settings');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setGlobalData({
                        contactEmail: data.contactEmail || initialGlobalData.contactEmail,
                        contactPhone: data.contactPhone || initialGlobalData.contactPhone,
                        contactAddress: data.contactAddress || initialGlobalData.contactAddress,
                        socialLinkedin: data.socialLinkedin || initialGlobalData.socialLinkedin,
                        socialTwitter: data.socialTwitter || initialGlobalData.socialTwitter,
                        socialInstagram: data.socialInstagram || initialGlobalData.socialInstagram,
                        socialFacebook: data.socialFacebook || initialGlobalData.socialFacebook,
                    });
                }
            } catch (error) {
                console.error("Error fetching global contact data:", error);
            } finally {
                setIsGlobalDataFetching(false);
            }
        };
        fetchGlobalData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (statusMessage.message) {
            setStatusMessage({ type: '', message: '' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMessage({ type: '', message: '' });

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setStatusMessage({ type: 'success', message: "Transmission Successful. We'll respond shortly." });
                setFormData(initialFormData);
            } else {
                setStatusMessage({ type: 'error', message: result.message || 'Transmission Failed.' });
            }

        } catch (error) {
            console.error('Submission error:', error);
            setStatusMessage({ type: 'error', message: 'Network Error. Connection Lost.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.main}>
            {/* Background Effects are handled in CSS now */}
            
            <div className={styles.container}>
                
                {/* Header */}
                <div className={styles.hero}>
                    <h1>Get In Touch</h1>
                    <p>Ready to start your next big project? Initiate a connection.</p>
                </div>

                {/* Main Grid */}
                <div className={styles.contactSection}>
                    
                    {/* LEFT: INFO CARD */}
                    <div className={styles.contactInfoCard}>
                        <h2>Contact Uplink</h2>
                        <p className={styles.infoSubtitle}>
                            Direct channels to our headquarters.
                        </p>
                        
                        {isGlobalDataFetching && globalData.contactEmail === "info@zorkdi.com" ? (
                            <div className={styles.loadingInfo}>
                                <FaSpinner className={styles.spinner}/> Accessing Database...
                            </div>
                        ) : (
                            <div className={styles.infoList}>
                                <div className={styles.infoItem}>
                                    <div className={styles.iconBox}><FaEnvelope /></div>
                                    <div>
                                        <h4>Email</h4>
                                        <p>{globalData.contactEmail}</p>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <div className={styles.iconBox}><FaPhoneAlt /></div>
                                    <div>
                                        <h4>Phone</h4>
                                        <p>{globalData.contactPhone}</p>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <div className={styles.iconBox}><FaMapMarkerAlt /></div>
                                    <div>
                                        <h4>Location</h4>
                                        <p>{globalData.contactAddress}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.socials}>
                            <a href={globalData.socialLinkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                            <a href={globalData.socialTwitter} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                            <a href={globalData.socialInstagram} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                            <a href={globalData.socialFacebook} target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                        </div>
                    </div>

                    {/* RIGHT: FORM CARD */}
                    <div className={styles.formCard}>
                        <h2>Transmit Message</h2>
                        
                        {statusMessage.message && (
                            <div className={`${styles.statusMessage} ${statusMessage.type === 'success' ? styles.success : styles.error}`}>
                                {statusMessage.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.contactForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Your Identity</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Full Name"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Comms ID</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="email@example.com"
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="subject">Directive</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="Project Subject"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message">Data Payload</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    placeholder="Describe your requirements..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={styles.submitButton}
                            >
                                {isLoading ? 'Transmitting...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;