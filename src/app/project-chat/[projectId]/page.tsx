// src/app/project-chat/[projectId]/page.tsx

"use client";

import { useState, useEffect, useRef } from 'react'; // FIX: ChangeEvent removed
import { useRouter } from 'next/navigation';
import { FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { 
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit, doc, getDoc 
} from 'firebase/firestore';
import Link from 'next/link'; // FIX: Link component import kiya

import styles from './project-chat.module.css';

// Type definitions
interface Message {
  id: string;
  senderId: string;
  senderType: 'user' | 'admin'; // 'user' for client, 'admin' for your company support
  text: string;
  timestamp: Date;
}

interface ProjectData {
    title: string;
    status: string;
    clientId: string; // To check if current user is the owner
}

const ProjectChatPage = ({ params }: { params: { projectId: string } }) => {
  const { projectId } = params;
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch Project Details & Check Authorization
  useEffect(() => {
    if (!currentUser && !loading) {
        // If not logged in, redirect to login
        router.push('/login');
        return;
    }

    if (currentUser) {
        setChatLoading(true);
        const fetchProject = async () => {
            try {
                const docRef = doc(db, 'projects', projectId);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    setError("Project not found or invalid ID.");
                    setChatLoading(false);
                    return;
                }

                const data = docSnap.data() as ProjectData;
                
                // CRITICAL: Check if current user is the owner
                if (data.clientId !== currentUser.uid) {
                    setError("You do not have permission to access this chat.");
                    setChatLoading(false);
                    return;
                }
                
                setProject(data);
                setError(null); // Clear any previous error
                
            } catch (err) {
                console.error("Error fetching project:", err);
                setError("Failed to load project details.");
                setChatLoading(false);
            }
        };
        fetchProject();
    }
  }, [currentUser, loading, projectId, router]);
  
  // 2. Fetch Messages (Real-time)
  useEffect(() => {
    if (project && currentUser) {
      const messagesCollectionRef = collection(db, 'projects', projectId, 'chat');
      const messagesQuery = query(
        messagesCollectionRef,
        orderBy('timestamp', 'desc'), 
        limit(50) 
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as Message[];
        
        setMessages(fetchedMessages.reverse());
        setChatLoading(false);
      }, (err) => {
        console.error("Error fetching project chat messages:", err);
        setError("Failed to load chat history.");
        setChatLoading(false);
      });

      return () => unsubscribe();
    } else if (!loading) {
      setChatLoading(false);
    }
  }, [currentUser, project, projectId, loading]);

  useEffect(() => {
    // Only scroll if there are messages and chat is not loading
    if (!chatLoading && messages.length > 0) {
        scrollToBottom();
    }
  }, [messages, chatLoading]);


  // 3. Send Message Handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || !currentUser || !project) return;

    setInput(''); 

    try {
      const messagesCollectionRef = collection(db, 'projects', projectId, 'chat');
      
      await addDoc(messagesCollectionRef, {
        senderId: currentUser.uid,
        senderType: 'user', // Always 'user' for client
        text: trimmedInput,
        timestamp: serverTimestamp(),
      });
      
    } catch (sendError) {
      console.error("Error sending message:", sendError);
      alert("Failed to send message. Please try again.");
      setInput(trimmedInput); 
    }
  };

  // --- Render Logic ---

  // Show Loading or Error states
  if (loading || chatLoading) {
    return (
      <div className={styles.main}>
        <div className={styles.loading}>
            <p>Loading project chat...</p>
        </div>
      </div>
    );
  }
  
  // Show Prompt if user is not authorized or project not found
  if (error || !project) {
    return (
      <div className={styles.main}>
        <div className={styles.error} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}> {/* FIX: Error box styling ke liye inline styles add kiye */}
          <h1>Error</h1>
          <p>{error || "Project details could not be loaded."}</p>
          <Link href="/my-projects" style={{color: 'var(--color-neon-green)', marginTop: '1rem', textDecoration: 'underline'}}>Go to My Projects</Link>
        </div>
      </div>
    );
  }

  // Show Main Chat Interface
  return (
    <div className={styles.main}>
      <div className={styles.chatContainer}>
        {/* Chat Header (Project Title) */}
        <div className={styles.chatHeader}>
          <h1>Project Discussion: {project.title}</h1>
          <p>ID: {projectId}</p>
        </div>

        {/* Messages Container */}
        <div className={styles.messagesContainer}>
          <div className={styles.messageList}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`${styles.message} ${msg.senderType === 'user' ? styles.user : styles.admin}`}
              >
                {/* Admin/Support messages par indication */}
                {msg.senderType === 'admin' && (
                    <span className={styles.messageSource} style={{color: 'var(--color-secondary-accent)'}}>Support: </span>
                )}
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <form className={styles.inputArea} onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={!currentUser}
          />
          <button type="submit" className={styles.sendButton} disabled={!input.trim() || !currentUser}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectChatPage;