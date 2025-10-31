// src/app/signup/page.tsx

"use client";

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

import styles from './signup.module.css';

interface SignupForm {
    fullName: string;
    email: string;
    password: string;
}

const initialFormState: SignupForm = {
    fullName: '',
    email: '',
    password: '',
};

const SignupPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<SignupForm>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password.length < 6) {
            setError("Password should be at least 6 characters long.");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // 1. Create User in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            
            const user = userCredential.user;
            
            // 2. Save User Profile to Firestore /users collection
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                fullName: formData.fullName,
                email: formData.email,
                photoURL: user.photoURL || '', // Empty photo URL initially
                mobile: '',
                country: 'USA', // Default country
                createdAt: new Date().toISOString(),
            });

            // 3. Redirect to profile or home page
            router.push('/profile');
            
        } catch (authError: unknown) { 
            console.error("Signup Error:", authError);
            
            // FIX: Error code access ke liye type guard use kiya
            const errorMsg = String(authError);
            if (errorMsg.includes('auth/email-already-in-use')) {
                setError('This email is already in use. Please Login.');
            } else if (errorMsg.includes('auth/invalid-email')) {
                setError('The email address is invalid.');
            } else {
                setError('Signup failed. Please check your details and try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.formContainer}>
                <h1>Create Account</h1>
                <p>Join the ZORK DI platform to start your projects.</p>

                <form className={styles.signupForm} onSubmit={handleSubmit}>
                    
                    {error && <p className={styles.errorText}>{error}</p>}
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="fullName">Full Name *</label>
                        <input 
                            type="text" id="fullName" name="fullName" 
                            value={formData.fullName} 
                            onChange={handleInputChange} 
                            required 
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address *</label>
                        <input 
                            type="email" id="email" name="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            required 
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password (min 6 chars) *</label>
                        <input 
                            type="password" id="password" name="password" 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            required 
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                
                <p className={styles.loginLink}>
                    Already have an account? <Link href="/login">Login</Link>
                </p>
            </div>
        </main>
    );
};

export default SignupPage;