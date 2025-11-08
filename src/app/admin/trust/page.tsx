// src/app/admin/trust/page.tsx
import TrustCMS from '@/components/AdminForms/TrustCMS';
import React from 'react';

// TrustCMS component ko render karo
const TrustPage = () => {
    return (
        <>
            <div style={{ paddingBottom: '2rem' }}>
                {/* AdminLayout se header styling inherit hogi */}
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-off-white)' }}>Client Trust Settings</h1>
            </div>
            <TrustCMS />
        </>
    );
};

export default TrustPage;