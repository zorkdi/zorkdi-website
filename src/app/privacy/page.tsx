// src/app/privacy/page.tsx

import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ZORK DI Shield",
  description: "Privacy Policy and Data Safety Standards for ZORK DI Retailer & Shield App",
};

export default function PrivacyPolicy() {
  return (
    <main style={{ 
        backgroundColor: 'var(--color-dark-navy)', 
        color: 'var(--color-off-white)', 
        minHeight: '100vh', 
        paddingTop: '120px', 
        paddingBottom: '80px',
        paddingLeft: '20px',
        paddingRight: '20px',
        fontFamily: 'var(--font-inter)'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            marginBottom: '10px',
            background: 'linear-gradient(90deg, #fff, #c4b5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
          Privacy Policy
        </h1>
        <p style={{ opacity: 0.7, marginBottom: '40px' }}>Last Updated: January 28, 2026</p>

        {/* Content Section */}
        <div style={{ lineHeight: '1.8', fontSize: '1.05rem', opacity: 0.9 }}>
          
          <p style={{ marginBottom: '20px' }}>
            Welcome to <strong>ZORK DI Shield & Retailer App</strong>. We are committed to protecting the privacy and security of our users and their customers. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application ("App") and services.
          </p>

          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '30px 0' }} />

          <h2 style={{ color: 'var(--color-neon-green)', marginTop: '30px', marginBottom: '15px' }}>1. Information We Collect</h2>
          <p>To provide our device security and finance locking services, we require specific permissions and data from the device:</p>
          
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}>
              <strong>Device Identifiers (IMEI/Serial):</strong> We collect your device's IMEI number to uniquely identify the device in our database for loan locking and EMI management purposes.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Location Data (Background & Foreground):</strong> <br/>
              <span style={{ color: '#FFD700' }}>Important:</span> Our app collects location data to enable <strong>device recovery and asset tracking</strong> even when the app is closed or not in use. This is essential to recover the device in case of EMI default or theft.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Camera & Images:</strong> We use the camera to capture customer photos for profile verification during the device registration process.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Phone Numbers & SIM Info:</strong> We detect SIM card changes to prevent unauthorized ownership transfer of the financed device.
            </li>
          </ul>

          <h2 style={{ color: 'var(--color-neon-green)', marginTop: '30px', marginBottom: '15px' }}>2. How We Use Your Data</h2>
          <p>The data collected is strictly used for the following purposes:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px', marginBottom: '20px' }}>
            <li>To lock/unlock devices based on EMI payment status.</li>
            <li>To track lost or stolen devices using GPS.</li>
            <li>To verify customer identity and prevent fraud.</li>
            <li>To prevent unauthorized factory resets or software tampering.</li>
          </ul>

          <h2 style={{ color: 'var(--color-neon-green)', marginTop: '30px', marginBottom: '15px' }}>3. Device Administrator Permission</h2>
          <p>
            This app uses the <strong>Device Administrator permission</strong> (BIND_DEVICE_ADMIN). This is a core security feature required to prevent the app from being uninstalled unauthorizedly 
            while a loan is active. This permission allows the app to:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px', marginBottom: '20px' }}>
            <li>Disable Factory Reset.</li>
            <li>Block USB Data Transfer (ADB).</li>
            <li>Lock the screen remotely.</li>
          </ul>

          <h2 style={{ color: 'var(--color-neon-green)', marginTop: '30px', marginBottom: '15px' }}>4. Data Security</h2>
          <p>
            We implement industry-standard encryption protocols (SSL/TLS) to protect your data during transmission. Your personal data is stored securely on 
            Google Firebase servers with restricted access. We do not sell your personal data to third-party advertisers.
          </p>

          <h2 style={{ color: 'var(--color-neon-green)', marginTop: '30px', marginBottom: '15px' }}>5. Account Deletion</h2>
          <p>
            Since accounts are created manually by the Administrator for Enterprise use, users cannot delete their account directly from the app. 
            If you wish to delete your data or discontinue the service, please contact us at the support email below, and we will process your request within 7 days.
          </p>

          <h2 style={{ color: 'var(--color-neon-green)', marginTop: '30px', marginBottom: '15px' }}>6. Contact Us</h2>
          <p>If you have any questions regarding this privacy policy, please contact us:</p>
          <p style={{ marginTop: '10px', color: '#fff' }}>
            <strong>Email:</strong> zorkdiofficial@gmail.com<br/>
            <strong>Website:</strong> www.zorkdi.in
          </p>

        </div>
      </div>
    </main>
  );
}