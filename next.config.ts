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

  // Keep your existing devServer config if you added it (Corrected IP)
  devServer: {
      allowedDevOrigins: ["http://192.168.1.15:3000"],
  },
};

export default nextConfig;