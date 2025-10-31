// app/new-project/page.tsx

"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // REMOVED: Unused import
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import styles from './new-project.module.css';

// Country aur currency ki mapping
const countryCurrencyMap: { [key: string]: { symbol: string, name: string } } = {
  "USA": { symbol: "$", name: "USD" },
  "India": { symbol: "₹", name: "INR" }, 
  "Canada": { symbol: "C$", name: "CAD" },
  "UK": { symbol: "£", name: "GBP" },
  "Eurozone": { symbol: "€", name: "EUR" },
  "Other": { symbol: "", name: "Currency" },
};

const countries = ['USA', 'India', 'Canada', 'UK', 'Eurozone', 'Other'];
const serviceOptions = ['Web App', 'Mobile App', 'UI/UX Design', 'Custom Software', 'Consulting', 'Other'];
const timelineOptions = ['1-3 Weeks', '1-3 Months', '3-6 Months', '6+ Months'];

// Interface for form data
interface ProjectForm {
    title: string;
    serviceType: string;
    otherServiceType: string; 
    budget: string; 
    country: string; 
    timeline: string;
    description: string;
    clientName: string;
    clientEmail: string;
    mobile: string;
}

const initialFormState: ProjectForm = {
    title: '',
    serviceType: serviceOptions[0],
    otherServiceType: '', 
    budget: '5000', 
    country: countries[0],
    timeline: timelineOptions[1],
    description: '',
    clientName: '',
    clientEmail: '',
    mobile: '',
};

