// app/admin/mail/[id]/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import styles from '../../admin.module.css';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { 
    doc, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase'; 
import { 
    FaEnvelopeOpenText, FaReply, FaTrashAlt, FaCheckCircle, FaSpinner, FaUser, FaAt, FaClock 
} from 'react-icons/fa';

// TypeScript Interface for Message Data
interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'Unread' | 'Read' | 'Archived';
    createdAt: Timestamp;
}

const MessageDetailPage = () => {
    const params = useParams();
    const messageId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    const router = useRouter();
    const [message, setMessage] = useState<Message | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Function to format Firebase Timestamp
    const formatDate = (timestamp: Timestamp): string => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Data Fetching aur Status Update
    useEffect(() => {
        if (!messageId) {
            setError("Invalid Message ID.");
            setLoading(false);
            return;
        }

        const fetchMessageAndUpdateStatus = async () => {
            const docRef = doc(db, 'messages', messageId);
            
            try {
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fetchedMessage: Message = {
                        id: docSnap.id,
                        name: data.name,
                        email: data.email,
                        subject: data.subject,
                        message: data.message,
                        status: data.status,
                        createdAt: data.createdAt,
                    } as Message;
                    
                    setMessage(fetchedMessage);
                    setLoading(false);

                    // --- Status ko 'Read' mein badalna ---
                    if (fetchedMessage.status === 'Unread') {
                        await updateDoc(docRef, {
                            status: 'Read',
                        });
                        // State ko bhi update kar do
                        setMessage(prev => prev ? {...prev, status: 'Read'} : null);
                    }

                } else {
                    setError("Message not found.");
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error fetching or updating message:", err);
                setError("Failed to load message details. Check console.");
                setLoading(false);
            }
        };

        fetchMessageAndUpdateStatus();
    }, [messageId]);

    // Action: Message ko delete karna
    const handleDelete = async () => {
        if (!message || !confirm(`Are you sure you want to permanently delete the message from ${message.name}?`)) {
            return;
        }

        setIsUpdating(true);
        try {
            const docRef = doc(db, 'messages', message.id);
            await deleteDoc(docRef);
            
            alert("Message permanently deleted.");
            router.push('/admin/mail'); // Wapas inbox page par redirect karna
        } catch (e) {
            console.error("Error deleting message:", e);
            alert("Failed to delete message.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    // Loading State
    if (loading) {
        return <div className={styles.loading}>Loading Message Details...</div>;
    }
    
    // Error State
    if (error) {
        return <div className={styles.errorMessage}>{error}</div>;
    }

    if (!message) {
        return <div className={styles.errorMessage}>Message data is unavailable.</div>;
    }

    // --- Component for a Single Detail Item ---
    const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', padding: '0.8rem', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
            <div style={{ color: 'var(--color-neon-green)', marginRight: '1rem', fontSize: '1.2rem' }}>{icon}</div>
            <div>
                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>{label}</p>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-off-white)' }}>{value}</p>
            </div>
        </div>
    );


    // Main Content
    return (
        <>
            {/* Header Section (Improved) */}
            <div className={styles.pageHeader}>
                {/* Subject Title */}
                <h1 style={{ display: 'flex', alignItems: 'center', fontSize: '2rem' }}>
                    <FaEnvelopeOpenText style={{marginRight: '1rem', color: 'var(--color-neon-green)'}} /> 
                    {message.subject}
                </h1>
                
                {/* Action Buttons */}
                <div className={styles.actionButtonsContainer} style={{marginTop: '0'}}>
                    <button 
                        className={styles.primaryButton} 
                        // Reply mailto link
                        onClick={() => window.open(`mailto:${message.email}?subject=RE: ${message.subject}`, '_blank')}
                        disabled={isUpdating}
                    >
                        <FaReply style={{ marginRight: '0.5rem' }} /> Reply
                    </button>
                    <button 
                        className={styles.dangerButton} 
                        onClick={handleDelete}
                        disabled={isUpdating}
                        style={{ marginLeft: '1rem'}}
                    >
                        {isUpdating ? <FaSpinner className={styles.spin} /> : <FaTrashAlt />}
                        <span style={{ marginLeft: '0.5rem' }}>Delete</span>
                    </button>
                </div>
            </div>

            {/* Main Content: Metadata and Message Body */}
            <div className={styles.dataContainer}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    
                    {/* Metadata Grid */}
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <DetailItem 
                            icon={<FaUser />} 
                            label="Sender Name" 
                            value={message.name} 
                        />
                        <DetailItem 
                            icon={<FaAt />} 
                            label="Sender Email" 
                            value={<a href={`mailto:${message.email}`} style={{ color: 'var(--color-neon-light)', textDecoration: 'none' }}>{message.email}</a>} 
                        />
                        <DetailItem 
                            icon={<FaClock />} 
                            label="Received On" 
                            value={formatDate(message.createdAt)} 
                        />
                    </div>
                    
                    {/* Status Tag */}
                    <span 
                        className={`${styles.statusTag} ${message.status === 'Read' ? styles.statusAccepted : styles.statusPending}`} 
                        style={{minWidth: '120px', fontSize: '1rem'}}
                    >
                        <FaCheckCircle style={{ marginRight: '0.5rem' }}/> {message.status}
                    </span>
                </div>
                
                {/* Message Body */}
                <h2 style={{ marginBottom: '1rem', color: 'var(--color-neon-green)', fontSize: '1.4rem' }}>
                    Message Content:
                </h2>
                <div 
                    className={styles.messageBody} 
                    style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', opacity: 0.85, padding: '1.5rem', backgroundColor: 'var(--color-dark-navy)', borderRadius: '8px' }}
                >
                    <p>{message.message}</p>
                </div>
            </div>
            
            {/* Back to Inbox Link */}
            <Link href="/admin/mail" style={{ textDecoration: 'none' }}>
                <button className={styles.secondaryCtaButton} style={{ 
                    color: 'var(--color-neon-green)', 
                    marginTop: '2rem', 
                    padding: '0.8rem 1.5rem', 
                    border: '1px solid var(--color-neon-green)', 
                    borderRadius: '8px', 
                    backgroundColor: 'transparent', 
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 245, 200, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                    ← Back to Client Inbox
                </button>
            </Link>
        </>
    );
};

export default MessageDetailPage;