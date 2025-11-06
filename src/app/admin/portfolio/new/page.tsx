// src/app/admin/portfolio/new/page.tsx

"use client";

import PortfolioForm from '@/components/AdminForms/PortfolioForm'; 
import React from 'react'; 

const CreatePortfolioPage = () => {
  // Only render the self-contained form component
  return (
    <PortfolioForm />
  );
};

export default CreatePortfolioPage;