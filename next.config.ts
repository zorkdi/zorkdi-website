import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

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

  // FIX: devServer option ko hata diya gaya hai
};

export default nextConfig;