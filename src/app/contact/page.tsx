// src/app/contact/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
// import styles from '../globals.module.css'; // Removed for fix
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaInstagram, FaFacebookF, FaSpinner } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase'; // Assuming your Firestore instance is imported from here

// --- Firestore Data Type ---
interface GlobalSettings {
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    socialLinkedin: string;
    socialTwitter: string;
    socialInstagram: string;
    socialFacebook: string;
}

// Initial state and default values (Hardcoded values jo hamesha dikhenge agar DB se data nahi mila)
const initialGlobalData: GlobalSettings = {
    contactEmail: "info@zorkdi.com",
    contactPhone: "+1 (555) 555-5555",
    contactAddress: "123 Digital Blvd, Suite 100, Tech City, USA",
    socialLinkedin: "#",
    socialTwitter: "#",
    socialInstagram: "#",
    socialFacebook: "#",
};


// Initial state for the form data
const initialFormData = {
    name: '',
    email: '',
    subject: '',
    message: '',
};

// Common input styles jo aapke code mein baar-baar use ho rahe hain
const commonInputStyle: React.CSSProperties = { 
    width: '100%', 
    padding: '0.8rem', 
    backgroundColor: 'var(--color-dark-navy)', 
    border: '1px solid rgba(255, 255, 255, 0.2)', 
    borderRadius: '8px', 
    color: 'var(--color-off-white)',
    outline: 'none',
};

const ContactPage = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [globalData, setGlobalData] = useState<GlobalSettings>(initialGlobalData); 
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isGlobalDataFetching, setIsGlobalDataFetching] = useState(true);

    // --- Global CMS Data Fetching ---
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


    // --- Form Handlers ---
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // FIX: Apostrophe ko &apos; se replace kiya (Line 144 par yeh error tha)
                setStatusMessage({ type: 'success', message: "Your message has been sent successfully! We&apos;ll get back to you shortly." });
                setFormData(initialFormData);
            } else {
                const errorMsg = result.message || 'Failed to send message. Please try again.';
                setStatusMessage({ type: 'error', message: errorMsg });
            }

        } catch (error) {
            console.error('Submission error:', error);
            setStatusMessage({ type: 'error', message: 'There was a network error. Check your connection and try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Logic ---
    return (
        <div style={{ minHeight: '100vh', padding: '6rem 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3rem', color: 'var(--color-neon-green)' }}>Get In Touch</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Ready to start your next big project? We&apos;re here to help.</p>
                </div>

                {/* Main Contact Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem' }}>
                    
                    {/* Contact Information (DYNAMIC) */}
                    <div style={{ padding: '2rem', backgroundColor: 'var(--color-deep-blue)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h2 style={{ color: 'var(--color-off-white)', marginBottom: '1.5rem' }}>Contact Information</h2>
                        <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                            Our team is here to answer your questions. Reach out via the form, or use the direct contact details below.
                        </p>
                        
                        {/* FIX: Loading spinner sirf tab dikhega jab pehli baar fetch ho raha ho */}
                        {isGlobalDataFetching && globalData.contactEmail === "info@zorkdi.com" ? (
                            <div style={{textAlign: 'left', padding: '2rem 0', color: 'var(--color-neon-green)'}}>
                                <FaSpinner style={{animation: 'spin 1s linear infinite', marginRight: '1rem'}}/> Loading info...
                            </div>
                        ) : (
                            <div style={{ marginBottom: '1.5rem' }}>
                                {/* Dynamic Email */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <FaEnvelope style={{ marginRight: '1rem', color: 'var(--color-neon-green)' }} />
                                    <div>
                                        <h4 style={{ margin: 0, color: 'var(--color-neon-green)' }}>Email Us</h4>
                                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.9 }}>{globalData.contactEmail}</p>
                                    </div>
                                </div>
                                {/* Dynamic Phone */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <FaPhoneAlt style={{ marginRight: '1rem', color: 'var(--color-neon-green)' }} />
                                    <div>
                                        <h4 style={{ margin: 0, color: 'var(--color-neon-green)' }}>Call Us</h4>
                                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.9 }}>{globalData.contactPhone}</p>
                                    </div>
                                </div>
                                {/* Dynamic Location */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <FaMapMarkerAlt style={{ marginRight: '1rem', color: 'var(--color-neon-green)' }} />
                                    <div>
                                        <h4 style={{ margin: 0, color: 'var(--color-neon-green)' }}>Our Location</h4>
                                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.9 }}>{globalData.contactAddress}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Social Icons (DYNAMIC) */}
                        <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem' }}>
                            <a href={globalData.socialLinkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: 'var(--color-off-white)', fontSize: '1.5rem', transition: 'color 0.2s' }}><FaLinkedin /></a>
                            <a href={globalData.socialTwitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" style={{ color: 'var(--color-off-white)', fontSize: '1.5rem', transition: 'color 0.2s' }}><FaTwitter /></a>
                            <a href={globalData.socialInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'var(--color-off-white)', fontSize: '1.5rem', transition: 'color 0.2s' }}><FaInstagram /></a>
                            <a href={globalData.socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: 'var(--color-off-white)', fontSize: '1.5rem', transition: 'color 0.2s' }}><FaFacebookF /></a>
                        </div>
                    </div>

                    {/* Send Us a Message Form */}
                    <div style={{ padding: '2rem', backgroundColor: 'var(--color-deep-blue)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h2 style={{ color: 'var(--color-off-white)', marginBottom: '1.5rem' }}>Send Us a Message</h2>
                        
                        {/* Status Message Display */}
                        {statusMessage.message && (
                            <div 
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    fontWeight: 600,
                                    backgroundColor: statusMessage.type === 'success' ? 'rgba(0, 245, 200, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                                    color: statusMessage.type === 'success' ? 'var(--color-neon-green)' : '#ff4757',
                                    border: statusMessage.type === 'success' ? '1px solid var(--color-neon-green)' : '1px solid #e74c3c'
                                }}
                            >
                                {statusMessage.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.9 }}>Your Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={commonInputStyle}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.9 }}>Your Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={commonInputStyle}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="subject" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.9 }}>Subject *</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    style={commonInputStyle}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.9 }}>Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    style={commonInputStyle}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    cursor: isLoading ? 'not-allowed' : 'pointer', 
                                    opacity: isLoading ? 0.6 : 1,
                                    backgroundColor: 'var(--color-neon-green)',
                                    color: 'var(--color-dark-navy)',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    border: 'none',
                                    boxShadow: '0 0 10px rgba(0, 245, 200, 0.5)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                }}
                                onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 245, 200, 0.7)'; } }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 245, 200, 0.5)'; }}
                            >
                                {isLoading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;