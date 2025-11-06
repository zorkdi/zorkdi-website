// src/app/blog/[slug]/page.tsx

import React from 'react';
// CRITICAL FIX: Ab hum Client Component ko import karenge jismein fetching hogi
import BlogContent from './BlogContent'; 

// Page Component (Server Component)
interface BlogDetailPageProps {
  params: {
    slug: string; // URL se slug aayega
  };
}

// Server Component: Iska kaam sirf slug ko Client Component tak pahunchana hai.
// Isse Server-side fetching error nahi aayega.
const BlogDetailPage = ({ params }: BlogDetailPageProps) => {
  const { slug } = params;

  return (
    // Client Component ko render kiya. Actual data fetching ab browser mein hogi.
    // Isse 'Missing or insufficient permissions' error theek ho jayega.
    <BlogContent slug={slug} />
  );
};

export default BlogDetailPage;

// NOTE: Humne BlogContent.tsx ko bhi pehle hi banaya hai jismein client-side fetching logic hai.
// Yeh do files milkar hi is issue ko fix karenge.
