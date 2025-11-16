// src/app/admin/case-studies/edit/[id]/page.tsx
// Naya page: "Edit Case Study"

"use client";

import CaseStudyForm from "@/components/AdminForms/CaseStudyForm";
import { useParams } from 'next/navigation';

const EditCaseStudyPage = () => {
    // URL se dynamic ID nikaalna
    const params = useParams();
    const { id } = params;

    return (
        // CaseStudyForm ko "edit" mode mein run karna aur studyId pass karna
        <CaseStudyForm studyId={id as string} />
    );
};

export default EditCaseStudyPage;