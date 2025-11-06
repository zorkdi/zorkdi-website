// src/app/layout.tsx

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { AuthProvider } from "../context/AuthContext";
import FloatingActionButtons from "../components/FloatingActionButtons/FloatingActionButtons"; 
import VisitorTracker from "../components/VisitorTracker/VisitorTracker";
import AnimatedBackground from "../components/AnimatedBackground/AnimatedBackground"; 

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

// Default/Fallback settings
// FIX: Inner single quotes ko escape kiya (\') taaki TypeScript string ko correctly parse kare
const defaultHeroURL = 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'matrix\' values=\'1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.08 0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")';

const defaultSettings: GlobalSettings = {
    websiteTitle: "ZORK DI - Custom Tech Solutions",
    websiteTagline: "We transform your ideas into high-performance applications, websites, and software.",
    googleAnalyticsId: "G-XXXXXXXXXX", 
    googleSearchConsoleId: "", 
    heroBackgroundURL: "", 
    defaultHeroBackground: defaultHeroURL,
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
  
  const heroBackground = globalSettings.heroBackgroundURL 
    ? `url('${globalSettings.heroBackgroundURL}')` 
    : globalSettings.defaultHeroBackground; 
    
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

      <body className={poppins.className} style={customCssVars as React.CSSProperties}>
        <AuthProvider>
          {/* NAYA: Animated Background ko Header se pehle render kiya (z-index: -1 se yeh peeche rahega) */}
          <AnimatedBackground />
          <VisitorTracker />
          
          <Header />
          {children}
          <Footer />
          <FloatingActionButtons />
        </AuthProvider>
      </body>
    </html>
  );
}