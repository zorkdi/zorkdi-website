// src/app/blog/[slug]/page.tsx

// === YAHAN CHANGE KIYA GAYA HAI ===
import BlogContent from './BlogContent'; // Server component ab 'BlogContent' client component ko import karega
import { Suspense } from 'react'; // Suspense add kiya best practice ke liye

// Page component props
interface BlogPageProps {
  params: {
    slug: string; // The dynamic segment [slug] from the URL
  };
}

// The Page Component (Server Component)
// Yeh ab bahut simple hai
const BlogPage = async (props: BlogPageProps) => {
  
  // FIX: Next.js 15+ ke liye params ko aise await karna hai.
  const { slug } = await props.params;

  // Server component ab koi HTML render nahi karega.
  // Yeh bas client component 'BlogContent' ko render karega
  // aur 'slug' ko prop ke taur par pass kar dega.
  return (
    <Suspense fallback={<p>Loading Post...</p>}> {/* Loading state ke liye Suspense add kiya */}
        <BlogContent slug={slug} />
    </Suspense>
  );
};

export default BlogPage;