// src/app/layout.tsx

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { AuthProvider } from "../context/AuthContext";
import FloatingChatButton from "../components/FloatingChatButton/FloatingChatButton"; 

// Firebase imports for metadata and marketing settings fetch
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Interface for Global Settings 
interface GlobalSettings {
  websiteTitle: string;
  websiteTagline: string;
  googleAnalyticsId?: string; 
  googleSearchConsoleId?: string; 
}

// Default/Fallback settings
const defaultSettings: GlobalSettings = {
    websiteTitle: "ZORK DI - Custom Tech Solutions",
    websiteTagline: "We transform your ideas into high-performance applications, websites, and software.",
    googleAnalyticsId: "G-XXXXXXXXXX", 
    googleSearchConsoleId: "", 
};

// Function to fetch ALL Global Settings from Firestore
async function getGlobalSettings(): Promise<GlobalSettings> {
    try {
        const docRef = doc(db, 'cms', 'global_settings');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...defaultSettings,
                ...data,
            } as GlobalSettings;
        } else {
            return defaultSettings;
        }
    } catch (error) {
        console.error("Server-side fetching error for global settings:", error);
        return defaultSettings; 
    }
}

// --- Next.js Metadata Function ---
export async function generateMetadata(): Promise<Metadata> {
    const globalSettings = await getGlobalSettings();
    
    // FIX: Verification meta tag ko correct Next.js Metadata format mein set karna
    // Yeh "google-site-verification" property ko "google" key ke andar string value expect karta hai.
    const verificationMeta = globalSettings.googleSearchConsoleId 
        ? { google: globalSettings.googleSearchConsoleId } 
        : {};

    return {
        title: globalSettings.websiteTitle,
        description: globalSettings.websiteTagline,
        verification: verificationMeta, 
    };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global settings ko fetch kiya
  const globalSettings = await getGlobalSettings();
  const gaId = globalSettings.googleAnalyticsId;

  return (
    <html lang="en">
      {/* Head mein GSC meta tag "generateMetadata" se automatic aa jayega */}
      
      {/* Google Analytics Script (GA4) */}
      {gaId && gaId !== 'G-XXXXXXXXXX' && (
        <>
          <Script 
            strategy="afterInteractive" 
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} 
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      <body className={poppins.className}>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
          
          {/* Floating Chat Button */}
          <FloatingChatButton />
        </AuthProvider>
      </body>
    </html>
  );
}