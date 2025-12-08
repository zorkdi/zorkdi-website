// src/app/blog/[slug]/page.tsx

import React from 'react';
import { Metadata } from 'next';
import BlogContent from './BlogContent';
import { db } from '@/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';

// Next.js 15 mein params ab Promise hota hai
type Props = {
  params: Promise<{ slug: string }>;
};

// SEO ke liye Data Fetch Helper
async function getBlogPostForSEO(postSlug: string) {
  try {
    const blogCollectionRef = collection(db, 'blog');
    
    // 1. Try finding by slug field
    const q = query(
        blogCollectionRef, 
        where('slug', '==', postSlug), 
        limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }

    // 2. Fallback: Try finding by Doc ID (agar slug match nahi hua)
    const docRef = doc(db, 'blog', postSlug);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }

    return null;
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    return null;
  }
}

// Dynamic SEO Metadata Generator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await params (Next.js 15 Requirement)
  const { slug } = await params;
  
  const post = await getBlogPostForSEO(slug);

  if (!post) {
    return {
      title: 'Post Not Found | ZORK DI Blog',
      description: 'The blog post you are looking for does not exist.',
    };
  }

  return {
    title: `${post.title} | ZORK DI Blog`,
    description: post.summary || post.title,
    openGraph: {
      title: post.title,
      description: post.summary || 'Read this article on ZORK DI Blog.',
      url: `https://zorkdi.com/blog/${slug}`, // Apna domain replace kar lena agar alag ho
      siteName: 'ZORK DI',
      images: [
        {
          url: post.coverImageURL || '/images/default-blog-cover.jpg', // Fallback image
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || 'Read this article on ZORK DI Blog.',
      images: [post.coverImageURL || '/images/default-blog-cover.jpg'],
    },
  };
}

// Main Page Component
export default async function Page({ params }: Props) {
  // Await params here as well (Crucial fix for your error)
  const { slug } = await params;

  return <BlogContent slug={slug} />;
}