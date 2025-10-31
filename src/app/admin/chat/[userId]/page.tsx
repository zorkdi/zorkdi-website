// src/app/admin/chat/[userId]/page.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
// FIX: Unused useRouter import ko hata diya
// FIX: Unused FaUserCircle import ko hata diya
import { FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { 
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit, doc, getDoc,
  Timestamp,
  // FIX: Unused updateDoc import ko hata diya
} from 'firebase/firestore';

import adminStyles from '../../admin.module.css';
import styles from './chat-room.module.css';

// Type definitions
interface Message {
  id: string;
  senderId: string;
  senderType: 'user' | 'admin'; 
  text: string;
  timestamp: Date;
}

interface UserData {
    fullName: string;
    email: string;
    photoURL: string;
}

const AdminChatRoomPage = ({ params }: { params: { userId: string } }) => {
  const { userId } = params;
  const { currentUser } = useAuth();
  // router ko use nahi kiya ja raha, isliye uski import ko pehle hi hata diya gaya hai.
  
  const [client, setClient] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch Client Details
  useEffect(() => {
      const fetchClient = async () => {
          try {
              const docRef = doc(db, 'users', userId);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                  const data = docSnap.data();
                  setClient({
                      fullName: data.fullName || 'Unknown User',
                      email: data.email || 'N/A',
                      photoURL: data.photoURL || '',
                  });
              } else {
                  setError("Client not found.");
              }
          } catch (err) {
              console.error("Error fetching client:", err);
              setError("Failed to load client details.");
          }
      };
      fetchClient();
  }, [userId]);

  // 2. Fetch Messages (Real-time)
  useEffect(() => {
    if (client) {
      setChatLoading(true);
      const messagesCollectionRef = collection(db, 'chats', userId, 'messages');
      const messagesQuery = query(
        messagesCollectionRef,
        orderBy('timestamp', 'desc'), 
        limit(50) 
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp instanceof Timestamp ? doc.data().timestamp.toDate() : new Date(),
        })) as Message[];
        
        setMessages(fetchedMessages.reverse());
        setChatLoading(false);
      }, (err) => { // FIX: Unused 'err' warning ko ignore kiya ja sakta hai, ya isko console.log mein use kiya ja sakta hai
        console.error("Error fetching chat messages:", err); // 'err' is now used
        setChatLoading(false);
      });

      return () => unsubscribe();
    }
  }, [client, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Send Message Handler (Admin Reply)
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || !currentUser) return;

    setInput(''); 

    try {
      const messagesCollectionRef = collection(db, 'chats', userId, 'messages');
      
      await addDoc(messagesCollectionRef, {
        senderId: currentUser.uid,
        senderType: 'admin', // Admin sender type
        text: trimmedInput,
        timestamp: serverTimestamp(),
      });
      
    } catch (sendError: unknown) {
      const errorMessage = sendError instanceof Error ? sendError.message : 'An unknown error occurred during submission.';
      console.error("Error sending message:", sendError);
      alert(`Failed to send message: ${errorMessage}`);
      setInput(trimmedInput); 
    }
  };

  // --- Render Logic ---

  if (chatLoading) {
    return <div className={adminStyles.loading}>Loading chat room...</div>;
  }
  
  if (error || !client) {
    return <div className={adminStyles.errorMessage}>{error || "Client chat thread not found."}</div>;
  }

  // Show Main Chat Interface
  return (
    <div className={styles.chatContainer}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <h2>Chat with: {client.fullName}</h2>
        <p>Email: {client.email}</p>
      </div>

      {/* Messages Container */}
      <div className={styles.messagesContainer}>
        <div className={styles.messageList}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${styles.message} ${msg.senderType === 'user' ? styles.user : styles.admin}`}
            >
              <span className={styles.messageSource}>
                {msg.senderType === 'admin' ? 'You (Admin)' : client.fullName}:
              </span>
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
          placeholder={`Reply to ${client.fullName}...`}
          disabled={!currentUser}
        />
        <button type="submit" className={styles.sendButton} disabled={!input.trim() || !currentUser}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default AdminChatRoomPage;