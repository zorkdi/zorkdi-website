// src/app/layout.tsx

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { AuthProvider } from "../context/AuthContext";
import FloatingActionButtons from "../components/FloatingActionButtons/FloatingActionButtons"; 

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
  heroBackgroundURL?: string; 
  defaultHeroBackground?: string; 
}

// Default/Fallback settings (FIX: Hero URL yahan se hata diya gaya hai)
const defaultSettings: GlobalSettings = {
    websiteTitle: "ZORK DI - Custom Tech Solutions",
    websiteTagline: "We transform your ideas into high-performance applications, websites, and software.",
    googleAnalyticsId: "G-XXXXXXXXXX", 
    googleSearchConsoleId: "", 
    heroBackgroundURL: "", 
    defaultHeroBackground: "", // defaultHeroBackground ko empty rakha
};

// Function to fetch ALL Global Settings from Firestore
async function getGlobalSettings(): Promise<GlobalSettings> {
    // FIX 1: Next.js caching options (cacheOptions) ko remove kiya
    // const cacheOptions = { next: { revalidate: 3600 } }; // REMOVED
    
    try {
        const docRef = doc(db, 'cms', 'global_settings');
        // FIX 2: getDoc se cacheOptions argument ko hata diya
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
  
  // FIX 3: Hero Background URL ko CSS variable mein inject kiya
  // agar URL hai, toh usko `url('...')` format mein set karo, agar nahi hai toh empty string set karo
  const heroBackground = globalSettings.heroBackgroundURL 
    ? `url('${globalSettings.heroBackgroundURL}')` 
    : ''; // Empty string means CSS variable will fall back to `globals.css` value
    
  // Agar heroBackground empty string hai, toh yeh variable browser ko nahi bheja jayega, 
  // aur `globals.css` ki default value kaam karegi.
  const customCssVars = {
      '--hero-bg-image': heroBackground,
  };

  return (
    <html lang="en">
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

      {/* FIX 4: Body tag par CSS variable inject kiya, jisse Hero Background set ho jaye */}
      {/* Agar heroBackground empty string hai, toh yeh style prop mein nahi jayega, aur globals.css ki default value apply ho jayegi. */}
      <body className={poppins.className} style={heroBackground ? (customCssVars as React.CSSProperties) : undefined}>
        <AuthProvider>
          
          <Header />
          {children}
          <Footer />
          <FloatingActionButtons />
        </AuthProvider>
      </body>
    </html>
  );
}