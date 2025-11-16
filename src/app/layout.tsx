// src/app/layout.tsx

// Cache settings: 5 minute baad data refresh hoga
export const revalidate = 300; 

import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Font import
import "./globals.css";
import Script from "next/script";

// Components Imports
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { AuthProvider } from "../context/AuthContext";
import FloatingActionButtons from "../components/FloatingActionButtons/FloatingActionButtons"; 

// Firebase Imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: '--font-poppins', // Variable add kiya future use ke liye
});

// --- Settings Interface ---
interface GlobalSettings {
  websiteTitle: string;
  websiteTagline: string;
  headerLogoURL: string; 
  googleAnalyticsId?: string; 
  googleSearchConsoleId?: string; 
  heroBackgroundURL?: string; 
}

// --- Default Values (Agar Firebase fail ho jaye) ---
const defaultSettings: GlobalSettings = {
    websiteTitle: "ZORK DI", // Title chhota rakha taaki Google pura dikhaye
    websiteTagline: "Empowering Ideas With Technology - Premium IT Solutions", // Tagline thodi descriptive ki
    headerLogoURL: "/logo.png", 
    googleAnalyticsId: "", 
    googleSearchConsoleId: "", 
    heroBackgroundURL: "", 
};

// --- Firebase Data Fetcher ---
async function getGlobalSettings(): Promise<GlobalSettings> {
    try {
        const docRef = doc(db, 'cms', 'global_settings');
        const docSnap = await getDoc(docRef); // Cache handling upar revalidate se hogi

        if (docSnap.exists()) {
            const data = docSnap.data();
            return { ...defaultSettings, ...data } as GlobalSettings;
        } else {
            return defaultSettings;
        }
    } catch (error) {
        console.error("SEO Fetch Error:", error);
        return defaultSettings; 
    }
}

// --- MAJOR FIX: CORRECT METADATA GENERATION ---
export async function generateMetadata(): Promise<Metadata> {
    const globalSettings = await getGlobalSettings();
    
    // 1. Domain Fix: Google ko batana zaroori hai ki main site kaunsi hai
    const siteBaseUrl = 'https://www.zorkdi.in'; 

    // 2. Favicon Logic
    const faviconURL = (globalSettings.headerLogoURL && globalSettings.headerLogoURL.trim() !== "")
        ? globalSettings.headerLogoURL
        : defaultSettings.headerLogoURL;

    return {
        // FIX: MetadataBase set karna zaroori hai Vercel issues ke liye
        metadataBase: new URL(siteBaseUrl),

        title: {
            default: globalSettings.websiteTitle,
            template: `%s | ${globalSettings.websiteTitle}` // "Contact | ZORK DI" style
        },
        description: globalSettings.websiteTagline,
        
        // FIX: Canonical URL (Ye Vercel link hatayega aur main domain layega)
        alternates: {
            canonical: '/',
        },

        // FIX: Robots txt control
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        // FIX: Open Graph (Social Media Previews ke liye)
        openGraph: {
            title: globalSettings.websiteTitle,
            description: globalSettings.websiteTagline,
            url: siteBaseUrl,
            siteName: 'ZORK DI',
            locale: 'en_US',
            type: 'website',
            images: [
                {
                    url: faviconURL, // Social share par logo dikhega
                    width: 800,
                    height: 600,
                    alt: globalSettings.websiteTitle,
                }
            ],
        },

        // Icons (Favicon in Search Results)
        icons: {
            icon: faviconURL,
            shortcut: faviconURL,
            apple: faviconURL,
        },

        // Google Verification (Search Console)
        verification: globalSettings.googleSearchConsoleId 
            ? { google: globalSettings.googleSearchConsoleId } 
            : {},
    };
}

// --- Root Layout Component ---
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalSettings = await getGlobalSettings();
  const gaId = globalSettings.googleAnalyticsId;
  
  // Dynamic Hero Background logic
  const heroBackground = globalSettings.heroBackgroundURL 
    ? `url('${globalSettings.heroBackgroundURL}')` 
    : ''; 
    
  const customCssVars = {
      '--hero-bg-image': heroBackground,
  };

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>

      {/* Google Analytics Injection */}
      {gaId && (
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
          {/* Header ko settings pass ki gayi */}
          <Header globalSettings={globalSettings} />

          {children}

          <Footer />
          <FloatingActionButtons />
        </AuthProvider>
      </body>
    </html>
  );
}