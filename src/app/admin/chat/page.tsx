// src/app/admin/chat/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore'; // Timestamp added for potential future use
import styles from '../admin.module.css';

// User data ka structure
interface UserProfile {
  fullName: string;
  email: string;
}

// Chat thread ka structure (hasUnread added)
interface ChatThread {
  userId: string;
  user: UserProfile | null;
  hasUnread?: boolean; // NAYA: To track unread status
  lastMessageAt?: Timestamp; // Optional: For sorting later
}

const AdminChatListPage = () => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getChatThreads = async () => {
      setLoading(true); // Start loading
      try {
        const chatsCollection = collection(db, 'chats');
        // Optional: Query to order by last message time if needed later
        // const q = query(chatsCollection, orderBy('lastMessageAt', 'desc'));
        const chatsSnapshot = await getDocs(chatsCollection); // Using basic getDocs for now

        const chatThreadsPromises = chatsSnapshot.docs.map(async (chatDoc) => {
          const userId = chatDoc.id;
          const chatData = chatDoc.data(); // Get data from the chat doc itself
          const userDocRef = doc(db, 'users', userId);
          const userDocSnap = await getDoc(userDocRef);

          let userProfile: UserProfile | null = null;
          if (userDocSnap.exists()) {
            userProfile = userDocSnap.data() as UserProfile;
          }

          return {
            userId: userId,
            user: userProfile,
            hasUnread: chatData.hasUnread || false, // NAYA: Fetch hasUnread flag
            lastMessageAt: chatData.lastMessageAt, // Fetch timestamp if needed later
          };
        });

        let resolvedThreads = await Promise.all(chatThreadsPromises);

        // Optional: Sort threads to show unread ones first
        resolvedThreads.sort((a, b) => {
             // Prioritize unread
            if (a.hasUnread && !b.hasUnread) return -1;
            if (!a.hasUnread && b.hasUnread) return 1;
            // Then sort by latest message (if timestamp exists)
            return (b.lastMessageAt?.seconds ?? 0) - (a.lastMessageAt?.seconds ?? 0);
        });


        setThreads(resolvedThreads);

      } catch (error) {
        console.error("Permission Denied or Error Fetching Chats: ", error);
        // Optionally set an error state here
      } finally {
        setLoading(false); // Stop loading
      }
    };

    getChatThreads();
  }, []); // Runs once on mount

  if (loading) {
    return <div className={styles.loading}>Loading chat threads...</div>; // Use admin loading style
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Client Chats</h1>
      </div>

      <div className={styles.dataContainer}>
        {threads.length > 0 ? (
          <div className={styles.chatList}>
            {threads.map(thread => (
              // NAYA: Conditionally add 'unread' class
              <Link
                key={thread.userId}
                href={`/admin/chat/${thread.userId}`}
                // Apply 'unread' class if hasUnread is true
                className={`${styles.chatListItem} ${thread.hasUnread ? styles.unread : ''}`}
              >
                <div className={styles.chatUserInfo}>
                  <h3>{thread.user?.fullName || 'Unknown User'}</h3>
                  <p>{thread.user?.email || thread.userId}</p>
                </div>
                {/* Optional: Display last message time */}
                {/* {thread.lastMessageAt && <span className={styles.lastMessageTime}>{...format time...}</span>} */}
              </Link>
            ))}
          </div>
        ) : (
          <p>No active chat threads found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminChatListPage;