// app/my-projects/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import styles from './my-projects.module.css';

// Firebase se zaroori functions import kiye
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

// Project data ke structure ko update kiya
interface Project {
  id: string;
  projectType: string;
  submittedAt: Timestamp;
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Rejected';
  projectId?: string; // Project ID ab optional hai
}

const MyProjectsPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Login check
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  // User ke projects ko real-time mein fetch karne ki logic
  useEffect(() => {
    if (currentUser) {
      const requestsRef = collection(db, 'project_requests');
      const q = query(
        requestsRef, 
        where("userId", "==", currentUser.uid),
        orderBy("submittedAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(fetchedProjects);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching projects: ", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  // Status ke hisaab se CSS class dene wala function
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return styles.statusPending;
      case 'Accepted':
        return styles.statusAccepted;
      case 'In Progress':
        return styles.statusInProgress;
      case 'Completed':
        return styles.statusCompleted;
      case 'Rejected':
        return styles.statusRejected;
      default:
        return '';
    }
  };

  if (authLoading || loading) {
    return <div className={styles.loading}>Loading your projects...</div>;
  }

  if (!currentUser) {
    return null; // Redirect useEffect handle kar lega
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>My Projects</h1>
        <p>Here you can track the status of all your project requests submitted to ZORK DI.</p>
      </div>

      {projects.length > 0 ? (
        <div className={styles.projectsGrid}>
          {projects.map(project => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectInfo}>
                <h2>{project.projectType} Request</h2>
                <p>
                  Submitted on: {project.submittedAt ? new Date(project.submittedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                </p>
                {/* Agar project ID hai to dikhao */}
                {project.projectId && (
                  <p className={styles.projectId}>Project ID: {project.projectId}</p>
                )}
              </div>
              
              {/* Actions ke liye naya container */}
              <div className={styles.projectActions}>
                <div className={`${styles.projectStatus} ${getStatusClass(project.status)}`}>
                  {project.status}
                </div>
                {/* Sirf 'Accepted' ya 'In Progress' par button dikhao */}
                {(project.status === 'Accepted' || project.status === 'In Progress') && (
                  <Link href={`/project-chat/${project.id}`} className={styles.discussButton}>
                    Discuss Project
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noProjects}>
          You haven't submitted any projects yet. 
          <Link href="/new-project">Start a new project request!</Link>
        </div>
      )}
    </main>
  );
};

export default MyProjectsPage;