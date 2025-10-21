// src/app/admin/portfolio/new/page.tsx
import PortfolioForm from '@/components/AdminForms/PortfolioForm'; // Import the reusable form
import adminStyles from '../../admin.module.css'; // Import admin styles for header

const AddPortfolioPage = () => {
  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <h1>Add New Portfolio Project</h1>
      </div>
      <div className={adminStyles.dataContainer}>
        {/* Render the form without postId */}
        <PortfolioForm />
      </div>
    </div>
  );
};

export default AddPortfolioPage;