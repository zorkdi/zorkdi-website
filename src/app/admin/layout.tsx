// src/app/admin/layout.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import styles from './admin.module.css';

// Yahan apni Admin User ID daalein
const ADMIN_UID = "eWCjS5yqHvSuafrJ5IbWlT6Kmyf2";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  // Jab tak check ho raha hai, loading dikhayein
  if (loading) {
    return <div>Loading...</div>;
  }

  // Security Check: Agar user logged-in nahi hai, ya user aap (admin) nahi hain
  if (!currentUser || currentUser.uid !== ADMIN_UID) {
    return (
      <div className={styles.accessDeniedContainer}>
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
        <Link href="/">Go to Homepage</Link>
      </div>
    );
  }

  // Agar user aap (admin) hain, to admin panel dikhayein
  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <h2>Admin Panel</h2>
        <nav>
          <ul>
            <li><Link href="/admin">Dashboard</Link></li>
            <li><Link href="/admin/blog">Blog Posts</Link></li>
            <li><Link href="/admin/projects">Project Requests</Link></li>
            {/* NAYA: Humne yahan Chat ka link add kiya hai */}
            <li><Link href="/admin/chat">Client Chats</Link></li>
          </ul>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;