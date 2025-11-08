// src/app/admin/founder/page.tsx
import FounderCMS from '@/components/AdminForms/FounderCMS';
import React from 'react';

// FounderCMS component ko render karo
const FounderPage = () => {
    return (
        <>
            <div style={{ paddingBottom: '2rem' }}>
                {/* AdminLayout se header styling inherit hogi */}
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-off-white)' }}>Founder Profile Settings</h1>
            </div>
            <FounderCMS />
        </>
    );
};

export default FounderPage;