import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.zorkdi.in'; // Aapka Domain

  return {
    rules: {
      userAgent: '*', // Sabhi bots ke liye
      allow: '/',     // Sab allowed hai
      disallow: '/admin/', // Sirf Admin area blocked hai
    },
    sitemap: `${baseUrl}/sitemap.xml`, // Sitemap ka link
  };
}