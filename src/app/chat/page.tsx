// src/app/chat/page.tsx

"use client";

import { useState, useEffect, useRef } from 'react'; // FIX: ChangeEvent ko hata diya
import Link from 'next/link';
// FIX: Image, FaUserCircle, FaRobot ko hata diya
import { FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';

import styles from './chat.module.css';

// Type definitions
interface Message {
  id: string;
  senderId: string; // User ID (currentUser.uid)
  senderType: 'user' | 'admin'; // For styling
  text: string;
  timestamp: Date;
}

const ChatPage = () => {
  const { currentUser, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch Messages (Real-time)
  useEffect(() => {
    if (currentUser) {
      setChatLoading(true);
      const messagesCollectionRef = collection(db, 'chats', currentUser.uid, 'messages');
      const messagesQuery = query(
        messagesCollectionRef,
        orderBy('timestamp', 'desc'), // Latest messages first (for reverse display)
        limit(50) // Limit to 50 messages
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as Message[];
        
        // Reverse array back to chronological order for correct display
        setMessages(fetchedMessages.reverse());
        setChatLoading(false);
      }, (error) => {
        console.error("Error fetching chat messages:", error);
        setChatLoading(false);
      });

      return () => unsubscribe();
    } else if (!loading) {
      setChatLoading(false);
      setMessages([]);
    }
  }, [currentUser, loading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 2. Send Message Handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || !currentUser) return;

    setInput(''); // Clear input immediately

    try {
      const messagesCollectionRef = collection(db, 'chats', currentUser.uid, 'messages');
      
      await addDoc(messagesCollectionRef, {
        senderId: currentUser.uid,
        senderType: 'user', // Always 'user' for client side chat input
        text: trimmedInput,
        timestamp: serverTimestamp(),
      });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during submission.';
      console.error("Error sending message:", error);
      alert(`Failed to send message: ${errorMessage}`);
      setInput(trimmedInput); // Restore input on failure
    }
  };

  // --- Render Logic ---

  // Show Loading while Auth is checking or Chat is fetching
  if (loading || chatLoading) {
    return (
      <div className={styles.main}>
        <div className={styles.loading}>
            <p>Connecting to Chat...</p>
        </div>
      </div>
    );
  }

  // Show Prompt if user is not logged in
  if (!currentUser) {
    return (
      <div className={styles.main}>
        <div className={styles.loginPrompt}>
          <h1>Chat Access Restricted</h1>
          <p>Please login or sign up to start a conversation with our support team.</p>
          <Link href="/login">Login / Sign Up</Link>
        </div>
      </div>
    );
  }

  // Show Main Chat Interface
  return (
    <div className={styles.main}>
      <div className={styles.chatContainer}>
        {/* Chat Header (Static for Client Chat) */}
        <div className={styles.chatHeader}>
          <h1>Chat with Support</h1>
        </div>

        {/* Messages Container */}
        <div className={styles.messagesContainer}>
          <div className={styles.messageList}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`${styles.message} ${msg.senderType === 'user' ? styles.user : styles.admin}`}
              >
                {/* NAYA: Admin messages par thoda indication */}
                {msg.senderType === 'admin' && (
                    <span className={styles.messageSource} style={{color: 'var(--color-neon-green)'}}>Support: </span>
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

export default ChatPage;