// src/app/admin/projects/[id]/page.tsx

"use client";

import { useState, useEffect, ChangeEvent, useRef } from 'react'; // useRef added
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/firebase';
import {
  doc, getDoc, updateDoc, Timestamp, collection, query, orderBy,
  onSnapshot, addDoc, serverTimestamp, setDoc // Added setDoc just in case, though updateDoc is primary
} from 'firebase/firestore';
import adminStyles from '../../admin.module.css';
import styles from './project-details.module.css';

// Project request structure
interface ProjectRequest {
  id: string;
  fullName: string;
  email: string;
  projectType: string;
  description: string;
  budget: string;
  country: string;
  submittedAt: Timestamp;
  status: string;
  projectId?: string;
  userId: string; // Added userId for chat security check
  hasUnread?: boolean; // Added hasUnread
}

// Message structure
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  createdAt: Timestamp;
}

const ProjectDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const docId = params.id as string;

  const [project, setProject] = useState<ProjectRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [customProjectId, setCustomProjectId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedProjectRead = useRef(false); // Ref for project read status

  // Fetch project data and mark as read
  useEffect(() => {
    if (docId) {
      const fetchProjectAndMarkRead = async () => {
        setLoading(true);
        setError('');
        hasMarkedProjectRead.current = false; // Reset on ID change
        try {
          const docRef = doc(db, 'project_requests', docId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as ProjectRequest;
            setProject(data);
            setStatus(data.status);
            setCustomProjectId(data.projectId || '');

            // Mark project as read if it has unread messages
            if (data.hasUnread && !hasMarkedProjectRead.current) {
              await updateDoc(docRef, { hasUnread: false });
              hasMarkedProjectRead.current = true;
              console.log("Marked project as read:", docId);
            } else {
                 hasMarkedProjectRead.current = true; // Mark as done even if already read
            }

          } else {
            setError('Project request not found.');
          }
        } catch (err) {
          setError('Failed to fetch project details.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProjectAndMarkRead();
    }
  }, [docId]);

  // Fetch chat messages in real-time
  useEffect(() => {
    if (project) { // Fetch messages only after project details are loaded
      const messagesRef = collection(db, 'project_requests', project.id, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedMessages: Message[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(fetchedMessages);
      }, (err) => { console.error("Error fetching messages:", err); setError("Could not load messages."); });
      return () => unsubscribe();
    }
  }, [project]);

  // Auto-scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Save changes
  const handleSaveChanges = async () => {
    if (!docId) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'project_requests', docId);
      await updateDoc(docRef, { status: status, projectId: customProjectId });
      alert('Changes saved successfully!');
    } catch (err) { console.error('Error updating document: ', err); alert('Failed to save changes.'); }
    finally { setIsSaving(false); }
  };

  // Handle sending a reply
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !project) return;
    const messagesRef = collection(db, 'project_requests', project.id, 'messages');
    try {
      await addDoc(messagesRef, { text: newMessage, sender: 'admin', createdAt: serverTimestamp() });
      setNewMessage('');
    } catch (error) { console.error("Error sending message: ", error); alert("Failed to send message."); }
  };

  // Render logic...
  if (loading) { return <div>Loading project details...</div>; }
  if (error) { return <div className={adminStyles.errorMessage}>{error}</div>; }
  if (!project) { return <div>No project data found.</div>; }

  return (
    <div>
      <div className={adminStyles.pageHeader}> <h1>Manage Project: {project.projectType}</h1> </div>
      <div className={`${adminStyles.dataContainer} ${styles.detailsContainer}`}>
        {/* Project Details */}
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}><label>Client Name</label><p>{project.fullName}</p></div>
          <div className={styles.detailItem}><label>Client Email</label><p>{project.email}</p></div>
          <div className={styles.detailItem}><label>Country</label><p>{project.country}</p></div>
          <div className={styles.detailItem}><label>Budget</label><p>{project.budget}</p></div>
          <div className={`${styles.detailItem} ${styles.fullWidth}`}><label>Project Description</label><p className={styles.descriptionBox}>{project.description}</p></div>
        </div>
        <hr className={styles.divider} />
        {/* Management Section */}
        <div className={styles.managementGrid}>
          <div className={styles.formGroup}> <label htmlFor="status">Project Status</label> <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}> <option>Pending</option> <option>Accepted</option> <option>In Progress</option> <option>Completed</option> <option>Rejected</option> </select> </div>
          <div className={styles.formGroup}> <label htmlFor="projectId">Assign Project ID (e.g., ZDI-001)</label> <input id="projectId" type="text" value={customProjectId} onChange={(e) => setCustomProjectId(e.target.value)} placeholder="ZDI-001" /> </div>
        </div>
        <button onClick={handleSaveChanges} className={adminStyles.primaryButton} disabled={isSaving}> {isSaving ? 'Saving...' : 'Save Changes'} </button>
        {/* Chat Section */}
        <div className={styles.chatSection}>
          <div className={styles.chatSectionHeader}>Project Chat</div>
          <div className={styles.messagesContainer}> <div className={styles.messageList}> <div ref={messagesEndRef} /> {messages.map((msg) => ( <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.user : styles.admin}`} > {msg.text} </div> ))} {!loading && messages.length === 0 && <p style={{textAlign: 'center', opacity: 0.7}}>No messages yet.</p>} </div> </div>
          <form onSubmit={handleSendMessage} className={styles.inputArea}> <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your reply..." /> <button type="submit" className={styles.sendButton}>Send</button> </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage; // Sirf ek hi default export