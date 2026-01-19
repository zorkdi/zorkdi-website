// app/zorkdi-shield/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper';
import { 
    FaShieldAlt, FaLock, FaMapMarkedAlt, FaUserSecret, FaKey, FaUndo, FaServer, FaFingerprint, FaMobileAlt, FaMapMarkerAlt, FaMoneyBillWave, FaCheckCircle, FaPhoneAlt, FaAndroid
} from 'react-icons/fa';

// Firebase
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';

interface Partner {
    id: string;
    name: string;
    designation: string;
    location: string;
    photoUrl: string;
    contact?: string; 
}

export default function ShieldPage() {
    const [partners, setPartners] = useState<Partner[]>([]);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const q = query(collection(db, 'shield_partners'), orderBy('createdAt', 'asc'));
                const querySnapshot = await getDocs(q);
                const fetchedData: Partner[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Partner));
                setPartners(fetchedData);
            } catch (error) {
                console.error("Error fetching partners:", error);
            }
        };
        fetchPartners();
    }, []);

    return (
        <main className={styles.main}>
            {/* Background Grid & Noise Effect */}
            <div className={styles.cyberGrid}></div>

            {/* --- 1. HERO SECTION (Main Product) --- */ }
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <AnimationWrapper>
                        <div className={styles.securityBadge}>
                            <FaShieldAlt /> SYSTEM STATUS: ONLINE
                        </div>
                        
                        <h1 className={styles.heroTitle}>
                            iShield <span>Lock</span>
                        </h1>

                        <p className={styles.heroSubtitle}>
                            The Ultimate EMI Locking & MDM Solution for Finance Companies. 
                            Recover your loans 10x faster with remote device control, real-time tracking, 
                            and anti-fraud protection.
                        </p>

                        <div className={styles.buttonGroup}>
                            <Link href="/zorkdi-shield/access" className={styles.primaryBtn}>
                                Get Access Now
                            </Link>
                            
                            {/* UPDATED DOWNLOAD BUTTON WITH YOUR LINK */}
                            <a 
                                href="https://storage.googleapis.com/zork-di-shield.firebasestorage.app/Project_iShield/iShield_Biz_V1.0.5.apk" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={styles.downloadBtn}
                                download
                            >
                                <FaAndroid size={20} /> Download App
                            </a>

                            <Link href="#features" className={styles.secondaryBtn}>
                                View Features
                            </Link>
                        </div>
                    </AnimationWrapper>
                </div>
            </div>

            {/* --- 2. DISTRIBUTOR SECTION (Business Opportunity) --- */}
            <section className={styles.distributorSection}>
                <div className={styles.distributorContainer}>
                    {/* Left: Text & Benefits */}
                    <div className={styles.distributorText}>
                        <AnimationWrapper>
                            <div className={styles.goldHeading}>
                                <FaMoneyBillWave /> Business Opportunity
                            </div>
                            <h2 className={styles.mainHeading}>
                                Become a iShield Lock <br/> <span>Distributor</span>
                            </h2>
                            <p className={styles.descText}>
                                Join our network and generate a recurring passive income stream. 
                                We offer the industry&apos;s highest profit margins for our partners.
                            </p>
                            
                            <ul className={styles.highlightList}>
                                <li className={styles.highlightItem}>
                                    <FaCheckCircle className={styles.checkIcon} /> No Joining Fees (Limited Time)
                                </li>
                                <li className={styles.highlightItem}>
                                    <FaCheckCircle className={styles.checkIcon} /> Instant License Activation
                                </li>
                                <li className={styles.highlightItem}>
                                    <FaCheckCircle className={styles.checkIcon} /> 24/7 Priority Technical Support
                                </li>
                            </ul>
                        </AnimationWrapper>
                    </div>

                    {/* Right: Earning Calculation Card */}
                    <div className={styles.earningCardWrapper}>
                        <AnimationWrapper delay={0.2}>
                            <div className={styles.earningCard}>
                                <div className={styles.cardLabel}>Potential Earnings</div>
                                <div className={styles.bigAmount}>20% Flat</div>
                                <p style={{color:'#94a3b8', marginBottom:'1.5rem'}}>Commission on every recharge.</p>
                                
                                <div className={styles.calculationBox}>
                                    <div className={styles.calcRow}>
                                        <span>Total Sales</span>
                                        <span style={{color:'#fff'}}>₹ 1,00,000</span>
                                    </div>
                                    <div className={styles.calcRow}>
                                        <span>Your Margin</span>
                                        <span style={{color: '#facc15'}}>20%</span>
                                    </div>
                                    <div className={`${styles.calcRow} ${styles.final}`}>
                                        <span>Your Net Profit</span>
                                        <span>₹ 20,000</span>
                                    </div>
                                </div>

                                <Link href="/zorkdi-shield/access" className={styles.applyBtn}>
                                    Apply as Distributor
                                </Link>
                            </div>
                        </AnimationWrapper>
                    </div>
                </div>
            </section>

            {/* --- 3. FEATURES GRID --- */}
            <section id="features" className={styles.featuresSection}>
                <div className={styles.sectionHeading}>
                    <AnimationWrapper>
                        <h2>Military-Grade Control</h2>
                        <p>Designed to prevent EMI defaults before they happen.</p>
                    </AnimationWrapper>
                </div>

                <div className={styles.featuresGrid}>
                    <AnimationWrapper delay={0.1}>
                        <div className={styles.featureCard}>
                            <div className={styles.iconWrapper}><FaLock /></div>
                            <h3>Instant EMI Lock</h3>
                            <p>Lock the customer&apos;s device remotely with a single click if EMI is missed. The phone becomes unusable until payment is made.</p>
                        </div>
                    </AnimationWrapper>

                    <AnimationWrapper delay={0.2}>
                        <div className={styles.featureCard}>
                            <div className={styles.iconWrapper}><FaMapMarkedAlt /></div>
                            <h3>Live GPS Tracking</h3>
                            <p>Track the real-time location of the device. Perfect for recovering devices from defaulters who stop responding.</p>
                        </div>
                    </AnimationWrapper>

                    <AnimationWrapper delay={0.3}>
                        <div className={styles.featureCard}>
                            <div className={styles.iconWrapper}><FaUndo /></div>
                            <h3>Hard Reset Protection</h3>
                            <p>Our advanced MDM technology prevents customers from formatting or factory resetting the phone to bypass the lock.</p>
                        </div>
                    </AnimationWrapper>

                    <AnimationWrapper delay={0.4}>
                        <div className={styles.featureCard}>
                            <div className={styles.iconWrapper}><FaUserSecret /></div>
                            <h3>Hidden Admin App</h3>
                            <p>The iShield Lock application remains hidden on the user&apos;s device. They cannot uninstall or tamper with it.</p>
                        </div>
                    </AnimationWrapper>
                    
                    <AnimationWrapper delay={0.5}>
                        <div className={styles.featureCard}>
                            <div className={styles.iconWrapper}><FaKey /></div>
                            <h3>Remote PIN Change</h3>
                            <p>Reset or change the customer&apos;s device PIN/Pattern remotely from the admin panel if they forget it or to secure the device.</p>
                        </div>
                    </AnimationWrapper>

                    <AnimationWrapper delay={0.6}>
                        <div className={styles.featureCard}>
                            <div className={styles.iconWrapper}><FaFingerprint /></div>
                            <h3>SIM Change Alert</h3>
                            <p>Get instant notifications if the customer changes the SIM card or tries to use a different number.</p>
                        </div>
                    </AnimationWrapper>
                </div>
            </section>

            {/* --- 4. STRATEGIC ALLIANCE (PARTNERS) SECTION --- */}
            <section className={styles.partnersSection}>
                <div className={styles.sectionHeading}>
                    <AnimationWrapper>
                        <h2>Strategic Alliance</h2>
                        <p>Meet the leaders driving iShield Lock across the nation.</p>
                    </AnimationWrapper>
                </div>

                <div className={styles.partnersGrid}>
                    {partners.length > 0 ? (
                        partners.map((partner, index) => (
                            <AnimationWrapper key={partner.id} delay={index * 0.1}>
                                <div className={styles.partnerCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.imageFrame}>
                                            <Image 
                                                src={partner.photoUrl} 
                                                alt={partner.name} 
                                                width={160} 
                                                height={160} 
                                                className={styles.partnerImage} 
                                            />
                                        </div>
                                        <h3 className={styles.partnerName}>{partner.name}</h3>
                                        <p className={styles.partnerRole}>{partner.designation}</p>
                                        <div className={styles.divider}></div>
                                    </div>
                                    
                                    <div className={styles.cardBody}>
                                        <div className={styles.infoRow}>
                                            <FaMapMarkerAlt className={styles.infoIcon} /> 
                                            <span>{partner.location}</span>
                                        </div>
                                        
                                        {partner.contact ? (
                                            <a href={`tel:${partner.contact}`} className={styles.callButton}>
                                                <FaPhoneAlt /> {partner.contact}
                                            </a>
                                        ) : (
                                            <div className={styles.callButton} style={{opacity: 0.5, pointerEvents: 'none'}}>
                                                <FaCheckCircle /> Verified Partner
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </AnimationWrapper>
                        ))
                    ) : (
                        <AnimationWrapper>
                            <div className={styles.partnerCard} style={{ opacity: 0.8 }}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.imageFrame}>
                                        <Image 
                                            src="/logo.png" 
                                            alt="iShield Lock" 
                                            width={160} 
                                            height={160} 
                                            className={styles.partnerImage}
                                            style={{objectFit: 'contain', backgroundColor: '#000'}} 
                                        />
                                    </div>
                                    <h3 className={styles.partnerName}>iShield Lock</h3>
                                    <p className={styles.partnerRole}>Official Product</p>
                                    <div className={styles.divider}></div>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.infoRow}>
                                        <FaMapMarkerAlt className={styles.infoIcon} /> 
                                        <span>Enterprise Security</span>
                                    </div>
                                    <div className={styles.callButton} style={{opacity: 0.5}}>
                                        <FaCheckCircle /> Global Access
                                    </div>
                                </div>
                            </div>
                        </AnimationWrapper>
                    )}
                </div>
            </section>

            {/* --- 5. HOW IT WORKS --- */}
            <section className={styles.stepsSection}>
                <div className={styles.sectionHeading}>
                    <AnimationWrapper>
                        <h2>Deployment in 3 Steps</h2>
                    </AnimationWrapper>
                </div>

                <div className={styles.stepsGrid}>
                    <AnimationWrapper delay={0.1}>
                        <div className={styles.stepCard}>
                            <span className={styles.stepNumber}>01</span>
                            <div className={styles.stepContent}>
                                <div className={styles.stepIcon}><FaServer /></div>
                                <h3>Create Account</h3>
                                <p>Get your retailer or admin account on the iShield Lock panel.</p>
                            </div>
                        </div>
                    </AnimationWrapper>

                    <AnimationWrapper delay={0.2}>
                        <div className={styles.stepCard}>
                            <span className={styles.stepNumber}>02</span>
                            <div className={styles.stepContent}>
                                <div className={styles.stepIcon}><FaMobileAlt /></div>
                                <h3>Enroll Device</h3>
                                <p>Scan the QR code on the customer&apos;s new phone to activate the MDM.</p>
                            </div>
                        </div>
                    </AnimationWrapper>

                    <AnimationWrapper delay={0.3}>
                        <div className={styles.stepCard}>
                            <span className={styles.stepNumber}>03</span>
                            <div className={styles.stepContent}>
                                <div className={styles.stepIcon}><FaLock /></div>
                                <h3>Total Control</h3>
                                <p>The device is now secured. Manage EMI dates and locks from your dashboard.</p>
                            </div>
                        </div>
                    </AnimationWrapper>
                </div>
            </section>

            {/* --- 6. CTA SECTION --- */}
            <section className={styles.ctaSection}>
                <AnimationWrapper>
                    <div className={styles.ctaBox}>
                        <h2>Ready to Secure Your Finance Business?</h2>
                        <p>Join 50+ finance companies already using iShield Lock to recover loans.</p>
                        <Link href="/zorkdi-shield/access" className={styles.primaryBtn}>
                            Request Demo Access
                        </Link>
                    </div>
                </AnimationWrapper>
            </section>

        </main>
    );
}