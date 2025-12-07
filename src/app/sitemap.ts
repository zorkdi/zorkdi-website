// src/app/sitemap.ts

import { MetadataRoute } from 'next';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase'; // Firebase import

// Base URL defines karo (Aapka confirm kiya hua domain)
const BASE_URL = 'https://www.zorkdi.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  
  // 1. Static Routes (Jo hamesha rahenge)
  const routes = [
    '',
    '/zorkdi-shield', // ADDED: ZORK DI Shield (High Priority)
    '/about',
    '/services',
    '/portfolio',
    '/blog',
    '/contact',
    '/new-project',
    '/login',
    '/signup',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '/zorkdi-shield' ? 1.0 : (route === '' ? 1.0 : 0.8), // Shield aur Home ki priority Highest
  }));

  // 2. Dynamic Blogs Fetch karo (Firebase se)
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
      const blogRef = collection(db, 'blog');
      // CHANGE: limit(50) hata diya taaki SAARE blogs Google index kare
      const q = query(blogRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      blogRoutes = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
              url: `${BASE_URL}/blog/${data.slug}`,
              lastModified: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
              changeFrequency: 'weekly' as const,
              priority: 0.7,
          };
      });
  } catch (error) {
      console.error("Sitemap Error (Blogs):", error);
  }

  // 3. Dynamic Portfolio Projects Fetch karo
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
      const portfolioRef = collection(db, 'portfolio');
      // CHANGE: limit(50) hata diya taaki SAARE projects Google index kare
      const q = query(portfolioRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      projectRoutes = snapshot.docs.map((doc) => {
          return {
              url: `${BASE_URL}/portfolio/${doc.id}`, // ID se link banta hai
              lastModified: new Date(), // Agar timestamp nahi hai to current date
              changeFrequency: 'monthly' as const,
              priority: 0.7,
          };
      });
  } catch (error) {
      console.error("Sitemap Error (Portfolio):", error);
  }

  // 4. Sabko mila kar return karo
  return [...routes, ...blogRoutes, ...projectRoutes];
}