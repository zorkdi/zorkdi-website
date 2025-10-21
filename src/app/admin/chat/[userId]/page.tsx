// src/app/admin/chat/[userId]/page.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/firebase';
import {
  doc, getDoc, collection, query, orderBy, onSnapshot, addDoc,
  serverTimestamp, Timestamp, where, getDocs, setDoc, updateDoc
} from 'firebase/firestore';
import styles from './chat-room.module.css';
import adminStyles from '../../admin.module.css';

// Data types
interface UserProfile {
  fullName: string;
  email: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  createdAt: Timestamp;
  source: 'general' | string; // 'general' or Firestore document ID of the project_request
  sourceDisplay?: string;
}

interface ProjectStub {
  id: string;
  projectType: string;
  projectId?: string;
}

const AdminChatRoomPage = () => {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectsMap, setProjectsMap] = useState<Map<string, ProjectStub>>(new Map());
  const [replyTarget, setReplyTarget] = useState<string>('general');
  const [replyTargetDisplay, setReplyTargetDisplay] = useState<string>('General Chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedRead = useRef(false);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Determine reply target based on the last message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setReplyTarget(lastMessage.source);
      if (lastMessage.source === 'general') {
        setReplyTargetDisplay('General Chat');
      } else {
        const projectInfo = projectsMap.get(lastMessage.source);
        // Use custom ID (ZDI-001) if available, otherwise fallback to type
        setReplyTargetDisplay(`Project: ${projectInfo?.projectId || projectInfo?.projectType || 'Unknown'}`);
      }
    } else {
      setReplyTarget('general');
      setReplyTargetDisplay('General Chat');
    }
  }, [messages, projectsMap]);


  // Fetch user details, projects, general messages, and project messages
  useEffect(() => {
    // ... (fetching logic remains the same) ...
     if (userId) {
      setLoading(true);
      setError('');
      hasMarkedRead.current = false; // Reset read marker on userId change
      let generalChatUnsubscribe: (() => void) | null = null;
      const projectChatUnsubscribes: (() => void)[] = [];
      const tempProjectsMap = new Map<string, ProjectStub>();

      // 1. Fetch user profile
      const userDocRef = doc(db, 'users', userId);
      getDoc(userDocRef)
        .then(docSnap => { setUser(docSnap.exists() ? docSnap.data() as UserProfile : { fullName: "Unknown User", email: userId }); })
        .catch(err => { setError("Could not fetch user details."); });

      // Function to mark the general chat thread as read
      const markGeneralChatAsRead = async () => {
        if (!hasMarkedRead.current) {
          try {
            const chatDocRef = doc(db, 'chats', userId);
            // Use setDoc with merge: true to handle non-existent docs gracefully
            await setDoc(chatDocRef, { hasUnread: false }, { merge: true });
            hasMarkedRead.current = true;
            console.log("Marked general chat as read for:", userId);
          } catch (err) {
            console.warn("Could not mark general chat as read:", err);
            hasMarkedRead.current = true;
          }
        }
      };


      // Function to fetch messages
      const fetchMessages = (path: string, source: string, sourceDisplay: string, callback: (newMessages: Message[]) => void): (() => void) => {
        const messagesRef = collection(db, path);
        const q = query(messagesRef, orderBy('createdAt', 'asc'));
        return onSnapshot(q, (querySnapshot) => {
          const fetchedMessages: Message[] = querySnapshot.docs.map(doc => ({ id: doc.id, source: source, sourceDisplay: sourceDisplay, ...doc.data()} as Message));
          callback(fetchedMessages);
          if (source === 'general') {
              markGeneralChatAsRead(); // Mark read after general messages arrive
          }
        }, (err) => { console.error(`Error fetching messages from ${path}:`, err); });
      };

      // 2. Fetch General Chat messages
      generalChatUnsubscribe = fetchMessages(
        `chats/${userId}/messages`, 'general', 'General Chat',
        (generalMessages) => {
          setMessages(prev => [...prev.filter(m => m.source !== 'general'), ...generalMessages].sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0)));
          setLoading(false);
        }
      );

      // 3. Fetch Project messages
      const fetchProjectMessages = async () => {
        try {
          const projectsRef = collection(db, 'project_requests');
          const q = query(projectsRef, where("userId", "==", userId));
          const projectsSnapshot = await getDocs(q);
          projectsSnapshot.forEach((projectDoc) => {
            const project = { id: projectDoc.id, ...projectDoc.data() } as ProjectStub;
            const projectSourceId = projectDoc.id; // Firestore Doc ID
            const projectSourceDisplay = project.projectId || project.projectType; // User-friendly
            tempProjectsMap.set(projectSourceId, project);
            const unsubscribe = fetchMessages(
              `project_requests/${projectDoc.id}/messages`, projectSourceId, projectSourceDisplay,
              (projectMessages) => {
                setMessages(prev => [...prev.filter(m => m.source !== projectSourceId), ...projectMessages].sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0)));
              }
            );
            projectChatUnsubscribes.push(unsubscribe);
          });
          setProjectsMap(tempProjectsMap);
        } catch (err) { console.error("Error fetching projects for chat:", err); setError("Could not find projects for this user."); setLoading(false); }
      };
      fetchProjectMessages();

      // Cleanup
      return () => {
        if (generalChatUnsubscribe) generalChatUnsubscribe();
        projectChatUnsubscribes.forEach(unsub => unsub());
      };
    } else { setLoading(false); setError("User ID is missing."); }
  }, [userId]);

  // Handle sending reply to the correct target
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !userId) return;

    let messagePath: string;
    let parentDocPath: string | null = null; // Path to update timestamp/unread for parent

    // Determine the path based on replyTarget state
    if (replyTarget === 'general') {
      messagePath = `chats/${userId}/messages`;
      parentDocPath = `chats/${userId}`; // General chat parent doc
    } else {
      // replyTarget should be the Firestore document ID of the project_request
      messagePath = `project_requests/${replyTarget}/messages`;
      parentDocPath = `project_requests/${replyTarget}`; // Project chat parent doc
    }

    try {
      // 1. Add the new message
      const messagesRef = collection(db, messagePath);
      await addDoc(messagesRef, {
        text: newMessage,
        sender: 'admin', // Send as admin
        createdAt: serverTimestamp(),
        // We don't mark admin messages as unread for the admin
      });

      // 2. Update the parent document's timestamp (and potentially user info)
      if (parentDocPath) {
          const parentDocRef = doc(db, parentDocPath);
          const updateData: { lastMessageAt: any; userEmail?: string; userFullName?: string; hasUnread?: boolean } = {
              lastMessageAt: serverTimestamp(),
              // We reset hasUnread flag IF the ADMIN is the one sending the message
              // Assuming client shouldn't get an 'unread' notification for admin's own message
              // hasUnread: false // Optional: Decide if admin sending marks it read for client immediately
          };
          // Include user info only for the general chat parent doc
          if (replyTarget === 'general' && user) {
             updateData.userEmail = user.email;
             updateData.userFullName = user.fullName;
          }
          // Use setDoc with merge: true to handle potential non-existence
          await setDoc(parentDocRef, updateData, { merge: true });
      }

      setNewMessage(''); // Clear input box
    } catch (error) {
      console.error("Error sending message: ", error);
      alert("Failed to send message.");
    }
  };

  // Render logic...
  if (loading && messages.length === 0) { return <div className={styles.loading}>Loading conversation...</div>; }
  if (error) { return <div className={adminStyles.errorMessage}>{error}</div>; }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>{user?.fullName || 'Client Chat'}</h2>
        <p>{user?.email || userId}</p>
      </div>
      <div className={styles.messagesContainer}>
        <div className={styles.messageList}>
          <div ref={messagesEndRef} />
          {messages.map((msg) => (
            <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.user : styles.admin}`}>
              {msg.source !== 'general' && (<span className={styles.messageSource}>[{msg.sourceDisplay || 'Project'}] </span>)}
              {msg.text}
            </div>
          ))}
          {!loading && messages.length === 0 && <p style={{textAlign: 'center', opacity: 0.7}}>No messages yet.</p>}
        </div>
      </div>
      <div className={styles.replyContext}>Replying in: <strong>{replyTargetDisplay}</strong></div>
      <form onSubmit={handleSendMessage} className={styles.inputArea}>
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your reply..." />
        <button type="submit" className={styles.sendButton}>Send</button>
      </form>
    </div>
  );
};

export default AdminChatRoomPage;