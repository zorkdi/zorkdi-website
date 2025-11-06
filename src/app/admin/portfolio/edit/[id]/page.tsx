// src/app/admin/portfolio/edit/[id]/page.tsx

import PortfolioForm from '@/components/AdminForms/PortfolioForm'; 

// Props type for page component
interface EditPortfolioPageProps {
  params: {
    id: string; // The dynamic segment [id] from the URL
  };
}

const EditPortfolioPage = ({ params }: EditPortfolioPageProps) => {
  const { id } = params; // Extract the post ID from URL params

  return (
    // Only render the self-contained form component
    <PortfolioForm postId={id} />
  );
};

export default EditPortfolioPage;