// src/app/admin/projects/[id]/page.tsx

"use client";

import { useState, useEffect, useRef } from 'react'; // FIX: ChangeEvent ko hata diya
// FIX: Link ko hata diya kyunki woh use nahi ho raha tha
import { FaPaperPlane, FaCheckCircle } from 'react-icons/fa'; // FIX: FaUserCircle, FaTimesCircle, FaClock ko hata diya
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { 
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit, doc, getDoc, updateDoc,
  Timestamp 
} from 'firebase/firestore';

import adminStyles from '../../admin.module.css';
import styles from './project-details.module.css';

// Type definitions
type ProjectStatus = 'Pending' | 'Accepted' | 'InProgress' | 'Completed' | 'Rejected';

interface ProjectRequest {
  id: string;
  title: string;
  status: ProjectStatus;
  clientId: string;
  clientName: string;
  clientEmail: string;
  mobile: string;
  serviceType: string;
  budget: string;
  timeline: string;
  description: string;
  createdAt: Date;
}

interface Message {
  id: string;
  senderId: string;
  senderType: 'user' | 'admin'; 
  text: string;
  timestamp: Date;
}

const statusOptions: ProjectStatus[] = ['Pending', 'Accepted', 'InProgress', 'Completed', 'Rejected'];

const AdminProjectDetailsPage = ({ params }: { params: { id: string } }) => {
  const { id: projectId } = params;
  const { currentUser, loading: authLoading } = useAuth();
  
  const [project, setProject] = useState<ProjectRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ProjectStatus>('Pending');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Status Tag utility (admin styles se uthaya)
  const getStatusClass = (status: ProjectStatus) => {
    switch (status) {
      case 'Pending':
        return adminStyles.statusPending;
      case 'Accepted':
        return adminStyles.statusAccepted;
      case 'InProgress':
        return adminStyles.statusInProgress;
      case 'Completed':
        return adminStyles.statusCompleted;
      case 'Rejected':
        return adminStyles.statusRejected;
      default:
        return adminStyles.statusPending;
    }
  };

  // 1. Fetch Project Details
  useEffect(() => {
    if (!currentUser && !authLoading) {
        // Auth check is handled by layout.tsx, but this is a fallback
        return; 
    }

    if (currentUser) {
        setIsLoading(true);
        const fetchProject = async () => {
            try {
                const docRef = doc(db, 'projects', projectId);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    setError("Project request not found.");
                    return;
                }

                const data = docSnap.data();
                const projectData = {
                    id: projectId,
                    title: data.title || 'Untitled Request',
                    status: data.status as ProjectStatus || 'Pending',
                    clientId: data.clientId || '',
                    clientName: data.clientName || 'Unknown',
                    clientEmail: data.clientEmail || 'N/A',
                    mobile: data.mobile || 'N/A',
                    serviceType: data.serviceType || 'Unknown',
                    budget: data.budget || 'N/A',
                    timeline: data.timeline || 'N/A',
                    description: data.description || 'No description provided.',
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(), 
                } as ProjectRequest;
                
                setProject(projectData);
                setNewStatus(projectData.status); // Set initial status for dropdown
                
            } catch (err) {
                console.error("Error fetching project:", err);
                setError("Failed to load project details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProject();
    }
  }, [currentUser, authLoading, projectId]);

  // 2. Fetch Chat Messages (Real-time)
  useEffect(() => {
    if (project) {
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
          timestamp: doc.data().timestamp instanceof Timestamp ? doc.data().timestamp.toDate() : new Date(),
        })) as Message[];
        
        setMessages(fetchedMessages.reverse());
      }, (err) => {
        console.error("Error fetching project chat messages:", err);
        // Chat error ko main error state mein nahi daalenge, sirf console mein log karenge
      });

      return () => unsubscribe();
    }
  }, [project, projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Status Update Handler
  const handleStatusUpdate = async () => {
    if (!project || newStatus === project.status) return;

    setIsUpdating(true);
    setError(null);
    try {
        const docRef = doc(db, 'projects', projectId);
        await updateDoc(docRef, {
            status: newStatus,
        });
        // State update will be handled by onSnapshot in useEffect
        alert(`Project status updated to ${newStatus}`);
    } catch (err) {
        console.error("Error updating status:", err);
        setError("Failed to update project status.");
    } finally {
        setIsUpdating(false);
    }
  };

  // 4. Send Message Handler (Admin Reply)
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || !currentUser || !project) return;

    setInput(''); 

    try {
      const messagesCollectionRef = collection(db, 'projects', projectId, 'chat');
      
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

  if (isLoading) {
    return <div className={adminStyles.loading}>Loading Project Details...</div>;
  }
  
  if (error || !project) {
    return <div className={adminStyles.errorMessage}>{error || "Project not found."}</div>;
  }

  return (
    <>
      <div className={adminStyles.pageHeader}>
        <h1>{project.title}</h1>
        <span className={`${adminStyles.statusTag} ${getStatusClass(project.status)}`}>
            {project.status}
        </span>
      </div>

      <div className={styles.detailsContainer}>
        
        {/* --- Project Details --- */}
        <div className={adminStyles.dataContainer} style={{marginBottom: '3rem'}}>
            <h2 style={{color: 'var(--color-neon-green)', marginBottom: '1.5rem'}}>Project Overview</h2>
            <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                    <label>Requested By</label>
                    <p>{project.clientName}</p>
                </div>
                <div className={styles.detailItem}>
                    <label>Client Email</label>
                    <p>{project.clientEmail}</p>
                </div>
                <div className={styles.detailItem}>
                    <label>Mobile</label>
                    <p>{project.mobile}</p>
                </div>
                <div className={styles.detailItem}>
                    <label>Requested Service</label>
                    <p>{project.serviceType}</p>
                </div>
                <div className={styles.detailItem}>
                    <label>Budget</label>
                    <p>{project.budget}</p>
                </div>
                <div className={styles.detailItem}>
                    <label>Timeline</label>
                    <p>{project.timeline}</p>
                </div>
                <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                    <label>Requested On</label>
                    <p>{project.createdAt.toLocaleDateString()} at {project.createdAt.toLocaleTimeString()}</p>
                </div>
                <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                    <label>Description</label>
                    <p className={styles.descriptionBox}>{project.description}</p>
                </div>
            </div>
        </div>

        <hr className={styles.divider} />
        
        {/* --- Project Management & Chat --- */}
        <div className={styles.managementGrid}>
            
            {/* Left Column: Status Update */}
            <div className={adminStyles.dataContainer}>
                <h2 style={{color: 'var(--color-secondary-accent)', marginBottom: '1.5rem'}}>Project Status Control</h2>
                <div className={styles.formGroup}>
                    <label htmlFor="statusSelect">Update Status</label>
                    <select 
                        id="statusSelect" 
                        value={newStatus} 
                        onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                        disabled={isUpdating}
                    >
                        {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleStatusUpdate}
                    className={adminStyles.primaryButton}
                    disabled={isUpdating || newStatus === project.status}
                    style={{width: '100%', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                >
                    {isUpdating ? 'Updating...' : <><FaCheckCircle style={{marginRight: '0.5rem'}}/> Confirm Status Change</>}
                </button>
            </div>
            
            {/* Right Column: Chat Section */}
            <div className={styles.chatSection}>
                <div className={styles.chatSectionHeader}>
                    Client Chat ({project.clientName})
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
                                    {msg.senderType === 'admin' ? 'You' : project.clientName}:
                                </span>
                                {msg.text}
                                <span style={{fontSize: '0.7em', opacity: 0.5, marginLeft: '0.5rem', whiteSpace: 'nowrap'}}>
                                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                        {messages.length === 0 && (
                            <p style={{textAlign: 'center', opacity: 0.6, marginTop: '2rem'}}>
                                Start the conversation!
                            </p>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <form className={styles.inputArea} onSubmit={handleSend}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Reply to client..."
                        disabled={!currentUser}
                    />
                    <button type="submit" className={styles.sendButton} disabled={!input.trim() || !currentUser}>
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </div>
        
      </div>
    </>
  );
};

export default AdminProjectDetailsPage;