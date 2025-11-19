// src/app/blog/[slug]/page.tsx

import type { Metadata } from "next";
import BlogContent from "./BlogContent"; // Client Component
import { db } from "@/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

// --- Helper Function: Data Fetching for SEO ---
// Yeh function server par run karega aur SEO data layega
async function getBlogPostSEO(slug: string) {
  try {
    // Slug se blog dhoondo
    const q = query(collection(db, "blog"), where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error("SEO Fetch Error:", error);
    return null;
  }
}

// --- SEO ENGINE: DYNAMIC METADATA GENERATION ---
// Yeh sabse important part hai Google Ranking ke liye
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPostSEO(params.slug);

  // Agar post nahi mili
  if (!post) {
    return {
      title: "Post Not Found | ZORK DI",
      description: "The requested blog post could not be found.",
    };
  }

  // 1. SEO Title (Agar custom SEO Title nahi hai, toh Main Title use karo)
  const title = post.seoTitle || post.title || "ZORK DI Blog";

  // 2. Meta Description (Fallback to Summary or generic text)
  const description = post.metaDescription || post.summary || `Read ${post.title} on ZORK DI - Custom Software Development Company.`;

  // 3. Canonical URL (Duplicate content se bachne ke liye)
  const pageUrl = `https://www.zorkdi.in/blog/${params.slug}`;
  const canonical = post.canonicalUrl || pageUrl;

  // 4. Open Graph Image (Social Media par share karne ke liye)
  const images = post.coverImageURL 
    ? [{ url: post.coverImageURL, width: 1200, height: 630, alt: title }] 
    : [];

  // 5. Keywords (String to Array)
  const keywords = post.focusKeywords 
    ? post.focusKeywords.split(',').map((k: string) => k.trim()) 
    : ['Software Development', 'ZORK DI', 'Tech Blog'];

  return {
    title: title,
    description: description,
    keywords: keywords,
    
    // Canonical Tag
    alternates: {
      canonical: canonical,
    },

    // Facebook / LinkedIn Preview
    openGraph: {
      title: title,
      description: description,
      url: pageUrl,
      type: "article",
      publishedTime: post.createdAt?.toDate().toISOString(),
      images: images,
      siteName: "ZORK DI",
    },

    // Twitter Preview
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: images,
    },
  };
}

// --- MAIN PAGE COMPONENT ---
// Yeh sirf Client Component ko call karega jo UI dikhayega
export default function Page({ params }: { params: { slug: string } }) {
  return <BlogContent slug={params.slug} />;
}