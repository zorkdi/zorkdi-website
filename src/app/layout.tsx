import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { AuthProvider } from "../context/AuthContext";
import FloatingChatButton from "../components/FloatingChatButton/FloatingChatButton"; // NAYA: Floating Chat Button import kiya

// Firebase imports for metadata fetch
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Interface for Global Settings (metadata ke liye)
interface GlobalSettings {
  websiteTitle: string;
  websiteTagline: string;
}

// Default/Fallback metadata 
const defaultMetadata: GlobalSettings = {
    websiteTitle: "ZORK DI - Custom Tech Solutions",
    websiteTagline: "We transform your ideas into high-performance applications, websites, and software.",
};

// Function to fetch Global Settings for Metadata
async function getGlobalSettings(): Promise<GlobalSettings> {
    try {
        const docRef = doc(db, 'cms', 'global_settings');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                websiteTitle: data.websiteTitle || defaultMetadata.websiteTitle,
                websiteTagline: data.websiteTagline || defaultMetadata.websiteTagline,
            };
        } else {
            return defaultMetadata;
        }
    } catch (error) {
        console.error("Server-side fetching error for metadata:", error);
        return defaultMetadata; 
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const globalSettings = await getGlobalSettings();
    
    return {
        title: globalSettings.websiteTitle,
        description: globalSettings.websiteTagline,
    };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
          
          {/* NAYA: Floating Chat Button ko yahan render kiya, sirf logged-in users ke liye dikhega */}
          <FloatingChatButton /> 
        </AuthProvider>
      </body>
    </html>
  );
}
