// src/app/admin/chat/page.tsx

"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
// FIX: useRouter ki zaroorat nahi hai
import { db } from '@/firebase';
import { 
  collection, query, onSnapshot, orderBy, Timestamp, limit, 
  // FIX: Unused 'where' ko hata diya
} from 'firebase/firestore';

import styles from '../admin.module.css';

// Type definitions
// FIX: Message interface ko yahan se hata diya kyunki woh sirf AdminChatRoomPage mein use ho raha tha
interface ChatThread {
  userId: string;
  clientName: string;
  clientEmail: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
}

const AdminChatPage = () => {
  // FIX: useRouter ko hata diya
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 1. Fetch Chat Threads (Real-time)
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Yahan hum 'users' collection ko threads ki tarah use kar rahe hain.
    const usersCollectionRef = collection(db, 'users');
    const usersQuery = query(usersCollectionRef, orderBy('createdAt', 'desc')); 

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const fetchedUsers = snapshot.docs.map(doc => ({
            userId: doc.id,
            clientName: doc.data().fullName || doc.data().email.split('@')[0],
            clientEmail: doc.data().email,
            lastMessage: 'Loading...', // Temporary value
            timestamp: new Date(0), // Temporary value
            unreadCount: 0,
        })) as ChatThread[];
        
        // Asynchronously fetch last message/unread count for each thread
        const resolveThreadsPromises = fetchedUsers.map(async (thread) => {
            const messagesCollectionRef = collection(db, 'chats', thread.userId, 'messages');
            const messagesQuery = query(messagesCollectionRef, orderBy('timestamp', 'desc'), limit(1));
            
            const messagesUnsubscribe = onSnapshot(messagesQuery, (msgSnapshot) => {
                const latestMsg = msgSnapshot.docs[0];
                if (latestMsg) {
                    const data = latestMsg.data();
                    // NOTE: Unread count logic is complex in real-time, leaving it at 0 for now.
                    setThreads(prevThreads => prevThreads.map(pT => 
                        pT.userId === thread.userId 
                        ? {
                            ...pT,
                            lastMessage: data.text,
                            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
                            // In a real app, unreadCount would be calculated here.
                            unreadCount: 0 
                          } 
                        : pT
                    ));
                } else {
                    // No messages yet, setting default
                    setThreads(prevThreads => prevThreads.map(pT => 
                        pT.userId === thread.userId 
                        ? { ...pT, lastMessage: 'No messages yet.', timestamp: new Date() } 
                        : pT
                    ));
                }
            });
            return messagesUnsubscribe;
        });

        // Initial setup for threads
        setThreads(fetchedUsers);
        setIsLoading(false);
        
        // We return an array of functions to unsubscribe from the message listeners
        return () => {
            resolveThreadsPromises.forEach(p => p.then(unsub => unsub()));
        };

    }, (err) => {
        console.error("Error fetching users for chat:", err);
        setError("Failed to load chat list. Check console.");
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // FIX: Error ko theek karne ke liye, sorted threads ko useMemo mein daala
  const sortedThreads = useMemo(() => {
    return threads.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [threads]);

  // Status Tag utility (unread messages ke liye)
  const getUnreadClass = (unreadCount: number) => {
    return unreadCount > 0 ? styles.chatListItem + ' ' + styles.unread : styles.chatListItem;
  };


  return (
    <>
      <div className={styles.pageHeader}>
        <h1>Client Chat List</h1>
        {/* NAYA: Placeholder for "Mark All Read" button */}
        <button className={styles.primaryButton} style={{opacity: 0.5}}>Mark All Read</button>
      </div>

      <div className={styles.dataContainer}>
        {isLoading ? (
          <div className={styles.loading}>Loading chat threads...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : sortedThreads.length === 0 ? (
          <p style={{textAlign: 'center', opacity: 0.8}}>No clients have started a chat yet.</p>
        ) : (
            <div className={styles.chatList}>
                {sortedThreads.map((thread) => (
                    <Link 
                        href={`/admin/chat/${thread.userId}`} 
                        key={thread.userId}
                        className={getUnreadClass(thread.unreadCount)}
                    >
                        <div className={styles.chatUserInfo}>
                            <h3>{thread.clientName} {thread.unreadCount > 0 && `(${thread.unreadCount})`}</h3>
                            <p>{thread.lastMessage}</p>
                            <span style={{float: 'right', opacity: 0.6, fontSize: '0.8rem'}}>
                                {thread.timestamp.toLocaleTimeString()} - {thread.timestamp.toLocaleDateString()}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </>
  );
};

export default AdminChatPage;