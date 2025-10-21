// app/new-project/page.tsx

"use client";

import { useState, useEffect } from 'react';
import styles from './new-project.module.css';
import { useAuth } from '../../context/AuthContext';

// Firebase se zaroori functions import kiye
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Form data ke structure ko update kiya
interface FormData {
  fullName: string;
  email: string;
  companyName: string;
  projectType: string;
  country: string;
  description: string;
  budget: string;
}

// Countries aur unki currency ka map
const countryCurrencyMap: { [key: string]: string } = {
  'India': '₹',
  'United States': '$',
  'United Kingdom': '£',
  'Europe': '€',
  'Australia': 'A$',
  'Canada': 'C$',
};

const NewProjectPage = () => {
  const { currentUser } = useAuth(); // Logged-in user ki details li
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    companyName: '',
    projectType: 'Mobile App',
    country: 'India', // Default country
    description: '',
    budget: '',
  });

  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Logged-in user ka data form mein auto-fill karne ke liye
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.displayName || '',
        email: currentUser.email || '',
      }));
    }
  }, [currentUser]);
  
  // Jab bhi country badle, currency symbol update karo
  useEffect(() => {
    setCurrencySymbol(countryCurrencyMap[formData.country] || '$');
  }, [formData.country]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName === '' || formData.email === '' || formData.description === '') {
      alert('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // Submit hone wale data mein userId add kiya
      const submissionData: any = {
        ...formData,
        submittedAt: serverTimestamp(),
        status: 'Pending', // Shuruaati status 'Pending' rakha
      };

      if (currentUser) {
        submissionData.userId = currentUser.uid; // Agar user logged in hai to uski ID save karo
      }

      await addDoc(collection(db, 'project_requests'), submissionData);

      setSuccessMessage('Your project request has been submitted successfully! We will get back to you soon.');
      
      setFormData({
        fullName: '',
        email: '',
        companyName: '',
        projectType: 'Mobile App',
        country: 'India',
        description: '',
        budget: '',
      });
      
    } catch (error) {
      console.error("Error submitting project request: ", error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.formContainer}>
        <h1>Start a New Project</h1>
        <p>Tell us about your idea, and we'll get in touch to discuss how we can bring it to life.</p>
        
        <form onSubmit={handleSubmit} className={styles.projectForm}>
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Full Name *</label>
            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email *</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="companyName">Company Name (Optional)</label>
            <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="projectType">Project Type</label>
            <select id="projectType" name="projectType" value={formData.projectType} onChange={handleChange}>
              <option>Mobile App</option>
              <option>Web Application</option>
              <option>Custom Software</option>
              <option>UI/UX Design</option>
              <option>Other</option>
            </select>
          </div>

          {/* Country ka dropdown */}
          <div className={styles.formGroup}>
            <label htmlFor="country">Country</label>
            <select id="country" name="country" value={formData.country} onChange={handleChange}>
              {Object.keys(countryCurrencyMap).map(country => (
                <option key={country}>{country}</option>
              ))}
              <option>Other</option>
            </select>
          </div>

          {/* Budget ka field */}
          <div className={styles.formGroup}>
            <label htmlFor="budget" className={styles.budgetLabel}>
              Estimated Budget <span className={styles.currencySymbol}>({currencySymbol})</span>
            </label>
            <input type="text" id="budget" name="budget" value={formData.budget} onChange={handleChange} placeholder="e.g., 5,00,000" />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="description">Project Description *</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
          </div>
          
          {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Project Request'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default NewProjectPage;