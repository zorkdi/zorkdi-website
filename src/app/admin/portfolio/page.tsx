// src/app/admin/portfolio/page.tsx

import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import styles from '../admin.module.css'; // Reuse admin styles

// Define the structure, ensure Timestamp is imported
interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  coverImageURL?: string;
  createdAt?: Timestamp; // Make createdAt optional as well, just in case
}

// Server Component data fetching function
async function getPortfolioItems(): Promise<PortfolioItem[]> { // Add return type
  try {
    const portfolioCollection = collection(db, 'portfolio');
    // Sort by creation date if the field exists, otherwise skip sorting
    // For now, let's keep it simple and fetch without sorting first
    // const q = query(portfolioCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(portfolioCollection); // Fetch without sorting

    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title || 'No Title', // Add fallbacks
      category: doc.data().category || 'Uncategorized',
      coverImageURL: doc.data().coverImageURL,
      createdAt: doc.data().createdAt, // Include timestamp if available
    })) as PortfolioItem[]; // Assert type

    // Sort manually after fetching if createdAt exists
    items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

    return items;
  } catch (error) {
    console.error("Error fetching portfolio items:", error);
    // It's better to throw the error or return empty, depending on how you want to handle it
    // throw new Error("Failed to fetch portfolio items"); // Option 1: Throw error
    return []; // Option 2: Return empty array
  }
}

// The Page Component itself (must be default export)
const AdminPortfolioPage = async () => {
  let items: PortfolioItem[] = [];
  let fetchError: string | null = null;

  try {
      items = await getPortfolioItems();
  } catch (error) {
      console.error("Failed getting portfolio items for page:", error);
      fetchError = "Failed to load portfolio items. Please check server logs.";
  }


  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Manage Portfolio</h1>
        <Link href="/admin/portfolio/new" className={styles.primaryButton}>
          + Add New Project
        </Link>
      </div>

      <div className={styles.dataContainer}>
        {/* Display error if fetching failed */}
        {fetchError && <p className={styles.errorMessage}>{fetchError}</p>}

        {/* Display table only if no error and items exist */}
        {!fetchError && items.length > 0 ? (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>
                    <Link href={`/admin/portfolio/edit/${item.id}`} className={styles.actionLink}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Display message if no items and no error
          !fetchError && <p>No portfolio projects found. Click 'Add New Project' to create one.</p>
        )}
      </div>
    </div>
  );
};

// Ensure this is the ONLY default export
export default AdminPortfolioPage;