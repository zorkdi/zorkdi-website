// app/admin/distributor-requests/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import styles from './leads.module.css';
import Image from 'next/image';
import { FaPhone, FaMapMarkerAlt, FaTrash, FaCalendarAlt, FaUserTie } from 'react-icons/fa';

// Firebase
import { collection, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';

interface DistributorRequest {
    id: string;
    fullName: string;
    contact: string;
    address: string;
    profileImageUrl: string;
    createdAt: Timestamp;
}

export default function DistributorLeadsPage() {
    const [leads, setLeads] = useState<DistributorRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH LEADS ---
    useEffect(() => {
        const fetchLeads = async () => {
            try {
                // Fetch requests ordered by newest first
                const q = query(collection(db, 'distributor_requests'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                
                const data: DistributorRequest[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as DistributorRequest));

                setLeads(data);
            } catch (error) {
                console.error("Error fetching leads:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    // --- DELETE LEAD ---
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this application? This action cannot be undone.")) return;

        try {
            await deleteDoc(doc(db, 'distributor_requests', id));
            setLeads(prev => prev.filter(lead => lead.id !== id));
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete application.");
        }
    };

    // Helper to format date
    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Distributor Applications</h1>
            </div>

            {loading ? (
                <p style={{color: '#aaa', padding: '2rem'}}>Loading applications...</p>
            ) : leads.length === 0 ? (
                <div className={styles.emptyState}>
                    <FaUserTie style={{fontSize: '3rem', marginBottom: '1rem', opacity: 0.5}} />
                    <p>No new applications received yet.</p>
                </div>
            ) : (
                <div className={styles.leadsGrid}>
                    {leads.map(lead => (
                        <div key={lead.id} className={styles.leadCard}>
                            
                            {/* Header: Photo & Name */}
                            <div className={styles.cardHeader}>
                                <div style={{position: 'relative', width: '60px', height: '60px'}}>
                                    <Image 
                                        src={lead.profileImageUrl} 
                                        alt={lead.fullName} 
                                        fill
                                        style={{objectFit: 'cover', borderRadius: '50%'}}
                                        className={styles.profileImg}
                                    />
                                </div>
                                <div className={styles.headerInfo}>
                                    <h3>{lead.fullName}</h3>
                                    <div className={styles.dateBadge}>
                                        <FaCalendarAlt style={{marginRight: '5px', fontSize: '0.7em'}}/>
                                        {formatDate(lead.createdAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Body: Details */}
                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <FaPhone className={styles.infoIcon} />
                                    <span className={styles.infoText}>{lead.contact}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <FaMapMarkerAlt className={styles.infoIcon} />
                                    <span className={styles.infoText}>{lead.address}</span>
                                </div>
                            </div>

                            {/* Footer: Actions */}
                            <div className={styles.cardFooter}>
                                <a href={`tel:${lead.contact}`} className={`${styles.actionBtn} ${styles.callBtn}`}>
                                    <FaPhone /> Call Now
                                </a>
                                <button 
                                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                    onClick={() => handleDelete(lead.id)}
                                >
                                    <FaTrash /> Remove
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}