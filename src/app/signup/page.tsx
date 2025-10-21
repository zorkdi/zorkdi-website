"use client"; // Form ko interactive banane ke liye

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // User ko redirect karne ke liye
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase'; // Hamari firebase.ts file se auth import kiya
import styles from './signup.module.css';
import Link from 'next/link';

const SignupPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Har baar shuru mein error ko reset karein

    // Check karein ki password match ho rahe hain ya nahi
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Firebase ka function use karke naya user banayein
      await createUserWithEmailAndPassword(auth, email, password);
      // Safal hone par user ko homepage par bhej dein
      router.push('/');
    } catch (firebaseError: any) {
      // Firebase se aaye error ko aasan bhasha mein dikhayein
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
      console.error("Firebase signup error:", firebaseError);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.formContainer}>
        <h1>Create an Account</h1>
        <p>Join ZORK DI to manage your projects.</p>
        
        <form onSubmit={handleSignup} className={styles.signupForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}
          
          <button type="submit" className={styles.submitButton}>Sign Up</button>
        </form>

        <p className={styles.loginLink}>
          Already have an account? <Link href="/login">Log In</Link>
        </p>
      </div>
    </main>
  );
};

export default SignupPage;