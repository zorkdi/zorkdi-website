// src/components/AdminForms/ServicesCMS.tsx

"use client"; // CRITICAL: This line ensures it's a module and can use hooks

import { useState, useEffect, ChangeEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import adminStyles from '@/app/admin/admin.module.css';
import formStyles from './forms.module.css';
import { FaPlus, FaMinus } from 'react-icons/fa'; 

// Type definitions
interface ServiceOffering {
    id: string; // Unique ID for keying/local management
    title: string;
    description: string;
    offerings: string[]; // List of bullet points
}

interface ServicesContent {
    heroHeadline: string;
    heroSubheadline: string;
    heroButtonText: string; // NAYA FIELD
    services: ServiceOffering[];
}

// Default/Initial values (6 services)
const initialServiceData: ServicesContent = {
    heroHeadline: "Our Digital Engineering Services",
    heroSubheadline: "Transforming complex ideas into clean, high-performance, and scalable software solutions.",
    heroButtonText: "Explore Our Services", // NAYA DEFAULT VALUE
    services: [
        {
            id: '1', title: 'Custom Web App Development',
            description: "Building fast, secure, and resilient web applications using modern frameworks like Next.js and React.",
            offerings: ["Scalable Architecture Design", "Full-Stack Development (Frontend & Backend)", "API Integration & Development", "Performance Optimization & Testing"]
        },
        {
            id: '2', title: 'Mobile App Development',
            description: "Creating engaging native and cross-platform mobile experiences for iOS and Android devices.",
            offerings: ["Native iOS/Android Development", "Cross-Platform (React Native/Flutter)", "App Store Submission Management", "Mobile UI/UX Implementation"]
        },
        {
            id: '3', title: 'UI/UX Design & Branding',
            description: "Focusing on user-centric design to create intuitive, beautiful interfaces that drive user engagement.",
            offerings: ["Wireframing & Prototyping", "User Research & Testing", "Visual Identity & Branding", "Design System Creation"]
        },
        {
            id: '4', title: 'Custom Software Solutions',
            description: "Tailored software development for unique business needs, including internal tools and enterprise systems.",
            offerings: ["Cloud Infrastructure Setup (AWS/GCP/Azure)", "Legacy System Modernization", "Automated Workflows & Integrations", "Database Design & Management"]
        },
        {
            id: '5', title: 'Strategic Digital Marketing',
            description: "Driving measurable ROI through data-backed SEO, content strategy, and campaign management.",
            offerings: ["SEO & Content Strategy", "Performance & Conversion Optimization", "Data Analytics Integration (GA4)", "Paid Media Campaign Setup"]
        },
        {
            id: '6', title: 'Enterprise Desktop Solutions',
            description: "Building robust, high-performance Windows and cross-platform desktop software for internal tools and automation.",
            offerings: ["Windows Application Development (C#/C++)", "Electron/Tauri Cross-Platform Apps", "Business Process Automation (BPA)", "High-Security Local Data Management"]
        },
    ],
};

// Component to handle the array of service offerings (bullet points)
const OfferingsEditor = ({ offerings, onChange }: { offerings: string[], onChange: (newOfferings: string[]) => void }) => {
    const handleOfferingChange = (index: number, value: string) => {
        const newOfferings = [...offerings];
        newOfferings[index] = value;
        onChange(newOfferings);
    };

    const handleAddOffering = () => {
        onChange([...offerings, '']);
    };

    const handleRemoveOffering = (index: number) => {
        const newOfferings = offerings.filter((_, i) => i !== index);
        onChange(newOfferings);
    };

    return (
        <div style={{ padding: '1rem', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '8px', marginTop: '1rem' }}>
            <label style={{ opacity: 1, fontWeight: 600, color: 'var(--color-neon-green)' }}>Service Offerings (Bullet Points)</label>
            {offerings.map((offering, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', marginTop: '10px' }}>
                    <input
                        type="text"
                        value={offering}
                        onChange={(e) => handleOfferingChange(index, e.target.value)}
                        placeholder={`Offering #${index + 1}`}
                        style={{ flexGrow: 1 }}
                    />
                    <button type="button" onClick={() => handleRemoveOffering(index)} className={adminStyles.dangerButton} style={{ width: 'auto', padding: '0.5rem' }}>
                        <FaMinus />
                    </button>
                </div>
            ))}
            <button type="button" onClick={handleAddOffering} className={formStyles.uploadButton} style={{ width: 'auto', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaPlus /> Add Offering
            </button>
        </div>
    );
};


const ServicesCMS = () => {
    const [content, setContent] = useState<ServicesContent>(initialServiceData);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, 'cms', 'services_page');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const fetchedData = docSnap.data();
                    
                    // FIX: Explicitly typed 'fSvc' as ServiceOffering to resolve the TypeScript error 7006.
                    const mergedServices = initialServiceData.services.map(initialSvc => {
                        const existingSvc = fetchedData.services?.find((fSvc: ServiceOffering) => fSvc.id === initialSvc.id);
                        return existingSvc ? { ...initialSvc, ...existingSvc } : initialSvc;
                    });
                    
                    setContent({ 
                        ...initialServiceData, 
                        ...fetchedData, 
                        services: mergedServices 
                    } as ServicesContent); 
                } else {
                    await setDoc(docRef, initialServiceData);
                    setContent(initialServiceData);
                }
            } catch (_err: unknown) { 
                console.error("Error fetching Services CMS:", _err);
                setError('Failed to load Services CMS content.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []); 

    // --- Handlers (Content is the same) ---
    const handleHeroChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContent(prev => ({ ...prev, [name]: value }));
        setSuccess('');
        setError('');
    };

    const handleServiceChange = (serviceId: string, field: 'title' | 'description', value: string) => {
        setContent(prev => ({
            ...prev,
            services: prev.services.map(svc =>
                svc.id === serviceId ? { ...svc, [field]: value } : svc
            )
        }));
        setSuccess('');
        setError('');
    };

    const handleOfferingsChange = (serviceId: string, newOfferings: string[]) => {
        setContent(prev => ({
            ...prev,
            services: prev.services.map(svc =>
                svc.id === serviceId ? { ...svc, offerings: newOfferings.filter(o => o.trim() !== '') } : svc
            )
        }));
        setSuccess('');
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const docRef = doc(db, 'cms', 'services_page');
            
            // Clean up offerings and ensure unique IDs
            const cleanedContent = {
                ...content,
                services: content.services.map(svc => ({
                    ...svc,
                    id: svc.id || Math.random().toString(36).substring(2, 9), 
                    offerings: svc.offerings.filter(o => o.trim() !== '') 
                }))
            };

            await setDoc(docRef, cleanedContent, { merge: true });

            setContent(cleanedContent);
            setSuccess('Services Page content updated successfully!');

        } catch (err: unknown) {
            console.error('Failed to save Services CMS content. Check console.', err); 
            setError('Failed to save Services CMS content. Check console.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className={adminStyles.loading}>Loading Services CMS...</div>;
    }

    return (
        <form className={formStyles.formSection} onSubmit={handleSubmit}>
            <h2>Services Page Content Management</h2>

            {/* --- Hero Section --- */}
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-neon-light)' }}>Page Hero Section</h3>
            <div className={formStyles.formGrid}>
                <div className={formStyles.fullWidth}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="heroHeadline">Hero Headline (Our Digital Engineering Services)</label>
                        <input type="text" id="heroHeadline" name="heroHeadline" value={content.heroHeadline} onChange={handleHeroChange} required />
                    </div>
                </div>
                <div className={formStyles.fullWidth}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="heroSubheadline">Hero Subheadline (Transforming Complex Ideas...)</label>
                        <textarea id="heroSubheadline" name="heroSubheadline" value={content.heroSubheadline} onChange={handleHeroChange} required />
                    </div>
                </div>
                {/* NAYA FIELD: Button Text */}
                 <div className={formStyles.fullWidth}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="heroButtonText">Hero Button Text (Explore Our Services)</label>
                        <input type="text" id="heroButtonText" name="heroButtonText" value={content.heroButtonText} onChange={handleHeroChange} required />
                    </div>
                </div>
            </div>

            <hr className={adminStyles.divider} />
            
            {/* --- Individual Services --- */}
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '2rem', color: 'var(--color-neon-light)' }}>Individual Services ({content.services.length} Services)</h3>

            {content.services.map((service, index) => (
                <div key={service.id} style={{ border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', backgroundColor: 'var(--color-deep-blue)' }}>
                    <h4 style={{ color: 'var(--color-neon-green)', marginBottom: '1.5rem' }}>Service #{index + 1}: {service.title || 'Untitled'}</h4>

                    <div className={formStyles.formGrid}>
                        {/* Service Title */}
                        <div className={formStyles.fullWidth}>
                            <div className={formStyles.formGroup}>
                                <label>Title</label>
                                <input 
                                    type="text" 
                                    value={service.title} 
                                    onChange={(e) => handleServiceChange(service.id, 'title', e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Service Description */}
                        <div className={formStyles.fullWidth}>
                            <div className={formStyles.formGroup}>
                                <label>Description</label>
                                <textarea 
                                    value={service.description} 
                                    onChange={(e) => handleServiceChange(service.id, 'description', e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>
                        
                        {/* Service Offerings (Bullet Points) */}
                        <div className={formStyles.fullWidth}>
                            <OfferingsEditor 
                                offerings={service.offerings} 
                                onChange={(newOfferings) => handleOfferingsChange(service.id, newOfferings)} 
                            />
                        </div>
                    </div>
                </div>
            ))}


            {/* Response Messages */}
            {error && <p className={formStyles.errorMessage}>{error}</p>}
            {success && <p className={formStyles.successMessage}>{success}</p>}

            {/* Save Button */}
            <button
                type="submit"
                className={formStyles.saveButton}
                disabled={isSubmitting || isLoading}
                style={{ width: '100%', marginTop: '3rem' }}
            >
                {isSubmitting ? 'Saving Services...' : 'Save All Services Content'}
            </button>
        </form>
    );
};

export default ServicesCMS;