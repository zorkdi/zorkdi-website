// src/app/test/page.tsx

"use client";

import { useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, DocumentData } from 'firebase/firestore'; // DocumentData import kiya
import styles from '../page.module.css';

// Test data structure ke liye ek interface define kiya
interface TestData {
    id: string;
    message: string;
    status: string;
}

const TestPage = () => {
    const [testMessage, setTestMessage] = useState("Click the button to test Firestore connection.");
    const [loading, setLoading] = useState(false);
    const [fetchedData, setFetchedData] = useState<TestData[]>([]); // Explicit type TestData[]

    const testFirestoreConnection = async () => {
        setLoading(true);
        setTestMessage("Testing connection...");
        try {
            // Collection reference (aapke database structure ke hisaab se badal sakta hai)
            const testCollectionRef = collection(db, 'test-collection');
            
            // Fix: querySnapshot ab use hoga data map karne ke liye
            const querySnapshot = await getDocs(testCollectionRef); 

            if (querySnapshot.empty) {
                setTestMessage("Connection successful. No test data found in 'test-collection'.");
                setFetchedData([]);
                return;
            }

            // Fix: Explicitly DocumentData type use kiya aur map function mein type safety ensure ki
            const data: TestData[] = querySnapshot.docs.map((doc) => ({ 
                id: doc.id, 
                // data() function DocumentData return karta hai
                ...(doc.data() as DocumentData),
            } as TestData)); // Final explicit casting

            setFetchedData(data);
            setTestMessage(`Connection successful! Found ${data.length} test items.`);

        } catch (error) {
            console.error("Firestore Test Error:", error);
            setTestMessage(`Connection failed. Check console for details. Error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '2rem' }}>Firestore Connection Test Page</h1>
                
                <button 
                    onClick={testFirestoreConnection}
                    disabled={loading}
                    className={styles.heroButton}
                >
                    {loading ? 'Testing...' : 'Test Connection'}
                </button>

                <p style={{ marginTop: '2rem', fontSize: '1.2rem', color: 'var(--color-neon-green)' }}>
                    {testMessage}
                </p>

                {fetchedData.length > 0 && (
                    <div style={{ marginTop: '3rem', maxWidth: '800px', margin: '3rem auto' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Fetched Test Data:</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {fetchedData.map((item) => (
                                <li key={item.id} style={{ 
                                    background: 'rgba(255, 255, 255, 0.05)', 
                                    padding: '1rem', 
                                    marginBottom: '10px',
                                    borderRadius: '5px',
                                    textAlign: 'left'
                                }}>
                                    <strong>ID:</strong> {item.id} <br/>
                                    <strong>Message:</strong> {item.message} <br/>
                                    <strong>Status:</strong> {item.status}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        </main>
    );
};

export default TestPage;