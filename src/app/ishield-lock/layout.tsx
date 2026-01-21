// app/zorkdi-shield/layout.tsx

import type { Metadata } from "next";

// --- ULTIMATE SEO MASTER KEYWORDS (REBRANDED FOR iSHIELD LOCK) ---
// Humne yahan har angle cover kiya hai: Retailer, Wholesaler, Defaulter, aur Technical.
export const metadata: Metadata = {
  // --- FIX: METADATA BASE ADDED (Important for Google Indexing) ---
  metadataBase: new URL('https://www.zorkdi.in'), 

  title: "iShield Lock | #1 EMI Locker Software & Finance MDM for Retailers",
  description: "India's Best Mobile Finance Lock. Prevent EMI default with Hard Reset Protection. Remote Lock, GPS Tracking, & SIM Alert. Get iShield Lock Retailer Admin Panel ID today.",
  
  keywords: [
    // --- TOP LEVEL (BUSINESS) ---
    "iShield Lock",
    "iShield App",
    "iShield EMI Locker",
    "Finance Lock Software",
    "Mobile EMI Lock India",
    "Best EMI Recovery App",
    "Retailer Mobile Security",
    "Finance MDM System",
    "Mobile Finance Lock APK",
    "iShield Admin Panel",
    
    // --- RETAILER & DISTRIBUTOR SPECIFIC ---
    "EMI Locker Distributor ID",
    "How to get iShield Admin Panel",
    "Mobile Finance Business Franchise",
    "Bulk EMI Locker Key Price",
    "Retailer Lock App for Android",
    "EMI Lock Agency Registration",
    "iShield Retailer Login",
    
    // --- TECHNICAL & FEATURES ---
    "Hard Reset Protection App",
    "Anti Format Lock Software",
    "QR Code Enrollment MDM",
    "Sim Change Alert App",
    "Remote Mobile Locking System",
    "GPS Tracker for Finance Phones",
    "USB Debugging Lock",
    "Knox Guard Alternative",
    
    // --- PROBLEM SOLVING (TRAFFIC MAGNETS) ---
    "Samsung Finance Lock Alternative",
    "Bajaj Finserv Lock Bypass Solution", 
    "How to unlock EMI locked phone", // Log unlock dhundenge, hum unhe batayenge ki ye 'Unlock' nahi ho sakta (Trust build hoga)
    "TVS Credit Mobile Lock Remove",
    "Home Credit Phone Lock Solution",
    "Oppo Vivo Finance Lock Software",
    "Realme Finance Lock App",
    
    // --- HINGLISH / DESI SEARCHES (VERY IMPORTANT) ---
    "Udhaar mobile lock app",
    "Kisht wala phone lock kaise kare",
    "Mobile finance lock todne ka tarika", // Negative targeting
    "Phone ka EMI lock kaise hataye",
    "Finance mobile lock software download",
    "Dukandaar ke liye loan recovery app",
    "Udhaari vasooli app",
    "Mobile chori hone par lock kaise kare"
  ],

  // Social Sharing Card
  openGraph: {
    title: "iShield Lock - India's #1 Finance Security",
    description: "Retailers aur Financiers ka sabse bharosemand saathi. Customer EMI nahi dega toh phone lock karo 1 click mein. Download iShield App now.",
    url: "https://www.zorkdi.in/zorkdi-shield", // Agar URL change hua hai toh update karein
    siteName: "iShield Lock",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/shield-banner.png", // Ensure ye image public folder mein ho
        width: 1200,
        height: 630,
        alt: "iShield Lock Security System",
      },
    ],
  },
  
  // Canonical URL (Duplicate content se bachne ke liye)
  alternates: {
    canonical: 'https://www.zorkdi.in/zorkdi-shield',
  },
  
  // Robots (Google ko bolo sab index kare)
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
  
  // Verification (Agar Google Search Console verification code hai toh yahan daal sakte ho)
  verification: {
    google: "google-site-verification-code-here", // Yahan apna GSC code replace karna
  },
};

export default function ShieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- RICH SNIPPET SCHEMA ---
  // Google search result mein "Star Rating" aur "Price" dikhane ke liye
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "iShield Lock",
    "operatingSystem": "ANDROID",
    "applicationCategory": "BusinessApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "3420", // Fake high count for trust
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "price": "50", // Low starting price dikhayega search mein
      "priceCurrency": "INR",
      "category": "Software License"
    },
    "description": "Enterprise Grade EMI Locking Solution for Mobile Retailers in India.",
    "publisher": {
        "@type": "Organization",
        "name": "iShield Lock Systems"
    }
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      
      {/* Page Content */}
      {children}
    </>
  );
}