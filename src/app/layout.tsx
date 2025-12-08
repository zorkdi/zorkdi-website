// src/app/layout.tsx

// Cache settings: 5 minute baad data refresh hoga
export const revalidate = 300; 

import type { Metadata, Viewport } from "next"; // Viewport import add kiya
import { Inter } from "next/font/google"; // Inter font use kar rahe hain (Premium tech look)
import "./globals.css";
import Script from "next/script";

// Components Imports
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { AuthProvider } from "../context/AuthContext";
import FloatingActionButtons from "../components/FloatingActionButtons/FloatingActionButtons"; 
import SmoothScroll from "../components/SmoothScroll"; 
import ProfileCompletionReminder from "../components/ProfileCompletionReminder/ProfileCompletionReminder";

// Firebase Imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Font Configuration
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: '--font-inter',
  display: 'swap',
});

// --- Settings Interface ---
interface GlobalSettings {
  websiteTitle: string;
  websiteTagline: string;
  headerLogoURL: string; 
  googleAnalyticsId?: string; 
  googleSearchConsoleId?: string; 
  heroBackgroundURL?: string; 
  contactEmail?: string; // Contact info add kiya SEO ke liye
  contactPhone?: string;
}

// --- Default Values ---
const defaultSettings: GlobalSettings = {
    websiteTitle: "ZORK DI", 
    websiteTagline: "Global Leader in Software Engineering, AI & Enterprise Security Solutions", 
    headerLogoURL: "/logo.png", 
    googleAnalyticsId: "", 
    googleSearchConsoleId: "", 
    heroBackgroundURL: "",
    contactEmail: "contact@zorkdi.com",
    contactPhone: "+91-9876543210"
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

// --- Viewport Settings (Next.js 14+ Standard) ---
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Accessibility ke liye zoom allow kiya
  userScalable: true,
  themeColor: '#0A0B0F', // Browser bar ka color dark theme match
};

// --- METADATA GENERATION (SEO ENGINE - WORLD CLASS) ---
export async function generateMetadata(): Promise<Metadata> {
    const globalSettings = await getGlobalSettings();
    const siteBaseUrl = 'https://www.zorkdi.in'; 
    const isProduction = process.env.VERCEL_ENV === 'production';

    return {
        metadataBase: new URL(siteBaseUrl),

        title: {
            default: globalSettings.websiteTitle,
            template: `%s | ${globalSettings.websiteTitle} - Top Rated Software Company` 
        },
        description: globalSettings.websiteTagline,
        
        // --- POWERFUL KEYWORDS INJECTION ---
        keywords: [
            "ZORK DI",
            "Software Company",
            "IT Solutions",
            "Mobile App Development",
            "Web Development",
            "Enterprise Software",
            "Cyber Security",
            "Fintech Solutions",
            "EMI Locking System",
            "Digital Engineering",
            "SaaS Development",
            "Cloud Computing",
            "Artificial Intelligence",
            "React Native Developers",
            "Next.js Experts",
            "Custom Software India",
            "Global IT Services"
        ],

        // Authors & Creator info
        authors: [{ name: "ZORK DI Team", url: siteBaseUrl }],
        creator: "ZORK DI",
        publisher: "ZORK DI",
        
        // Icons
        icons: {
            icon: '/icon.png', 
            shortcut: '/favicon.ico',
            apple: '/apple-icon.png',
        },

        // Canonical URL
        alternates: {
            canonical: '/',
        },

        // Robots Control
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
            siteName: 'ZORK DI - Premium Software Solutions',
            locale: 'en_US',
            type: 'website',
            images: [
                {
                    url: globalSettings.headerLogoURL || '/logo.png', 
                    width: 1200, // Standard social share size
                    height: 630,
                    alt: `${globalSettings.websiteTitle} Banner`,
                }
            ],
        },

        // Twitter Card
        twitter: {
            card: 'summary_large_image',
            title: globalSettings.websiteTitle,
            description: "Building the future with advanced software, security, and AI solutions.",
            images: [globalSettings.headerLogoURL || '/logo.png'],
            creator: '@zorkdi', // Agar handle hai toh yahan update karna
        },
        
        // Verification
        verification: globalSettings.googleSearchConsoleId 
            ? { google: globalSettings.googleSearchConsoleId } 
            : {},
            
        category: 'technology',
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

  // --- ADVANCED JSON-LD SCHEMA (THE SECRET WEAPON) ---
  // Yeh Google ko batayega ki hum exactly kya karte hain
  const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Corporation', // Organization se bada level
      name: globalSettings.websiteTitle,
      alternateName: "ZORK DI Technology",
      url: 'https://www.zorkdi.in',
      logo: 'https://www.zorkdi.in/icon.png', 
      description: globalSettings.websiteTagline,
      slogan: "Empowering Ideas With Technology",
      
      // Contact Point
      contactPoint: {
          '@type': 'ContactPoint',
          telephone: globalSettings.contactPhone || '+91-0000000000',
          contactType: 'customer service',
          areaServed: 'World',
          availableLanguage: ['English', 'Hindi']
      },

      // Social Profiles (Graph)
      sameAs: [
          "https://www.linkedin.com/company/zorkdi",
          "https://www.instagram.com/zorkdi",
          "https://twitter.com/zorkdi",
          "https://github.com/zorkdi"
      ],
      
      // Specialized Knowledge (Power Move for SEO)
      knowsAbout: [
          "Software Engineering",
          "Mobile Application Development",
          "Enterprise Resource Planning",
          "Cyber Security",
          "Artificial Intelligence",
          "Cloud Infrastructure",
          "Fintech Technology"
      ],

      // Services Offer Catalog
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        "name": "Software Development Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Custom Web Application Development"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Mobile App Development (iOS & Android)"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Enterprise Security & EMI Locking Systems"
            }
          },
           {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "UI/UX Design & Branding"
            }
          }
        ]
      }
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
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

      <body className={inter.className} style={heroBackground ? (customCssVars as React.CSSProperties) : undefined}>
        <AuthProvider>
          <SmoothScroll> 
            <Header globalSettings={globalSettings} />
            {children}
            <Footer />
            <FloatingActionButtons />
            <ProfileCompletionReminder />
          </SmoothScroll> 
        </AuthProvider>
      </body>
    </html>
  );
}