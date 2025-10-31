// src/app/admin/portfolio/new/page.tsx

"use client";

import PortfolioForm from '@/components/AdminForms/PortfolioForm'; // Import the reusable form
import adminStyles from '../../admin.module.css'; // Correct path to admin styles
import React from 'react'; // React import ensure kiya

const CreatePortfolioPage = () => {
  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <h1>Create New Portfolio Project</h1>
      </div>
      <div className={adminStyles.dataContainer}>
        {/* Render the form WITHOUT passing a postId, which puts it in Creation Mode */}
        <PortfolioForm />
      </div>
    </div>
  );
};

export default CreatePortfolioPage;