const NewProjectPage = () => {
    const { currentUser, userProfile, loading: authLoading } = useAuth();
    // const router = useRouter(); // REMOVED: Unused variable
    
    const [formData, setFormData] = useState<ProjectForm>(initialFormState);
    const [currencyInfo, setCurrencyInfo] = useState(countryCurrencyMap[initialFormState.country]); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    // Pre-fill form data with user profile details
    useEffect(() => {
        if (userProfile) {
            setFormData(prev => ({
                ...prev,
                clientName: userProfile.fullName || '',
                clientEmail: userProfile.email || '',
                mobile: userProfile.mobile || '',
                country: userProfile.country || initialFormState.country,
            }));
        } else if (!currentUser && !authLoading) {
             setFormData(initialFormState);
        }
    }, [userProfile, currentUser, authLoading]);
    
    // Currency change logic
    useEffect(() => {
        setCurrencyInfo(countryCurrencyMap[formData.country] || countryCurrencyMap['USA']);
    }, [formData.country]);


    // Handle input change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccessMessage('');
    };

    // Form Submission Logic
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentUser) {
            setError("You must be logged in to submit a project request.");
            return;
        }

        // --- Validation ---
        if (!formData.title || !formData.description || !formData.clientName || !formData.clientEmail || !formData.budget) {
            setError("Please fill in all required fields (Title, Description, Name, Email, Budget).");
            return;
        }
        
        // Agar "Other" service type chuna hai, toh otherServiceType field ko bhi check karo
        if (formData.serviceType === 'Other' && !formData.otherServiceType.trim()) {
            setError("Please elaborate on your requirements when selecting &apos;Other&apos; service type.");
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');
        
        try {
            // Final service type
            const finalServiceType = formData.serviceType === 'Other' 
                ? `Other: ${formData.otherServiceType.trim()}` 
                : formData.serviceType;
                
            // Data jo Firestore mein jayega
            const dataToSave = {
                ...formData,
                serviceType: finalServiceType,
                clientId: currentUser.uid, 
                status: 'Pending', 
                createdAt: serverTimestamp(),
            };
            
            await addDoc(collection(db, 'projects'), dataToSave);
            
            setSuccessMessage("Your project request has been successfully submitted! We will contact you shortly.");
            setFormData(initialFormState); // Reset form fields

        } catch (err) {
            console.error("Error submitting project:", err);
            setError("Failed to submit request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Agar Auth loading ho rahi hai, toh loading state dikhao
    if (authLoading) {
        return <div className={styles.main}><div className={styles.loading}>Checking your session...</div></div>;
    }


    return (
        <main className={styles.main}>
            <div className={styles.formContainer}>
                <h1>Start Your Project</h1>
                <p>Tell us about your digital vision. Fill out the details below and we will get back to you within 24 hours.</p>

                {/* Login Prompt */}
                {!currentUser && (
                    <div className={styles.authPrompt}>
                        <p>
                            For easier project tracking: <Link href="/login">Login here</Link> or <Link href="/signup">Sign Up</Link> first!
                        </p>
                    </div>
                )}

                <form className={styles.projectForm} onSubmit={handleSubmit}>
                    
                    {/* Project Title */}
                    <div className={styles.fullWidth}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title">Project Title (e.g., &apos;Custom SaaS Platform&apos;) *</label> 
                            <input 
                                type="text" id="title" name="title" 
                                value={formData.title} 
                                onChange={handleInputChange} 
                                required 
                                disabled={isSubmitting}
                                placeholder="E-commerce Website, iOS App, or Brand Redesign"
                            />
                        </div>
                    </div>
                    
                    {/* Country Selection */}
                    <div className={styles.formGroup}>
                        <label htmlFor="country">Your Country *</label>
                        <select 
                            id="country" name="country" 
                            value={formData.country} 
                            onChange={handleInputChange} 
                            required
                            disabled={isSubmitting}
                        >
                            {countries.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </div>
                    
                    {/* Budget (Manual Input) */}
                    <div className={styles.formGroup}>
                        <label htmlFor="budget">
                            Estimated Budget 
                            {currencyInfo.symbol && <span className={styles.currencySymbol}> ({currencyInfo.symbol})</span>}
                            *
                        </label>
                        <input 
                            type="number" 
                            id="budget" 
                            name="budget" 
                            value={formData.budget} 
                            onChange={handleInputChange} 
                            placeholder={`Please enter amount in ${currencyInfo.name}`}
                            min="0"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    {/* Service Type */}
                    <div className={styles.formGroup}>
                        <label htmlFor="serviceType">Type of Service Required *</label>
                        <select 
                            id="serviceType" name="serviceType" 
                            value={formData.serviceType} 
                            onChange={handleInputChange} 
                            required
                            disabled={isSubmitting}
                        >
                            {serviceOptions.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </div>
                    
                    {/* Timeline */}
                    <div className={styles.formGroup}>
                        <label htmlFor="timeline">Expected Timeline</label>
                         <select 
                            id="timeline" name="timeline" 
                            value={formData.timeline} 
                            onChange={handleInputChange} 
                            disabled={isSubmitting}
                        >
                             {timelineOptions.map(option => (
                                 <option key={option} value={option}>{option}</option>
                             ))}
                        </select>
                    </div>
                    
                    {/* Other Service Type Input Field */}
                    {formData.serviceType === 'Other' && (
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label htmlFor="otherServiceType">Please Elaborate on Your Specific Requirement *</label>
                            <input 
                                type="text" id="otherServiceType" name="otherServiceType" 
                                value={formData.otherServiceType} 
                                onChange={handleInputChange} 
                                required={formData.serviceType === 'Other'} 
                                disabled={isSubmitting}
                                placeholder="E.g., Custom AI Integration or VR Development"
                            />
                        </div>
                    )}
                    
                    {/* Client Name */}
                    <div className={styles.formGroup}>
                        <label htmlFor="clientName">Your Full Name *</label>
                        <input 
                            type="text" id="clientName" name="clientName" 
                            value={formData.clientName} 
                            onChange={handleInputChange} 
                            required
                            disabled={!!currentUser || isSubmitting} 
                        />
                    </div>
                    
                    {/* Client Email */}
                    <div className={styles.formGroup}>
                        <label htmlFor="clientEmail">Your Email Address *</label>
                        <input 
                            type="email" id="clientEmail" name="clientEmail" 
                            value={formData.clientEmail} 
                            onChange={handleInputChange} 
                            required
                            disabled={!!currentUser || isSubmitting} 
                        />
                    </div>
                    
                    {/* Mobile */}
                    <div className={styles.formGroup}>
                        <label htmlFor="mobile">Mobile Number</label>
                        <input 
                            type="tel" id="mobile" name="mobile" 
                            value={formData.mobile} 
                            onChange={handleInputChange} 
                            disabled={!!currentUser || isSubmitting} 
                        />
                    </div>
                    
                    {/* Description */}
                    <div className={styles.fullWidth}>
                        <div className={styles.formGroup}>
                            <label htmlFor="description">Detailed Project Description *</label>
                            <textarea 
                                id="description" name="description" 
                                rows={6}
                                value={formData.description} 
                                onChange={handleInputChange} 
                                required 
                                disabled={isSubmitting}
                                placeholder="Describe your product's features, target audience, and key requirements."
                            />
                        </div>
                    </div>

                    {/* Response Messages */}
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {successMessage && <p className={styles.successMessage}>{successMessage}</p>}


                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting || !currentUser}
                    >
                        {isSubmitting ? 'Submitting Request...' : (currentUser ? 'Submit Project Request' : 'Login to Submit')}
                    </button>
                    
                    {!currentUser && <p style={{gridColumn: '1 / -1', textAlign: 'center', opacity: 0.8}}>Please log in to enable the submit button.</p>}
                </form>
            </div>
        </main>
    );
};

export default NewProjectPage;