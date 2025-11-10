// src/app/login/page.tsx

"use client";

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';

import styles from './login.module.css';

interface LoginForm {
    email: string;
    password: string;
}

const initialFormState: LoginForm = {
    email: '',
    password: '',
};

const LoginPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginForm>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            setError("Please enter both email and password.");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // 1. Sign in user with Firebase Authentication
            await signInWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            
            // 2. Redirect to dashboard or home page (AuthContext handles profile fetch)
            router.push('/my-projects'); // Project tracking page par redirect kiya
            
        } catch (authError: unknown) { 
            console.error("Login Error:", authError);
            
            // FIX: Errors theek karne ke liye direct message check ya type assertion ko minimize kiya.
            const errorMsg = String(authError);
            if (errorMsg.includes('auth/invalid-email') || errorMsg.includes('auth/user-not-found') || errorMsg.includes('auth/wrong-password')) {
                setError('Invalid email or password.');
            } else if (errorMsg.includes('auth/too-many-requests')) {
                setError('Access blocked due to too many failed login attempts. Try again later.');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.formContainer}>
                <h1>Welcome Back</h1>
                <p>Log in to manage your projects and chat with support.</p>

                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    
                    {error && <p className={styles.errorText}>{error}</p>}
                    
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
                        <label htmlFor="password">Password *</label>
                        <input 
                            type="password" id="password" name="password" 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            required 
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    {/* === YAHAN NAYA LINK ADD KIYA GAYA HAI === */}
                    <div className={styles.forgotPasswordLink}>
                        <Link href="/forgot-password">Forgot Password?</Link>
                    </div>
                    
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Logging In...' : 'Login'}
                    </button>
                </form>
                
                <p className={styles.signupLink}>
                    Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
                </p>
            </div>
        </main>
    );
};

export default LoginPage;