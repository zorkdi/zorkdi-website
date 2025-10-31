// app/admin/mail/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import Link from 'next/link'; // <--- YAHAN FIX KIYA GAYA HAI: Missing 'Link' import
import { FaEnvelope, FaClock, FaTrashAlt } from 'react-icons/fa';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot, 
    doc, 
    deleteDoc, 
    Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase';

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

const ClientMailPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to format Firebase Timestamp to a readable string
    const formatTimestamp = (timestamp: Timestamp): string => {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate();
        const now = new Date();
        const diffInDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

        if (diffInDays < 1) {
            // Same day: e.g., "2 hours ago"
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600);
            if (diffInHours < 1) return `${Math.floor(diffInHours * 60)} mins ago`;
            return `${Math.floor(diffInHours)} hours ago`;
        } else if (diffInDays < 7) {
            // Less than a week: e.g., "3 days ago"
            return `${Math.floor(diffInDays)} days ago`;
        } else {
            // More than a week: e.g., "Oct 31, 2025"
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };
    
    // Real-time data fetching using onSnapshot
    useEffect(() => {
        // Query: 'messages' collection, ordered by 'createdAt' (newest first)
        const q = query(
            collection(db, 'messages'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages: Message[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedMessages.push({
                    id: doc.id,
                    name: data.name,
                    email: data.email,
                    subject: data.subject,
                    message: data.message,
                    status: data.status,
                    createdAt: data.createdAt,
                } as Message);
            });

            setMessages(fetchedMessages);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Firestore Mail Fetch Error:", err);
            setError("Failed to load messages. Check console for details.");
            setLoading(false);
        });

        // Cleanup function for real-time listener
        return () => unsubscribe();
    }, []);

    // Action: Mark all 'Read' messages as 'Archived' and delete them from main view (optional cleanup)
    const handleArchiveAllRead = async () => {
        if (!confirm("Are you sure you want to archive all read messages?")) return;

        const readMessages = messages.filter(msg => msg.status === 'Read');
        if (readMessages.length === 0) return;

        try {
            await Promise.all(readMessages.map(async (msg) => {
                 const docRef = doc(db, 'messages', msg.id);
                 await deleteDoc(docRef);
            }));
            
            alert("All read messages have been archived/deleted successfully.");
        } catch (e) {
            console.error("Error archiving messages:", e);
            alert("Failed to archive messages.");
        }
    };

    // Filtering logic to show unread count
    const unreadCount = messages.filter(msg => msg.status === 'Unread').length;

    // Loading and Error State rendering
    if (loading) {
        return <div className={styles.loading}>Loading Client Inbox...</div>;
    }
    
    if (error) {
        return <div className={styles.errorMessage}>{error}</div>;
    }

    return (
        <>
            <div className={styles.pageHeader}>
                <h1>Client Inbox / Messages</h1>
                <div className={styles.actionButtonsContainer} style={{marginTop: '0'}}>
                    <span style={{color: 'var(--color-neon-green)', fontWeight: 600}}>
                        {unreadCount} Unread
                    </span>
                    <button 
                        className={styles.primaryButton} 
                        onClick={handleArchiveAllRead}
                        disabled={messages.filter(msg => msg.status === 'Read').length === 0}
                        style={{ marginLeft: '1rem', padding: '0.6rem 1.2rem'}}
                    >
                        <FaTrashAlt style={{ marginRight: '0.5rem' }} /> Archive Read
                    </button>
                </div>
            </div>

            <div className={styles.dataContainer}>
                
                {/* Message List */}
                <div className={styles.chatList}>
                    {messages.length > 0 ? (
                        messages.map((message) => (
                            <Link 
                                key={message.id} 
                                // Link component yahan use ho raha tha
                                href={`/admin/mail/${message.id}`} 
                                className={`${styles.chatListItem} ${message.status === 'Unread' ? styles.unread : ''}`}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    
                                    {/* User Info */}
                                    <div className={styles.chatUserInfo}>
                                        <h3 style={{ marginBottom: '0.2rem' }}>
                                            {message.status === 'Unread' && <FaEnvelope style={{ marginRight: '0.75rem', color: 'var(--color-neon-green)' }} />}
                                            {message.name}
                                            <span style={{ fontSize: '0.85rem', opacity: 0.6, fontWeight: 400, marginLeft: '1rem' }}>
                                                &lt;{message.email}&gt;
                                            </span>
                                        </h3>
                                        <p style={{ opacity: 0.9, fontWeight: 600, color: 'var(--color-neon-light)' }}>
                                            {message.subject}
                                        </p>
                                        <p style={{ marginTop: '0.5rem', opacity: 0.7, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {message.message.substring(0, 100) + (message.message.length > 100 ? '...' : '')}
                                        </p>
                                    </div>
                                    
                                    {/* Timestamp & Status */}
                                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                        <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>
                                            <FaClock style={{ marginRight: '0.5rem' }} />
                                            {formatTimestamp(message.createdAt)}
                                        </p>
                                        <span 
                                            className={`${styles.statusTag} ${message.status === 'Unread' ? styles.statusPending : styles.statusAccepted}`} 
                                            style={{marginTop: '0.5rem', display: 'inline-block'}}
                                        >
                                            {message.status}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p style={{textAlign: 'center', padding: '2rem', opacity: 0.8}}>No new messages found in the inbox.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default ClientMailPage;