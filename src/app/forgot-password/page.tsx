// src/app/forgot-password/page.tsx

"use client";

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase';

// Hum login page ka CSS hi re-use karenge
import styles from '../login/login.module.css';

const ForgotPasswordPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // Success message ke liye naya state

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            // Firebase ka password reset function call kiya
            await sendPasswordResetEmail(auth, email);
            
            setSuccess("Success! A password reset link has been sent to your email.");
            
        } catch (authError: unknown) { 
            console.error("Forgot Password Error:", authError);
            const errorMsg = String(authError);
            if (errorMsg.includes('auth/invalid-email') || errorMsg.includes('auth/user-not-found')) {
                setError('Could not find a user with that email address.');
            } else {
                setError('Failed to send reset email. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.formContainer}>
                <h1>Reset Password</h1>
                <p>Enter your email address and we&apos;ll send you a link to reset your password.</p>

                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    
                    {error && <p className={styles.errorText}>{error}</p>}
                    {/* Naya success message */}
                    {success && <p className={styles.successMessage}>{success}</p>} 
                    
                    {/* Success message dikhne par form hide kar do */}
                    {!success && (
                        <>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address *</label>
                                <input 
                                    type="email" id="email" name="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    disabled={isSubmitting}
                                />
                            </div>
                            
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </>
                    )}
                </form>
                
                <p className={styles.signupLink}>
                    Remembered your password? <Link href="/login">Back to Login</Link>
                </p>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;