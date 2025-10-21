"use client"; // Form ko interactive banane ke liye

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // User ko redirect karne ke liye
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase'; // Hamari firebase.ts file se auth import kiya
import styles from './login.module.css';
import Link from 'next/link';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Firebase ka function use karke user ko login karein
      await signInWithEmailAndPassword(auth, email, password);
      // Safal hone par user ko homepage par bhej dein
      router.push('/');
    } catch (firebaseError: any) {
      // Firebase se aaye error ko aasan bhasha mein dikhayein
      setError('Invalid email or password. Please try again.');
      console.error("Firebase login error:", firebaseError);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.formContainer}>
        <h1>Welcome Back!</h1>
        <p>Log in to your ZORK DI account.</p>
        
        <form onSubmit={handleLogin} className={styles.loginForm}>
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

          {error && <p className={styles.errorText}>{error}</p>}
          
          <button type="submit" className={styles.submitButton}>Log In</button>
        </form>

        <p className={styles.signupLink}>
          Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;