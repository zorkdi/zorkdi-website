// app/chat/page.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import styles from './chat.module.css';

// Firebase functions (doc and setDoc already imported)
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, doc, setDoc } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  createdAt: Timestamp;
  isRead?: boolean; // NAYA: Added isRead flag
}

const ChatPage = () => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (currentUser) {
      const messagesRef = collection(db, 'chats', currentUser.uid, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedMessages: Message[] = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;

    try {
      // Step 1: Add message with isRead: false
      const messagesRef = collection(db, 'chats', currentUser.uid, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        sender: 'user',
        createdAt: serverTimestamp(),
        isRead: false, // NAYA: Mark message as unread initially
      });

      // Step 2: Update parent document with hasUnread: true
      const chatDocRef = doc(db, 'chats', currentUser.uid);
      await setDoc(chatDocRef, {
        lastMessageAt: serverTimestamp(),
        userEmail: currentUser.email,
        hasUnread: true, // NAYA: Set flag indicating unread message
      }, { merge: true });

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!currentUser) {
    return (
      <div className={styles.loginPrompt}>
        Please <Link href="/login">log in</Link> to access the chat.
      </div>
    );
  }

  // Rest of the component remains the same...
  return (
    <main className={styles.main}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h1>Chat with Support</h1>
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
          </div>
        </div>
        
        <form onSubmit={handleSendMessage} className={styles.inputArea}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit" className={styles.sendButton}>Send</button>
        </form>
      </div>
    </main>
  );
};

export default ChatPage;