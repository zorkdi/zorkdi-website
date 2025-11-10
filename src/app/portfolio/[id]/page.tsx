// src/app/portfolio/[id]/page.tsx

// === YAHAN CHANGE KIYA GAYA HAI ===
// Server component ab 'PortfolioContent' client component ko import karega
import PortfolioContent from './PortfolioContent'; 

// Page component props
interface PortfolioDetailPageProps {
  params: {
    id: string; // The dynamic segment [id] from the URL
  };
}

// The Page Component (Server Component)
// Yeh ab bahut simple hai
const PortfolioDetailPage = async (props: PortfolioDetailPageProps) => {
  
  // FIX: Next.js 15+ ke liye params ko aise await karna hai.
  // Isse aapka build error fix ho jayega.
  const { id } = await props.params;

  // Server component ab koi HTML render nahi karega.
  // Yeh bas client component 'PortfolioContent' ko render karega
  // aur 'id' ko prop ke taur par pass kar dega.
  // 'PortfolioContent' component data fetch karne ka kaam khud karega.
  return (
    <PortfolioContent id={id} />
  );
};

export default PortfolioDetailPage;