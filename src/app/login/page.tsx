// src/app/login/page.tsx

"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
// Firebase Imports
import { 
    signInWithPopup, 
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    ConfirmationResult,
    sendPasswordResetEmail,
    fetchSignInMethodsForEmail,
    User
} from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from 'firebase/firestore';
import { auth, db } from '@/firebase';

// Icons
import { FcGoogle } from "react-icons/fc";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";

import styles from './login.module.css';

// Types
type AuthMode = 'email' | 'phone';
type FlowType = 'login' | 'signup' | null;

interface FirebaseError {
    code?: string;
    message?: string;
}

export default function LoginPage() {
    const router = useRouter();

    // --- State Variables ---
    const [countryCode, setCountryCode] = useState('+91'); 
    const [inputValue, setInputValue] = useState(''); 
    
    // UI Control
    const [isPhoneDetected, setIsPhoneDetected] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Toggle Password Visibility
    
    // Final processing
    const [finalIdentity, setFinalIdentity] = useState(''); 
    const [authMode, setAuthMode] = useState<AuthMode>('email'); 
    
    // Flow Control
    const [step, setStep] = useState(1);
    const [flowType, setFlowType] = useState<FlowType>(null); 
    const [loading, setLoading] = useState(false);
    
    // Inputs
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => {}
                });
            } catch (e) {
                console.error("Recaptcha Init Error", e);
            }
        }
    }, []);

    // --- SMART DETECTION HANDLER ---
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        // Regex: Check if starts with a digit (0-9) or '+'
        const isDigitStart = /^[0-9+]/.test(val);
        
        if (isDigitStart && val.length > 0) {
            setIsPhoneDetected(true);
        } else {
            setIsPhoneDetected(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userDocRef);

            if (!userSnap.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    fullName: user.displayName || 'User',
                    email: user.email,
                    phone: '',
                    photoURL: user.photoURL || '',
                    createdAt: new Date().toISOString(),
                    authProvider: 'google'
                });
            }
            // CHANGE: Redirect to Home instead of Profile
            router.push('/'); 

        } catch (error: unknown) {
            const err = error as FirebaseError;
            console.error("Google Auth Error:", err);
            setError("Google Sign-In failed. Please try again.");
            setLoading(false);
        }
    };

    const handleContinue = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const rawValue = inputValue.trim();
        if (!rawValue) {
            setError("Please enter your email or phone number.");
            return;
        }

        setLoading(true);

        let detectedType: AuthMode = 'email';
        let processedIdentity = rawValue;

        // Validation logic
        if (rawValue.includes('@') || /[a-zA-Z]/.test(rawValue)) {
            detectedType = 'email';
            processedIdentity = rawValue.toLowerCase(); 
        } else {
            detectedType = 'phone';
            if (rawValue.startsWith('+')) {
                processedIdentity = rawValue; 
            } else {
                processedIdentity = `${countryCode}${rawValue}`; 
            }
        }

        setAuthMode(detectedType);
        setFinalIdentity(processedIdentity);

        try {
            let userExists = false;

            // 1. Check Firestore Database First
            if (detectedType === 'email') {
                const q = query(collection(db, 'users'), where('email', '==', processedIdentity));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) userExists = true;
                
                // Fallback: Check Auth System
                if (!userExists) {
                     const methods = await fetchSignInMethodsForEmail(auth, processedIdentity);
                     if (methods.length > 0) userExists = true;
                }
            } else {
                // Phone check
                const q = query(collection(db, 'users'), where('phone', '==', processedIdentity));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) userExists = true;
            }

            // 2. Set Flow Type based on Existence
            if (userExists) {
                setFlowType('login'); // User found -> Login
                if (detectedType === 'phone') await sendOtp(processedIdentity);
            } else {
                setFlowType('signup'); // User not found -> Create Account
            }
            setStep(2); 

        } catch (err) {
            console.error("Check Error:", err);
            setError("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async (phoneNumber: string) => {
        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            setSuccess(`OTP sent to ${phoneNumber}`);
        } catch (error: unknown) {
            const err = error as FirebaseError;
            if (err.code === 'auth/invalid-phone-number') {
                setError("Invalid phone number.");
                setStep(1);
            } else {
                setError("Failed to send OTP. Try again.");
            }
        }
    };

    const handleFinalSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (flowType === 'login') {
                // --- LOGIN FLOW ---
                if (authMode === 'email') {
                    await signInWithEmailAndPassword(auth, finalIdentity, password);
                    // CHANGE: Redirect to Home instead of Profile
                    router.push('/');
                } else {
                    if (!confirmationResult) throw new Error("No OTP session");
                    await confirmationResult.confirm(otp);
                    // CHANGE: Redirect to Home instead of Profile
                    router.push('/');
                }
            } else {
                // --- SIGNUP FLOW ---
                if (!fullName) {
                    setError("Please enter your full name.");
                    setLoading(false);
                    return;
                }
                
                let user: User;

                if (authMode === 'email') {
                    const cred = await createUserWithEmailAndPassword(auth, finalIdentity, password);
                    user = cred.user;
                } else {
                    if (!confirmationResult) {
                        await sendOtp(finalIdentity);
                        setLoading(false);
                        return;
                    }
                    const cred = await confirmationResult.confirm(otp);
                    user = cred.user;
                }
                
                // Save User Data to Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    fullName: fullName,
                    email: authMode === 'email' ? finalIdentity : '',
                    phone: authMode === 'phone' ? finalIdentity : '',
                    photoURL: '',
                    createdAt: new Date().toISOString(),
                    authProvider: authMode
                });
                
                // CHANGE: Redirect to Home instead of Profile
                router.push('/');
            }
        } catch (error: unknown) {
            const err = error as FirebaseError;
            console.error("Final Submit Error:", err);
            if (err.code === 'auth/wrong-password') setError("Incorrect password.");
            else if (err.code === 'auth/invalid-verification-code') setError("Invalid OTP.");
            else if (err.code === 'auth/email-already-in-use') {
                setError("Account exists. Please login.");
                setFlowType('login');
            }
            else if (err.code === 'auth/weak-password') setError("Password should be at least 6 characters.");
            else setError("Authentication failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtpForSignup = async () => {
        setLoading(true);
        await sendOtp(finalIdentity);
        setLoading(false);
    };

    const handleForgotPassword = async () => {
        if (authMode !== 'email' || !finalIdentity) return;
        try {
            await sendPasswordResetEmail(auth, finalIdentity);
            setSuccess("Reset link sent to your email.");
        } catch (err) {
            console.error("Forgot Password Error:", err);
            setError("Could not send reset link.");
        }
    };

    const renderStep1 = () => (
        <>
            <h1>Welcome Back</h1>
            <p>Enter details to access your account.</p>

            <form className={styles.authForm} onSubmit={handleContinue}>
                <div className={styles.formGroup}>
                    <label>Email or Phone Number</label>
                    
                    <div className={styles.inputWrapper}>
                        {/* Country Dropdown */}
                        <div className={`${styles.countrySelectWrapper} ${isPhoneDetected ? styles.visible : ''}`}>
                            <select 
                                className={styles.countrySelect}
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                            >
                                <option value="+91">IN +91</option>
                                <option value="+1">US +1</option>
                                <option value="+44">UK +44</option>
                                <option value="+971">AE +971</option>
                                <option value="+1">CA +1</option>
                                <option value="+61">AU +61</option>
                            </select>
                        </div>

                        <input 
                            type="text" 
                            placeholder="name@email.com or 98765..." 
                            value={inputValue}
                            onChange={handleInputChange} 
                            required
                        />
                    </div>
                </div>
                <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={loading}
                >
                    {loading ? 'Checking...' : 'Continue'}
                </button>
            </form>

            <div className={styles.divider}>
                <span>OR</span>
            </div>

            <button 
                type="button" 
                className={styles.googleButton}
                onClick={handleGoogleSignIn}
            >
                <FcGoogle size={24} />
                Continue with Google
            </button>
        </>
    );

    const renderStep2 = () => (
        <>
            <button 
                className={styles.backButton} 
                onClick={() => {setStep(1); setError(''); setSuccess('');}}
            >
                <FaArrowLeft />
            </button>

            <h1>{flowType === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
            <p>
                {flowType === 'login' ? 'Logging in as ' : 'Signing up as '} 
                <span style={{color: 'var(--color-neon-green)', fontWeight: 'bold'}}>
                    {finalIdentity}
                </span>
            </p>

            <form className={styles.authForm} onSubmit={handleFinalSubmit}>
                
                {/* Full Name only for Signup */}
                {flowType === 'signup' && (
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            className={styles.standardInput}
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                )}

                {/* --- PASSWORD FIELD WITH EYE BUTTON --- */}
                {authMode === 'email' ? (
                    <>
                        <div className={styles.formGroup}>
                            <label>
                                {flowType === 'login' ? 'Password' : 'Create Password'}
                            </label>
                            
                            {/* NEW: Password Wrapper */}
                            <div className={styles.passwordInputWrapper}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className={styles.standardInput}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                {/* NEW: Eye Button */}
                                <button 
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        
                        {flowType === 'login' && (
                            <div className={styles.forgotPassword}>
                                <button type="button" onClick={handleForgotPassword}>
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    // --- OTP MODE ---
                    <>
                        {flowType === 'signup' && !confirmationResult && (
                            <button 
                                type="button"
                                className={styles.submitButton}
                                onClick={handleSendOtpForSignup}
                                disabled={loading}
                                style={{
                                    background: 'var(--color-deep-blue)', 
                                    border: '1px solid var(--color-neon-green)', 
                                    color: 'var(--color-neon-green)'
                                }}
                            >
                                {loading ? 'Sending...' : 'Get OTP'}
                            </button>
                        )}

                        {(flowType === 'login' || confirmationResult) && (
                            <div className={styles.formGroup}>
                                <label>Enter OTP</label>
                                <input 
                                    type="text" 
                                    className={styles.standardInput}
                                    placeholder="123456"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Submit Button */}
                {(authMode === 'email' || (authMode === 'phone' && (flowType === 'login' || confirmationResult))) && (
                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (flowType === 'login' ? 'Login' : 'Create Account')}
                    </button>
                )}

            </form>
        </>
    );

    return (
        <main className={styles.main}>
            {/* --- ADDED: Background Video & Overlay --- */}
            <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className={styles.videoBackground}
            >
                {/* IMPORTANT: Keep a video file with this name in your public/videos folder */}
                <source src="/videos/login-bg.mp4" type="video/mp4" />
            </video>
            <div className={styles.videoOverlay}></div>
            
            {/* Main Form Card */}
            <div className={styles.formContainer}>
                <div id="recaptcha-container"></div>
                {error && <div className={styles.errorText}>{error}</div>}
                {success && <div className={styles.successText}>{success}</div>}
                {step === 1 ? renderStep1() : renderStep2()}
            </div>
        </main>
    );
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}