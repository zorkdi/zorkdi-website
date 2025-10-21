// src/app/admin/page.tsx

import styles from './admin.module.css';
import { db } from '@/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';

// Function to fetch stats on the server
async function getDashboardStats() {
    try {
        const projectsRef = collection(db, 'project_requests');
        const blogsRef = collection(db, 'blogs');
        const chatsRef = collection(db, 'chats');

        // Project Counts
        const projectsSnapshot = await getCountFromServer(projectsRef);
        const totalProjects = projectsSnapshot.data().count;
        const pendingQuery = query(projectsRef, where('status', '==', 'Pending'));
        const pendingSnapshot = await getCountFromServer(pendingQuery);
        const pendingProjects = pendingSnapshot.data().count;

        // Blog Count
        const blogsSnapshot = await getCountFromServer(blogsRef);
        const totalBlogs = blogsSnapshot.data().count;

        // General Chat Count
        const totalChatsSnapshot = await getCountFromServer(chatsRef);
        const totalChats = totalChatsSnapshot.data().count;

        // Unread General Chats Count
        const unreadChatsQuery = query(chatsRef, where('hasUnread', '==', true));
        const unreadChatsSnapshot = await getCountFromServer(unreadChatsQuery);
        const unreadGeneralChats = unreadChatsSnapshot.data().count;

        // Unread Project Chats Count
        const unreadProjectsQuery = query(projectsRef, where('hasUnread', '==', true));
        const unreadProjectsSnapshot = await getCountFromServer(unreadProjectsQuery);
        const unreadProjectChats = unreadProjectsSnapshot.data().count;

        // Total Unread Count
        const totalUnread = unreadGeneralChats + unreadProjectChats;

        return {
            totalProjects,
            pendingProjects,
            totalBlogs,
            totalChats,
            totalUnread
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { totalProjects: 0, pendingProjects: 0, totalBlogs: 0, totalChats: 0, totalUnread: 0 };
    }
}


const AdminDashboardPage = async () => {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Dashboard</h1>
      </div>

      {/* Stat Cards Section */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.unreadCard}`}>
          <h2>Unread Messages</h2>
          <p>{stats.totalUnread}</p>
        </div>
         <div className={styles.statCard}>
          <h2>Pending Projects</h2>
          <p>{stats.pendingProjects}</p>
        </div>
         <div className={styles.statCard}>
          <h2>Total Projects</h2>
          <p>{stats.totalProjects}</p>
        </div>
        <div className={styles.statCard}>
          <h2>Published Blogs</h2>
          <p>{stats.totalBlogs}</p>
        </div>
        <div className={styles.statCard}>
          <h2>Active Chats</h2>
          <p>{stats.totalChats}</p>
        </div>
      </div>

      <div className={styles.welcomeMessage}>
        <h2>Welcome back!</h2>
        <p>This is your control center. Use the sidebar to manage your website content.</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;