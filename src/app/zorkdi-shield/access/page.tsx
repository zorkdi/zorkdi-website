// app/zorkdi-shield/access/page.tsx

"use client";

import React, { useState, useRef } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { 
    FaCamera, 
    FaCheck, 
    FaSpinner, 
} from 'react-icons/fa';

// Firebase Imports
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase'; 

export default function DistributorForm() {
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        contact: '', // Phone or Email
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Status: IDLE -> UPLOADING -> SUCCESS -> ERROR
    const [status, setStatus] = useState<string>('IDLE');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!imageFile) {
            alert("Please upload a formal profile image.");
            return;
        }

        setStatus('UPLOADING');

        try {
            let imageUrl = "";

            // 1. Upload Formal Image
            const storageRef = ref(storage, `distributor_profiles/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);

            // 2. Save Distributor Data
            await addDoc(collection(db, 'distributor_requests'), {
                fullName: formData.fullName,
                address: formData.address,
                contact: formData.contact,
                profileImageUrl: imageUrl,
                createdAt: serverTimestamp(),
                status: 'pending_review',
                type: 'distributor_application'
            });

            setStatus('SUCCESS');

        } catch (error) {
            console.error("Error:", error);
            setStatus('ERROR');
            setTimeout(() => setStatus('IDLE'), 3000);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.ambientGlow}></div>

            <div className={styles.container}>
                
                {status === 'SUCCESS' ? (
                    // --- SUCCESS VIEW ---
                    <div className={`${styles.formCard} ${styles.successCard}`}>
                        <div className={styles.successIconCircle}>
                            <FaCheck />
                        </div>
                        <h2 className={styles.successTitle}>Application Received</h2>
                        <p className={styles.successText}>
                            Thank you, {formData.fullName}.<br/>
                            We have received your details and profile image.
                            <br/><br/>
                            <strong>Our team will review your application. If your profile is shortlisted, you will receive a formal call from us.</strong>
                        </p>
                        <Link href="/" className={styles.backLink}>
                            Return to Home
                        </Link>
                    </div>
                ) : (
                    // --- FORM VIEW ---
                    <form className={styles.formCard} onSubmit={handleSubmit}>
                        <div className={styles.header}>
                            <h1>Distributor Application</h1>
                            <p>Join the ZORK DI Shield network.</p>
                        </div>

                        {/* Image Upload - Centerpiece */}
                        <div className={styles.imageSection}>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                onChange={handleImageChange} 
                                className={styles.hiddenInput} 
                            />
                            
                            <div className={styles.uploadCircle} onClick={() => fileInputRef.current?.click()}>
                                {imagePreview ? (
                                    <Image 
                                        src={imagePreview} 
                                        alt="Profile" 
                                        width={120} 
                                        height={120} 
                                        className={styles.previewImg} 
                                    />
                                ) : (
                                    <>
                                        <FaCamera className={styles.uploadIcon} />
                                        <span className={styles.uploadLabel}>Upload Photo</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <p className={styles.warningText}>* Please upload a formal / professional image only.</p>

                        <div style={{marginTop: '2rem'}}>
                            {/* Name */}
                            <div className={styles.inputGroup}>
                                <span className={styles.inputLabel}>Full Name</span>
                                <input 
                                    type="text" 
                                    name="fullName"
                                    className={styles.inputField} 
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required 
                                    placeholder="Enter your full name"
                                />
                            </div>

                            {/* Contact */}
                            <div className={styles.inputGroup}>
                                <span className={styles.inputLabel}>Mobile / Email</span>
                                <input 
                                    type="text" 
                                    name="contact"
                                    className={styles.inputField} 
                                    value={formData.contact}
                                    onChange={handleChange}
                                    required 
                                    placeholder="+91 ... or email@address.com"
                                />
                            </div>

                            {/* Address */}
                            <div className={styles.inputGroup}>
                                <span className={styles.inputLabel}>Full Address</span>
                                <textarea 
                                    name="address"
                                    className={styles.textArea} 
                                    value={formData.address}
                                    onChange={handleChange}
                                    required 
                                    placeholder="Shop / Office Address"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={status === 'UPLOADING'}
                        >
                            {status === 'UPLOADING' ? (
                                <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                                    <FaSpinner className="spin" /> Processing...
                                </span>
                            ) : (
                                "Submit Application"
                            )}
                        </button>

                        {status === 'ERROR' && (
                            <p style={{color: '#ff4444', textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem'}}>
                                Submission failed. Please verify connection.
                            </p>
                        )}
                    </form>
                )}
            </div>
        </main>
    );
}