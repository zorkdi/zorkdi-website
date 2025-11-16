// src/app/admin/case-studies/new/page.tsx
// Naya page: "Add New Case Study"

import CaseStudyForm from "@/components/AdminForms/CaseStudyForm";

const NewCaseStudyPage = () => {
    return (
        // Yeh component "New" mode mein run hoga kyunki koi studyId pass nahi kiya hai
        <CaseStudyForm />
    );
};

export default NewCaseStudyPage;