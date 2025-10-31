// src/app/admin/settings/page.tsx

"use client";

import { useState } from 'react';

// CMS Components jo humne abhi update kiye hain
import GlobalCMS from '@/components/AdminForms/GlobalCMS';
import AboutCMS from '@/components/AdminForms/AboutCMS';
import ServicesCMS from '@/components/AdminForms/ServicesCMS';

// Styles
import adminStyles from '../admin.module.css';
import settingsStyles from './settings.module.css';

// Tabs ki definition
const settingsTabs = [
    { id: 'global', name: 'Global Settings', component: GlobalCMS },
    { id: 'about', name: 'About Page', component: AboutCMS },
    { id: 'services', name: 'Services Page', component: ServicesCMS },
];

const AdminSettingsPage = () => {
    const [activeTab, setActiveTab] = useState(settingsTabs[0].id);

    // Current active component ko find karna
    const ActiveComponent = settingsTabs.find(tab => tab.id === activeTab)?.component || GlobalCMS;

    return (
        <div className={settingsStyles.settingsContainer}>
            <div className={adminStyles.pageHeader}>
                <h1>Settings & CMS</h1>
            </div>

            {/* --- Tab Navigation (Filters) --- */}
            <div className={adminStyles.dataContainer} style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {settingsTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        // NAYA: Active tab ke liye styling classes use kiye
                        className={`${adminStyles.primaryButton} ${tab.id === activeTab ? adminStyles.activeFilter : ''}`}
                        style={{ 
                            padding: '0.6rem 1.2rem', 
                            boxShadow: tab.id === activeTab ? 'var(--shadow-neon)' : 'none',
                            backgroundColor: tab.id === activeTab ? 'var(--color-neon-green)' : 'var(--color-dark-navy)',
                            color: tab.id === activeTab ? 'var(--color-dark-navy)' : 'var(--color-off-white)',
                            border: tab.id === activeTab ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                            transform: tab.id === activeTab ? 'translateY(-3px)' : 'none',
                        }}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* --- Dynamic Content Area --- */}
            <div className={settingsStyles.settingGroup}>
                <ActiveComponent />
            </div>
        </div>
    );
};

export default AdminSettingsPage;