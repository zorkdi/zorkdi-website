// app/zorkdi-shield/faq/page.tsx

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FaChevronDown, FaShieldAlt } from 'react-icons/fa';
import styles from './faq.module.css';

// --- HYBRID SEO STRATEGY: EXPANDED KEYWORD TARGETING ---
// Humne ab list ko bada kar diya hai taaki long-tail keywords bhi target ho sakein.
// Keywords Covered: Offline Lock, Android 14, Battery Drain, QR Code, Commission, Data Privacy.

const faqData = [
    // --- SECTION 1: CORE PRODUCT & PROBLEM SOLVING (Generic & Brand) ---
    {
        question: "Which is the best EMI Locking App for Mobile Retailers in India?",
        answer: "Currently, ZORK DI Shield is rated as the #1 EMI Locking solution in India. It stands out because of its 'Hard Reset Protection', zero-touch enrollment, and 99.9% server uptime. Unlike cheap Chinese alternatives, ZORK DI Shield is designed specifically for Indian retailers and NBFCs."
    },
    {
        question: "How can I lock a customer's phone if they stop paying EMI?",
        answer: "With ZORK DI Shield, locking is instant. You get a cloud-based 'Retailer Admin Panel'. Simply login, search for the customer's file, and click 'Lock Device'. The phone will lock immediately via the internet. If the phone is offline, it will lock the moment it connects to data or Wi-Fi."
    },
    {
        question: "Does ZORK DI Shield work without Internet (Offline Lock)?",
        answer: "Yes. We have a 'Timer Lock' feature. If the customer keeps the internet off for a specific number of days (e.g., 3 days), the device will lock automatically. This ensures that defaulters cannot escape by simply turning off their data."
    },

    // --- SECTION 2: SECURITY & BYPASS PROTECTION ---
    {
        question: "Can a customer bypass the lock by formatting (Hard Reset) the phone?",
        answer: "No. This is our strongest feature. ZORK DI Shield uses advanced MDM persistence technology. Even if a tech-savvy customer tries to factory reset the phone using volume keys (Hard Reset), the application survives the reset and re-locks the screen immediately upon reboot."
    },
    {
        question: "What happens if the customer changes the SIM card?",
        answer: "Our system includes an instant 'SIM Change Alert'. The moment the registered SIM is removed and a new one is inserted, the Admin Panel records the new phone number and location, notifying you immediately so you can track the user."
    },
    {
        question: "Is ZORK DI's system secure against 'Software Flashing'?",
        answer: "Yes. While basic flashing might remove simple apps, ZORK DI Shield binds to the device's IMEI and Serial Number on the cloud server. Even if the software is flashed, the moment the device comes online, our server recognizes the IMEI and re-applies the policy lock."
    },

    // --- SECTION 3: COMPATIBILITY & TECHNICAL ---
    {
        question: "Does it support the latest Android 13 and Android 14 versions?",
        answer: "Absolutely. ZORK DI Shield is constantly updated. We support all Android versions from Android 8.0 (Oreo) up to the latest Android 14. We also support all major brands: Samsung, Vivo, Oppo, Realme, Xiaomi (Redmi/Poco), OnePlus, Motorola, and Tecno/Infinix."
    },
    {
        question: "Will installing this app slow down the customer's phone or drain battery?",
        answer: "No. The app is extremely lightweight (under 15MB) and is optimized for battery efficiency. It runs silently in the background using less than 1% battery per day, ensuring the customer faces no performance issues."
    },
    {
        question: "How do I install ZORK DI Shield on a new phone? Is it difficult?",
        answer: "It is very easy and takes less than 2 minutes. We use 'QR Code Enrollment'. You just tap the welcome screen of the new phone 6 times, scan the ZORK DI QR code, and the device is automatically set up and secured. No complex cables or PC required."
    },

    // --- SECTION 4: BUSINESS & PRICING (DISTRIBUTOR TARGETING) ---
    {
        question: "How can I become a Distributor for ZORK DI Shield?",
        answer: "We offer a lucrative Distributor program with high margins. If you have a network of mobile shops, you can buy licenses in bulk from us at a discounted rate and resell them to retailers. Contact our sales team via the 'Get Access' button to start your business."
    },
    {
        question: "What is the price of ZORK DI Shield per license key?",
        answer: "Pricing depends on your volume. For single retailers, it is competitive. For bulk distributors (100+ keys), the price drops significantly, allowing you to earn more profit. We offer the best price-to-feature ratio in the Indian market."
    },
    {
        question: "Is ZORK DI Shield legal to use for loan recovery in India?",
        answer: "Yes, it is legal for asset protection. When you sell a phone on EMI, the device technically belongs to the financier until the loan is repaid. Using MDM software like ZORK DI Shield to secure this asset is standard practice, provided the customer consents to the terms."
    },

    // --- SECTION 5: PRIVACY & SUPPORT ---
    {
        question: "Is the customer's personal data (Photos/Messages) safe?",
        answer: "Yes. ZORK DI Shield is an MDM for 'Device Control', not 'Data Spying'. We do NOT access or store the customer's personal photos, gallery, or messages. We only track location and device status (Locked/Unlocked) to ensure EMI recovery, respecting user privacy laws."
    },
    {
        question: "What if a customer pays the EMI? How fast is the unlock process?",
        answer: "Unlocking is instant. As soon as you click 'Unlock' on your Admin Panel, the customer's phone unlocks within 5 seconds. You can also set 'Auto-Unlock' dates if you want the device to unlock automatically after a scheduled payment."
    },
    {
        question: "Do you provide technical support if I face issues?",
        answer: "Yes, we provide dedicated WhatsApp and Call support for our Retailers and Distributors. Our technical team is available to help you with installation, panel management, or any troubleshooting you might need."
    }
];

export default function FAQPage() {
    // Accordion State
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    // --- JSON-LD SCHEMA FOR GOOGLE ---
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <main className={styles.main}>
            {/* Inject Schema for Google Bots */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className={styles.cyberGrid}></div>

            <section className={styles.headerSection}>
                <div className={styles.badge}>
                    <FaShieldAlt /> EXPERT KNOWLEDGE BASE
                </div>
                <h1 className={styles.title}>
                    Frequently Asked <span>Questions</span>
                </h1>
                <p className={styles.subtitle}>
                    Comprehensive answers about India&apos;s most advanced EMI Locking Ecosystem.
                    Learn why 500+ Retailers trust ZORK DI Shield.
                </p>
            </section>

            <section className={styles.faqContainer}>
                {faqData.map((item, index) => (
                    <div 
                        key={index} 
                        className={`${styles.faqItem} ${activeIndex === index ? styles.active : ''}`}
                        onClick={() => toggleFAQ(index)}
                    >
                        <div className={styles.questionHeader}>
                            <span className={styles.questionText}>{item.question}</span>
                            <FaChevronDown className={styles.icon} />
                        </div>
                        <div className={styles.answerBody}>
                            <div className={styles.answerContent}>
                                {item.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <div className={styles.ctaWrapper}>
                <Link href="/zorkdi-shield/access" className={styles.backBtn}>
                    Get Your Admin Access Now
                </Link>
            </div>
        </main>
    );
}