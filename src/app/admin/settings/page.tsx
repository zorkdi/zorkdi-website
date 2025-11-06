// src/app/admin/settings/page.tsx

"use client";

import { useState } from 'react';
import React from 'react'; // React import ensure kiya

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
    // FIX: Initial active tab ko 'global' rakha
    const [activeTab, setActiveTab] = useState('global');

    // FIX: ActiveComponent ko nikal diya, ab hum sabko render karenge

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
                        // FIX: Active tab ke liye styling classes use kiye
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

            {/* --- Dynamic Content Area (CRITICAL FIX: Render all components, hide using display) --- */}
            <div className={settingsStyles.settingGroup}>
                
                {/* Global CMS */}
                <div style={{ display: activeTab === 'global' ? 'block' : 'none' }}>
                    <GlobalCMS />
                </div>
                
                {/* About CMS */}
                <div style={{ display: activeTab === 'about' ? 'block' : 'none' }}>
                    <AboutCMS />
                </div>
                
                {/* Services CMS */}
                <div style={{ display: activeTab === 'services' ? 'block' : 'none' }}>
                    <ServicesCMS />
                </div>

            </div>
        </div>
    );
};

export default AdminSettingsPage;
