// src/app/layout.tsx

export const revalidate = 0; // === YAHAN CHANGE KIYA GAYA HAI === (Server cache ko disable karta hai)

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
  headerLogoURL: string; // NAYA FIELD LOGO KE LIYE
  googleAnalyticsId?: string; 
  googleSearchConsoleId?: string; 
  heroBackgroundURL?: string; 
  defaultHeroBackground?: string; 
}

// Default/Fallback settings
const defaultSettings: GlobalSettings = {
    websiteTitle: "ZORK DI - Custom Tech Solutions",
    websiteTagline: "We transform your ideas into high-performance applications, websites, and software.",
    headerLogoURL: "/logo.png", // NAYA DEFAULT VALUE
    googleAnalyticsId: "G-XXXXXXXXXX", 
    googleSearchConsoleId: "", 
    heroBackgroundURL: "", 
    defaultHeroBackground: "",
};

// Function to fetch ALL Global Settings from Firestore
async function getGlobalSettings(): Promise<GlobalSettings> {
    try {
        const docRef = doc(db, 'cms', 'global_settings');
        // === YAHAN CHANGE KIYA GAYA HAI ===
        // getDoc ko 'no-store' cache option diya
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

    // NAYA: Favicon logic
    const faviconURL = (globalSettings.headerLogoURL && globalSettings.headerLogoURL.trim() !== "")
        ? globalSettings.headerLogoURL
        : defaultSettings.headerLogoURL;

    return {
        title: globalSettings.websiteTitle,
        description: globalSettings.websiteTagline,
        verification: verificationMeta, 
        // NAYA: icons property add ki
        icons: {
            icon: faviconURL,
            apple: faviconURL,
        }
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
    : ''; 
    
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