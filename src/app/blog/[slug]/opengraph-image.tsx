// src/app/blog/[slug]/opengraph-image.tsx

import { ImageResponse } from 'next/og';
import { db } from '@/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';

// Image Metadata
export const alt = 'ZORK DI Blog Post';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Next.js 15: Params ab Promise hai
type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  // 1. Params ko Await karna zaroori hai (Next.js 15 fix)
  const { slug } = await params;

  // 2. Blog Data Fetch karne ki koshish (Firebase)
  let title = transformSlugToTitle(slug); // Default Fallback
  let category = 'TECH INSIGHTS';

  try {
    const blogRef = collection(db, 'blog');
    const q = query(blogRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      title = data.title || title;
      category = data.category || category;
    } else {
       // Try fetching by ID directly if slug query fails
       const docRef = doc(db, 'blog', slug);
       const docSnap = await getDoc(docRef);
       if (docSnap.exists()) {
           const data = docSnap.data();
           title = data.title || title;
           category = data.category || category;
       }
    }
  } catch (error) {
    console.error('OG Image Fetch Error:', error);
    // Error aane par hum fallback title (Slug se bana hua) use karenge
  }

  // 3. Image Generate karna (JSX Design)
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0B0F', // Dark Navy Background
          backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1f2e 0%, #0A0B0F 70%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Abstract Neon Glows */}
        <div
            style={{
                position: 'absolute',
                top: '-100px',
                left: '-100px',
                width: '400px',
                height: '400px',
                background: '#00F5C8',
                borderRadius: '50%',
                opacity: '0.15',
                filter: 'blur(100px)',
            }}
        />
        <div
            style={{
                position: 'absolute',
                bottom: '-100px',
                right: '-100px',
                width: '500px',
                height: '500px',
                background: '#8b5cf6',
                borderRadius: '50%',
                opacity: '0.15',
                filter: 'blur(100px)',
            }}
        />

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '15px' }}>
            {/* Logo Placeholder Shape */}
            <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00F5C8, #00c4a0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 245, 200, 0.4)',
            }}>
                <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#000' }}>Z</div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>
                ZORK <span style={{ color: '#00F5C8' }}>DI</span>
            </div>
        </div>

        {/* Main Title Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 60px',
            maxWidth: '1000px',
            textAlign: 'center',
            background: 'rgba(16, 18, 26, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
             {/* Category Badge */}
            <div
                style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    color: '#a78bfa',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    padding: '8px 24px',
                    borderRadius: '50px',
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '30px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                }}
            >
                {category}
            </div>

            {/* Blog Title - FIX: Removed Duplicate Color Property */}
            <div
                style={{
                    fontSize: title.length > 50 ? '60px' : '80px', // Auto-resize text
                    fontWeight: '800',
                    // Removed extra 'color: #fff' here to fix conflict
                    lineHeight: 1.1,
                    marginBottom: '20px',
                    textShadow: '0 0 30px rgba(0,0,0,0.5)',
                    background: 'linear-gradient(to right, #ffffff, #b0b0b0)',
                    backgroundClip: 'text',
                    color: 'transparent', // Gradient text needs transparent color
                }}
            >
                {title}
            </div>
        </div>

        {/* Footer URL */}
        <div style={{ 
            position: 'absolute', 
            bottom: '40px', 
            fontSize: '24px', 
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '1px',
        }}>
            www.zorkdi.in
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

// Helper Function: Agar Firebase se data na mile toh Slug se Title banao
function transformSlugToTitle(slug: string) {
  if (!slug) return 'ZORK DI Blog';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}