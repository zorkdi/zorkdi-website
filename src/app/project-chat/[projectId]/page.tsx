// src/app/project-chat/[projectId]/page.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext'; // Adjusted path
import styles from './project-chat.module.css';
import adminStyles from '../../admin/admin.module.css'; // NAYA: Import adminStyles

// Firebase functions
import { db } from '../../../firebase'; // Adjusted path
import {
  doc, getDoc, collection, query, orderBy, onSnapshot, addDoc,
  serverTimestamp, Timestamp, setDoc
} from 'firebase/firestore';

// Data types define kiye
interface ProjectDetails {
  projectType: string;
  projectId?: string;
  userId: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  createdAt: Timestamp;
  isRead?: boolean;
}

const ProjectChatPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch project details and chat messages
  useEffect(() => {
    if (currentUser && projectId) {
      const projectDocRef = doc(db, 'project_requests', projectId);

      // 1. Fetch Project details
      getDoc(projectDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const projectData = docSnap.data() as ProjectDetails;
          if (projectData.userId === currentUser.uid) {
            setProjectDetails(projectData);
          } else {
            setError("Access Denied: You are not authorized to view this chat."); setLoading(false);
          }
        } else {
          setError("Project not found."); setLoading(false);
        }
      }).catch(err => {
          console.error("Error fetching project details:", err); setError("Failed to load project details."); setLoading(false);
      });

      // 2. Fetch Messages
      const messagesRef = collection(db, 'project_requests', projectId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedMessages: Message[] = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(fetchedMessages);
        // Only stop loading if project details haven't already set an error
        if (!error) setLoading(false);
      }, (err) => {
        console.error("Error fetching messages:", err); setError("Could not load messages."); setLoading(false);
      });
      return () => unsubscribe();
    } else if (!authLoading && !currentUser) {
        router.push('/login');
    } else if (!projectId) {
        setError("Project ID is missing."); setLoading(false);
    }
  }, [currentUser, projectId, authLoading, router, error]); // Added error to dependencies


  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser || !projectId) return;
    try {
      const messagesRef = collection(db, 'project_requests', projectId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage, sender: 'user', createdAt: serverTimestamp(), isRead: false,
      });
      const projectDocRef = doc(db, 'project_requests', projectId);
      await setDoc(projectDocRef, {
        lastMessageAt: serverTimestamp(), hasUnread: true,
      }, { merge: true });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error); alert("Failed to send message.");
    }
  };

  if (authLoading || (loading && !error)) {
    return <div className={styles.loading}>Loading Chat...</div>;
  }

  if (error) {
    // Now adminStyles is available
    return <div className={adminStyles.errorMessage}>{error}</div>;
  }

   if (!currentUser) { return <div>Please log in to view this chat.</div>; }
   if (!projectDetails && !error) { return <div className={styles.loading}>Verifying access...</div>; }
   // Added a check specifically for the access denied case after details load attempt
   if (!projectDetails && error.startsWith("Access Denied")) {
       return <div className={adminStyles.errorMessage}>{error}</div>;
   }


  // Rest of the component...
  return (
    <main className={styles.main}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h1>{projectDetails?.projectType || 'Project'} Chat</h1>
          {projectDetails?.projectId && <p>Project ID: {projectDetails.projectId}</p>}
        </div>

        <div className={styles.messagesContainer}>
          <div className={styles.messageList}>
            <div ref={messagesEndRef} />
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${msg.sender === 'user' ? styles.user : styles.admin}`}
              >
                {msg.text}
              </div>
            ))}
             {!loading && messages.length === 0 && <p style={{textAlign: 'center', opacity: 0.7}}>No messages yet for this project.</p>}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className={styles.inputArea}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!projectDetails}
          />
          <button type="submit" className={styles.sendButton} disabled={!projectDetails}>Send</button>
        </form>
      </div>
    </main>
  );
};

export default ProjectChatPage;