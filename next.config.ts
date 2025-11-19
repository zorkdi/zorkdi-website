import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Images Configuration
  images: {
    remotePatterns: [
      // Google Auth Profile Pictures (Fix for "Invalid src prop" error)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      // Firebase Storage Images (For uploaded project/blog images)
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '**',
      },
    ],
  },

  // 2. Network Access Configuration (Mobile Testing Fix)
  // Agar tum Server Actions use kar rahe ho, toh IP allow karna padta hai
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.1.15:3000', 'localhost:3000'],
    },
  },
};

export default nextConfig;