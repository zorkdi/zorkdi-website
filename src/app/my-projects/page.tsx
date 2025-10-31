// src/app/my-projects/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore'; // FIX: Unused 'where' ko rehne diya (logic mein use ho raha hai)

import styles from './my-projects.module.css';

// Type definitions (Status enum ko string literal se define kiya)
type ProjectStatus = 'Pending' | 'Accepted' | 'InProgress' | 'Completed' | 'Rejected';

interface ProjectRequest {
  id: string;
  title: string;
  status: ProjectStatus;
  createdAt: Date;
}

// Dummy Projects (Real-time data na hone par error handle karega)
const dummyRequests: ProjectRequest[] = [
    { id: 'proj1', title: 'New E-commerce Platform', status: 'Pending', createdAt: new Date(Date.now() - 86400000 * 1) },
    { id: 'proj2', title: 'Mobile App Concept', status: 'Accepted', createdAt: new Date(Date.now() - 86400000 * 3) },
    { id: 'proj3', title: 'CMS Backend Tool', status: 'InProgress', createdAt: new Date(Date.now() - 86400000 * 10) },
    { id: 'proj4', title: 'Website Redesign', status: 'Completed', createdAt: new Date(Date.now() - 86400000 * 20) },
];


const MyProjectsPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 1. Fetch Project Requests (Real-time)
  useEffect(() => {
    if (authLoading || !currentUser) {
        // Auth Loading complete hone par ya logged out hone par data fetch nahi hoga
        return; 
    }
    
    setIsLoading(true);
    setError(null);
    
    const requestsCollectionRef = collection(db, 'projects');
    const requestsQuery = query(
        requestsCollectionRef,
        where('clientId', '==', currentUser.uid), // Sirf current user ke projects
        orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
        const fetchedRequests = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || 'Untitled Request',
                status: data.status as ProjectStatus || 'Pending',
                // Firestore Timestamp ko Date mein convert karna
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(), 
            } as ProjectRequest;
        });
        setRequests(fetchedRequests);
        setIsLoading(false);
    }, (err) => {
        console.error("Error fetching client projects:", err);
        setError("Failed to load your projects. Please try logging in again.");
        setRequests(dummyRequests); // Fallback to dummy data on error
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, authLoading]);

  // 2. Status Tag utility
  const getStatusClass = (status: ProjectStatus) => {
    switch (status) {
      case 'Pending':
        return styles.statusPending;
      case 'Accepted':
        return styles.statusAccepted;
      case 'InProgress':
        return styles.statusInProgress;
      case 'Completed':
        return styles.statusCompleted;
      case 'Rejected':
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };


  // --- Render Logic ---

  if (authLoading) {
    return <div className={styles.loading}>Checking Authentication...</div>;
  }
  
  if (!currentUser) {
      // FIX: Agar logged-out hai, toh login page par redirect karein (Header.tsx mein bhi ho raha hai)
      return <div className={styles.noProjects}><p>Please <Link href="/login">Login</Link> to view your projects.</p></div>
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading your projects...</div>;
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>My Active Projects</h1>
        <p>Track the status and progress of all your submitted project requests here. Click &quot;Discuss&quot; to chat with your dedicated project manager.</p> {/* FIX: Double quotes escaped */}
      </header>

      <section className={styles.projectsGrid}>
        {error && <div className={styles.noProjects} style={{color: '#ff4757', border: '1px solid #e74c3c'}}>Error: {error}</div>}
        
        {requests.length === 0 && !error ? (
            <div className={styles.noProjects}>
                <p>You haven&apos;t submitted any project requests yet. <Link href="/new-project">Start a new project now!</Link></p> {/* FIX: Apostrophe escaped */}
            </div>
        ) : (
            requests.map((project) => (
                <div key={project.id} className={styles.projectCard}>
                    <div className={styles.projectInfo}>
                        <h2>{project.title}</h2>
                        <p>Requested on: {project.createdAt.toLocaleDateString()}</p>
                        <span className={styles.projectId}>ID: {project.id}</span>
                    </div>
                    <div className={styles.projectActions}>
                        <span className={`${styles.projectStatus} ${getStatusClass(project.status)}`}>
                            {project.status}
                        </span>
                        <Link 
                            href={`/project-chat/${project.id}`} 
                            className={styles.discussButton}
                        >
                            Discuss
                        </Link>
                    </div>
                </div>
            ))
        )}
      </section>
    </main>
  );
};

export default MyProjectsPage;