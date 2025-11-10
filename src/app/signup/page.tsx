// src/app/signup/page.tsx

"use client";

import { useState, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// === YAHAN CHANGE KIYA GAYA HAI ===
import { 
    createUserWithEmailAndPassword, 
    signInWithPhoneNumber, 
    RecaptchaVerifier,
    ConfirmationResult
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

import styles from './signup.module.css';

// Signup method type
type SignupMethod = 'email' | 'phone';

// Email form state
interface EmailForm {
    fullName: string;
    email: string;
    password: string;
}
const initialEmailForm: EmailForm = { fullName: '', email: '', password: '' };

// Phone form state
interface PhoneForm {
    fullName: string;
    phone: string; // Phone number (e.g., +919876543210)
}
const initialPhoneForm: PhoneForm = { fullName: '', phone: '' };

const SignupPage = () => {
    const router = useRouter();
    
    // Naya OTP state
    const [otp, setOtp] = useState('');
    
    // Naye states
    const [method, setMethod] = useState<SignupMethod>('email'); // Default 'email'
    const [step, setStep] = useState(1); // Phone auth ke liye (1 = phone number, 2 = OTP)
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // Form states
    const [emailForm, setEmailForm] = useState<EmailForm>(initialEmailForm);
    const [phoneForm, setPhoneForm] = useState<PhoneForm>(initialPhoneForm);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // Success message ke liye

    // reCAPTCHA setup
    useEffect(() => {
        // Yeh function invisible reCAPTCHA banata hai
        try {
            // Check karo ki verifier pehle se toh nahi bana hua
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                  'size': 'invisible',
                  // === YAHAN CHANGE KIYA GAYA HAI ===
                  'callback': () => {
                    // reCAPTCHA solve ho gaya (optional callback)
                    console.log("reCAPTCHA verified");
                  }
                });
            }
        } catch (e) {
            console.error("reCAPTCHA error:", e);
            setError("Could not initialize reCAPTCHA. Please refresh.");
        }
    }, []); // Yeh sirf ek baar run hoga
    

    const handleEmailInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEmailForm(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handlePhoneInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPhoneForm(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    // --- Email Signup Logic ---
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (emailForm.password.length < 6) {
            setError("Password should be at least 6 characters long.");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                emailForm.email,
                emailForm.password
            );
            const user = userCredential.user;
            
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                fullName: emailForm.fullName, // FullName save kiya
                email: emailForm.email,
                phone: '', // Phone number khaali rakha
                photoURL: user.photoURL || '',
                mobile: '', // mobile field (agar use kar rahe ho)
                country: 'USA',
                createdAt: new Date().toISOString(),
            });

            router.push('/profile');
            
        } catch (authError: unknown) { 
            console.error("Signup Error:", authError);
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
    
    // --- Phone Signup Logic ---
    
    // Step 1: Send OTP
    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!phoneForm.fullName) {
             setError("Please enter your full name.");
             return;
        }
        if (!phoneForm.phone || !/^\+[1-9]\d{1,14}$/.test(phoneForm.phone)) {
            setError("Please enter a valid phone number (e.g., +919876543210).");
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, phoneForm.phone, appVerifier);
            
            setConfirmationResult(confirmation);
            setStep(2); // Step 2 (OTP Entry) par jaao
            setSuccess(`OTP sent to ${phoneForm.phone}. Please check your messages.`);
            
        } catch (err) {
            console.error("OTP Send Error:", err);
            setError("Failed to send OTP. Make sure the phone number is correct and reCAPTCHA is working.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Step 2: Verify OTP and Create Account
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!otp || otp.length !== 6) {
            setError("Please enter the 6-digit OTP.");
            return;
        }
        if (!confirmationResult) {
            setError("Verification failed. Please try sending OTP again.");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const userCredential = await confirmationResult.confirm(otp);
            const user = userCredential.user;
            
            // User ka data Firestore mein save karo
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                fullName: phoneForm.fullName, // Phone form se naam liya
                email: '', // Email khaali rakha
                phone: user.phoneNumber, // Phone number save kiya
                photoURL: user.photoURL || '',
                mobile: user.phoneNumber, // mobile field
                country: 'USA',
                createdAt: new Date().toISOString(),
            });

            router.push('/profile');

        } catch (err) {
            console.error("OTP Verify Error:", err);
            setError("Invalid OTP or verification failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    // Form render logic
    const renderForm = () => {
        if (method === 'phone') {
            
            // Step 2: OTP Form
            if (step === 2) {
                return (
                    <form className={styles.otpForm} onSubmit={handleOtpSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="otp">Enter 6-Digit OTP *</label>
                            <input 
                                type="text" id="otp" name="otp" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)}
                                required 
                                disabled={isSubmitting}
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Verifying...' : 'Verify & Sign Up'}
                        </button>
                    </form>
                );
            }
            
            // Step 1: Phone Form
            return (
                <form className={styles.phoneForm} onSubmit={handlePhoneSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="fullName">Full Name *</label>
                        <input 
                            type="text" id="fullName" name="fullName" 
                            value={phoneForm.fullName} 
                            onChange={handlePhoneInputChange} 
                            required 
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="phone">Phone Number (with country code) *</label>
                        <input 
                            type="tel" id="phone" name="phone" 
                            value={phoneForm.phone} 
                            onChange={handlePhoneInputChange} 
                            required 
                            disabled={isSubmitting}
                            placeholder="e.g., +919876543210"
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </form>
            );
        }
        
        // Default: Email Form
        return (
            <form className={styles.signupForm} onSubmit={handleEmailSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="fullName">Full Name *</label>
                    <input 
                        type="text" id="fullName" name="fullName" 
                        value={emailForm.fullName} 
                        onChange={handleEmailInputChange} 
                        required 
                        disabled={isSubmitting}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address *</label>
                    <input 
                        type="email" id="email" name="email" 
                        value={emailForm.email} 
                        onChange={handleEmailInputChange} 
                        required 
                        disabled={isSubmitting}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password">Password (min 6 chars) *</label>
                    <input 
                        type="password" id="password" name="password" 
                        value={emailForm.password} 
                        onChange={handleEmailInputChange} 
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
        );
    };

    return (
        <main className={styles.main}>
            <div className={styles.formContainer}>
                <h1>Create Account</h1>
                <p>Join the ZORK DI platform to start your projects.</p>
                
                {/* Invisible reCAPTCHA container */}
                <div id="recaptcha-container"></div>

                {/* Method Toggle Buttons */}
                <div className={styles.methodToggle}>
                    <button 
                        className={method === 'email' ? styles.active : ''}
                        onClick={() => { setMethod('email'); setStep(1); setError(''); setSuccess(''); }}
                    >
                        Sign up with Email
                    </button>
                    <button 
                        className={method === 'phone' ? styles.active : ''}
                        onClick={() => { setMethod('phone'); setStep(1); setError(''); setSuccess(''); }}
                    >
                        Sign up with Phone
                    </button>
                </div>

                {error && <p className={styles.errorText}>{error}</p>}
                {success && <p className={styles.successText}>{success}</p>}
                
                {/* Render the correct form based on state */}
                {renderForm()}
                
                <p className={styles.loginLink}>
                    Already have an account? <Link href="/login">Login</Link>
                </p>
            </div>
        </main>
    );
};

// Nayi window property add karne ke liye (TypeScript fix)
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default SignupPage;