// src/app/my-projects/page.tsx

"use client";

// FIX: 'useCallback' ko import kiya
import { useState, useEffect, useCallback } from 'react'; 
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import styles from '../page.module.css';
import { FaExternalLinkAlt, FaCheckCircle, FaStar } from 'react-icons/fa';
import ReviewModal from '@/components/ReviewModal/ReviewModal'; 
import { DocumentData } from 'firebase/firestore'; 

interface Project {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    projectUrl: string;
    hasReview: boolean;
    userId: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    }; 
}

const MyProjectsPage = () => {
    const { currentUser, loading: authLoading } = useAuth(); 
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // FIX: fetchProjects function ko useCallback se wrap kiya
    const fetchProjects = useCallback(async () => {
        if (!currentUser) return; 
        setLoading(true);
        try {
            const projectsRef = collection(db, 'projects');
            
            const q = query(
                projectsRef,
                where('userId', '==', currentUser.uid), 
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);

            const fetchedProjects = snapshot.docs.map(doc => {
                const data = doc.data() as DocumentData; 
                return {
                    id: doc.id,
                    ...data,
                } as Project;
            });

            setProjects(fetchedProjects);

        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]); // currentUser dependency mein dala

    useEffect(() => {
        if (!authLoading && currentUser) { 
            fetchProjects();
        }
    // FIX: fetchProjects ko dependency array mein add kiya
    }, [currentUser, authLoading, fetchProjects]); 


    const openReviewModal = (project: Project) => {
        setSelectedProject(project);
        setIsReviewModalOpen(true);
    };

    const closeReviewModal = () => {
        setIsReviewModalOpen(false);
        setSelectedProject(null);
        fetchProjects(); 
    };
    
    const getStatusStyle = (status: Project['status']) => {
        switch (status) {
            case 'pending':
                return { color: '#ffc107', text: 'Pending' };
            case 'in-progress':
                return { color: '#00bcd4', text: 'In Progress' };
            case 'completed':
                return { color: '#4CAF50', text: 'Completed' };
            default:
                return { color: '#aaaaaa', text: 'Unknown' };
        }
    };

    if (authLoading || loading) {
        return (
            <main className={styles.main}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    Loading your projects...
                </div>
            </main>
        );
    }

    if (!currentUser) { 
        return (
            <main className={styles.main}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    Please log in to view your projects.
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <section className={styles.heroSection} style={{ minHeight: '30vh', padding: '8rem 2rem 4rem' }}>
                <h1 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>My Projects</h1>
                <p style={{ opacity: 0.8, fontSize: '1.2rem', maxWidth: '600px', textAlign: 'center' }}>
                    Track the progress and status of your ongoing and completed projects with ZORK DI.
                </p>
            </section>

            <section className={styles.servicesSection} style={{ marginTop: '0', paddingTop: '0' }}>
                {projects.length === 0 ? (
                     <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-neon-green)', fontSize: '1.5rem' }}>
                        No projects found for your account. Start a new project with us!
                     </div>
                ) : (
                    <div className={styles.whyUsGrid} style={{ marginTop: '0', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {projects.map((project) => (
                            <div key={project.id} className={styles.whyUsItem} style={{ textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ color: 'var(--color-neon-green)', fontWeight: 600 }}>{project.title}</h3>
                                    <span style={{ 
                                        color: getStatusStyle(project.status).color, 
                                        fontWeight: 600, 
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}>
                                        <FaCheckCircle /> {getStatusStyle(project.status).text}
                                    </span>
                                </div>
                                <p style={{ marginBottom: '1.5rem', flexGrow: 1 }}>{project.description}</p>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
                                    
                                    {project.status === 'completed' && !project.hasReview && (
                                        <button 
                                            onClick={() => openReviewModal(project)} 
                                            className={styles.heroButton}
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <FaStar /> Rate Us &amp; Give Review
                                        </button>
                                    )}
                                    {project.status === 'completed' && project.hasReview && (
                                         <span style={{ color: '#4CAF50', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <FaCheckCircle /> Review Given
                                         </span>
                                    )}

                                    {project.projectUrl && (
                                        <a 
                                            href={project.projectUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className={styles.heroButton}
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'transparent', border: '1px solid var(--color-neon-green)' }}
                                        >
                                            View Project <FaExternalLinkAlt style={{ marginLeft: '5px' }} />
                                        </a>
                                    )}

                                    {project.status !== 'completed' && (
                                        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                            Created: {new Date(project.createdAt?.seconds * 1000).toLocaleDateString()}
                                        </p>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            
            <ReviewModal 
                isOpen={isReviewModalOpen} 
                onClose={closeReviewModal} 
                projectId={selectedProject?.id || ''}
            />

        </main>
    );
};

export default MyProjectsPage;