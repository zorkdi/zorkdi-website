import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // FIX 1: Dev Server settings add kiye cross-origin warning ko suppress karne ke liye
  devServer: {
    // Tumhare local network IP ko add kiya jahan se tum access kar rahe ho.
    // Tumhara dev server port 3000 hai, isliye port bhi mention karna sahi rahega.
    allowedDevOrigins: [
      'http://192.168.1.15:3000', // Tumhara IP address
    ],
  },
  
  // Add this images section
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        // Corrected pathname
        pathname: '/v0/b/zorkdi-website.firebasestorage.app/o/**',
      },
      // You can add more allowed domains here if needed later
    ],
  },

  // FIX: devServer option ko hata diya gaya hai // NOTE: Ab 'devServer' upar add ho gaya hai
};

export default nextConfig;