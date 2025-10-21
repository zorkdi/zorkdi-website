// src/app/admin/projects/page.tsx

"use client"; // NAYA: Isko Client Component banaya

import { useState, useEffect } from 'react'; // NAYA: Hooks import kiye
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import styles from '../admin.module.css';

// Project request ke data ka structure
interface ProjectRequest {
  id: string;
  fullName: string;
  projectType: string;
  submittedAt: Timestamp;
  status: string;
}

// NAYA: Ab yeh ek Client Component hai
const AdminProjectsPage = () => {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // NAYA: Data fetching ab 'useEffect' ke andar, browser mein hoga
  useEffect(() => {
    const getProjectRequests = async () => {
      try {
        const requestsCollection = collection(db, 'project_requests');
        const q = query(requestsCollection, orderBy('submittedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ProjectRequest[];
        
        setRequests(fetchedRequests);
      } catch (error) {
        console.error("Permission Denied or Error Fetching: ", error);
        // Aap yahan error message dikha sakte hain
      } finally {
        setLoading(false);
      }
    };

    getProjectRequests();
  }, []); // Yeh sirf ek baar chalega jab page load hoga

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending': return styles.statusPending;
      case 'Accepted': return styles.statusAccepted;
      case 'In Progress': return styles.statusInProgress;
      case 'Completed': return styles.statusCompleted;
      case 'Rejected': return styles.statusRejected;
      default: return '';
    }
  };

  if (loading) {
    return <div>Loading project requests...</div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Manage Project Requests</h1>
      </div>

      <div className={styles.dataContainer}>
        {requests.length > 0 ? (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Project Type</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td>{req.fullName}</td>
                  <td>{req.projectType}</td>
                  <td>{new Date(req.submittedAt.seconds * 1000).toLocaleDateString()}</td>
                  <td>
                    <span className={`${styles.statusTag} ${getStatusClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/projects/${req.id}`} className={styles.actionLink}>
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No project requests found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminProjectsPage;