// src/app/admin/portfolio/edit/[id]/page.tsx
import PortfolioForm from '@/components/AdminForms/PortfolioForm'; // Import the reusable form
import adminStyles from '../../../admin.module.css'; // Correct path to admin styles

// Props type for page component
interface EditPortfolioPageProps {
  params: {
    id: string; // The dynamic segment [id] from the URL
  };
}

const EditPortfolioPage = ({ params }: EditPortfolioPageProps) => {
  const { id } = params; // Extract the post ID from URL params

  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <h1>Edit Portfolio Project</h1>
      </div>
      <div className={adminStyles.dataContainer}>
        {/* Render the form WITH the postId */}
        <PortfolioForm postId={id} />
      </div>
    </div>
  );
};

export default EditPortfolioPage;