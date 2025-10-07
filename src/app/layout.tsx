import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import Header from "../components/Header/Header";
// NAYA: Humne Footer component ko yahan import kiya hai
import Footer from "../components/Footer/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ZORK DI - Custom Tech Solutions",
  description: "We transform your ideas into high-performance applications, websites, and software.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        {/* NAYA: Humne Footer component ko yahan use kiya hai */}
        <Footer />
      </body>
    </html>
  );
}