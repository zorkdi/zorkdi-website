// src/app/layout.tsx

// Cache settings: 5 minute baad data refresh hoga
export const revalidate = 300; 

import type { Metadata } from "next";
import { Poppins } from "next/font/google"; 
import "./globals.css";
import Script from "next/script";

// Components Imports
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { AuthProvider } from "../context/AuthContext";
import FloatingActionButtons from "../components/FloatingActionButtons/FloatingActionButtons"; 
import SmoothScroll from "../components/SmoothScroll"; 

// Firebase Imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: '--font-poppins',
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

// --- Default Values ---
const defaultSettings: GlobalSettings = {
    websiteTitle: "ZORK DI", 
    websiteTagline: "Empowering Ideas With Technology - Premium IT Solutions", 
    headerLogoURL: "/logo.png", 
    googleAnalyticsId: "", 
    googleSearchConsoleId: "", 
    heroBackgroundURL: "", 
};

// --- Firebase Data Fetcher ---
async function getGlobalSettings(): Promise<GlobalSettings> {
    try {
        const docRef = doc(db, 'cms', 'global_settings');
        const docSnap = await getDoc(docRef); 

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

// --- METADATA GENERATION (SEO ENGINE) ---
export async function generateMetadata(): Promise<Metadata> {
    const globalSettings = await getGlobalSettings();
    
    // Domain set kiya (Important for SEO)
    const siteBaseUrl = 'https://www.zorkdi.in'; 
    const isProduction = process.env.VERCEL_ENV === 'production';

    return {
        metadataBase: new URL(siteBaseUrl),

        title: {
            default: globalSettings.websiteTitle,
            template: `%s | ${globalSettings.websiteTitle}` 
        },
        description: globalSettings.websiteTagline,
        
        // Canonical URL automatically generate hoga
        alternates: {
            canonical: '/',
        },

        // Robots.txt control
        robots: {
            index: isProduction,
            follow: isProduction,
            googleBot: {
                index: isProduction,
                follow: isProduction,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        // Social Media Preview (Open Graph)
        openGraph: {
            title: globalSettings.websiteTitle,
            description: globalSettings.websiteTagline,
            url: siteBaseUrl,
            siteName: 'ZORK DI',
            locale: 'en_US',
            type: 'website',
            images: [
                {
                    url: globalSettings.headerLogoURL || '/logo.png', 
                    width: 800,
                    height: 600,
                    alt: globalSettings.websiteTitle,
                }
            ],
        },

        // NOTE: Icons yahan se hata diye gaye hain taaki src/app/icon.png use ho.
        
        // Google Search Console Verification
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
  
  const heroBackground = globalSettings.heroBackgroundURL 
    ? `url('${globalSettings.heroBackgroundURL}')` 
    : ''; 
    
  const customCssVars = {
      '--hero-bg-image': heroBackground,
  };

  // --- JSON-LD Schema (Organization) ---
  // Yeh Google ko structured data dega
  const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: globalSettings.websiteTitle,
      url: 'https://www.zorkdi.in',
      logo: 'https://www.zorkdi.in/icon.png', // Auto-detected icon ka path
      description: globalSettings.websiteTagline,
      address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN', 
      },
  };

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* Schema Injection */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
          <SmoothScroll> 
            <Header globalSettings={globalSettings} />
            {children}
            <Footer />
            <FloatingActionButtons />
          </SmoothScroll> 
        </AuthProvider>
      </body>
    </html>
  );
}