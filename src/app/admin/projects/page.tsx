// src/app/admin/projects/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

import styles from '../admin.module.css';
import { FaEye, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // FIX: FaTrashAlt ko hata diya

// Type definitions (Status enum ko string literal se define kiya)
type ProjectStatus = 'Pending' | 'Accepted' | 'InProgress' | 'Completed' | 'Rejected';

interface ProjectRequest {
  id: string;
  title: string;
  status: ProjectStatus;
  clientName: string;
  budget: number;
  createdAt: Date;
}

// Dummy Projects (Real-time data na hone par error handle karega)
const dummyRequests: ProjectRequest[] = [
    { id: 'proj1', title: 'New E-commerce Platform', status: 'Pending', clientName: 'Amit Sharma', budget: 5000, createdAt: new Date(Date.now() - 86400000 * 1) },
    { id: 'proj2', title: 'Mobile App Concept', status: 'Accepted', clientName: 'Priya Verma', budget: 15000, createdAt: new Date(Date.now() - 86400000 * 3) },
    { id: 'proj3', title: 'CMS Backend Tool', status: 'InProgress', clientName: 'Rajesh Kumar', budget: 8000, createdAt: new Date(Date.now() - 86400000 * 10) },
    { id: 'proj4', title: 'Website Redesign', status: 'Completed', clientName: 'Neha Singh', budget: 3500, createdAt: new Date(Date.now() - 86400000 * 20) },
    { id: 'proj5', title: 'Abandoned Blog Idea', status: 'Rejected', clientName: 'Vikas Gupta', budget: 1000, createdAt: new Date(Date.now() - 86400000 * 45) },
];


const AdminProjectsPage = () => {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // NAYA: Filtering State
  const [activeFilter, setActiveFilter] = useState<'All' | ProjectStatus>('Pending');

  // 1. Fetch Project Requests (Real-time)
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const requestsCollectionRef = collection(db, 'projects');
    const requestsQuery = query(
        requestsCollectionRef,
        orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
        const fetchedRequests = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || 'Untitled Request',
                status: data.status as ProjectStatus || 'Pending',
                clientName: data.clientName || 'Unknown Client',
                budget: data.budget || 0,
                // Firestore Timestamp ko Date mein convert karna
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(), 
            } as ProjectRequest;
        });
        setRequests(fetchedRequests);
        setIsLoading(false);
    }, (err) => {
        console.error("Error fetching project requests:", err);
        setError("Failed to load project requests. Check console.");
        setRequests(dummyRequests); // Fallback to dummy data on error
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Client-side Filtering Logic
  const filteredRequests = requests.filter(request => {
      if (activeFilter === 'All') return true;
      return request.status === activeFilter;
  });

  // 3. Status Tag utility
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

  const statusOptions: ('All' | ProjectStatus)[] = ['All', 'Pending', 'Accepted', 'InProgress', 'Completed', 'Rejected'];

  // 4. Delete Logic (Placeholder)
  const handleDelete = (request: ProjectRequest) => {
      if (confirm(`Are you sure you want to delete the project request from ${request.clientName}?`)) {
          // Future: Implement Firestore delete and relevant data cleanup here
          alert(`Deleting is not yet implemented. Pretending to delete request: ${request.title}`);
      }
  };


  return (
    <>
      <div className={styles.pageHeader}>
        <h1>Manage Project Requests</h1>
        {/* NAYA: New Project Button ki zaroorat nahi hai, yeh sirf client side se aate hain */}
        <Link href="/admin/portfolio/new" className={styles.primaryButton}>
          <FaCheckCircle style={{ marginRight: '0.5rem' }}/> Accept & Convert
        </Link>
      </div>

      {/* --- Filter Section --- */}
      <div className={styles.dataContainer} style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {statusOptions.map(status => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            // Active filter ke liye styling classes use kiye
            className={`${styles.primaryButton} ${activeFilter === status ? styles.activeFilter : ''}`}
            style={{ 
                padding: '0.6rem 1.2rem', 
                backgroundColor: activeFilter === status ? 'var(--color-secondary-accent)' : 'var(--color-dark-navy)',
                color: activeFilter === status ? 'var(--color-off-white)' : 'var(--color-neon-green)',
                border: activeFilter === status ? 'none' : '1px solid var(--color-neon-green)',
                boxShadow: activeFilter === status ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none',
                transform: activeFilter === status ? 'translateY(-3px)' : 'none',
            }}
          >
            {status} ({status === 'All' ? requests.length : requests.filter(r => r.status === status).length})
          </button>
        ))}
      </div>

      {/* --- Requests Table --- */}
      <div className={styles.dataContainer}>
        {isLoading ? (
          <div className={styles.loading}>Loading project requests...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : filteredRequests.length === 0 ? (
          <p style={{textAlign: 'center', opacity: 0.8}}>No {activeFilter === 'All' ? '' : activeFilter.toLowerCase()} requests found.</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Requested On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.title}</td>
                  <td>{request.clientName}</td>
                  <td>${request.budget.toLocaleString()}</td>
                  <td>
                    <span className={`${styles.statusTag} ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{request.createdAt.toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/projects/${request.id}`} className={styles.actionLink} style={{marginRight: '1rem'}}>
                       <FaEye /> View
                    </Link>
                    <button 
                        onClick={() => handleDelete(request)} 
                        className={styles.actionLink} 
                        style={{ color: '#e74c3c' }}
                    >
                        <FaTimesCircle /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default AdminProjectsPage;