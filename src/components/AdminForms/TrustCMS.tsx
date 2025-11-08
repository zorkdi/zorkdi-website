// src/components/AdminForms/TrustCMS.tsx

"use client";

import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import Image from 'next/image';
import { FaUpload, FaTrash, FaPlus, FaTimesCircle } from 'react-icons/fa';
// Firebase services
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/firebase';

import adminStyles from '@/app/admin/admin.module.css';
import formStyles from './forms.module.css';
import newPostStyles from '@/app/admin/blog/new/new-post.module.css'; 

// Type for a single logo item
interface LogoItem {
    id: string; // Unique ID
    name: string;
    logoPath: string; // Image URL
}

// Type for Firestore data structure
interface TrustSettings {
    logos: LogoItem[];
}

// Default/Initial values
const initialData: TrustSettings = {
    logos: [
        { id: '1', name: "Fusion Corp", logoPath: "/logos/fusion-corp.svg" },
        { id: '2', name: "Aura FinTech", logoPath: "/logos/aura-fintech.svg" },
    ],
};

const TrustCMS = () => {
    const [content, setContent] = useState<TrustSettings>(initialData);
    
    // State for image handling during upload of a new logo
    const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
    const [newLogoName, setNewLogoName] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const DOC_REF = useMemo(() => doc(db, 'cms', 'trust_settings'), []);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const docSnap = await getDoc(DOC_REF);
                if (docSnap.exists()) {
                    const fetchedData = docSnap.data() as TrustSettings;
                    // Merge kiya taaki naye fields bhi set ho jayein
                    setContent({ ...initialData, ...fetchedData }); 
                } else {
                    await setDoc(DOC_REF, initialData);
                    setContent(initialData);
                }
            } catch (_err: unknown) {
                console.error("Error fetching Trust CMS:", _err);
                setError('Failed to load trust settings.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [DOC_REF]); 

    // --- Handlers ---

    // NAYA: Handle removal of an existing logo
    const handleRemoveLogo = async (idToRemove: string, logoPath: string) => {
        if (!confirm("Are you sure you want to remove this client logo?")) return;

        setIsSubmitting(true);
        setSuccess('');
        setError('');

        try {
            // 1. Delete Image from Storage (if it's a Firestore URL)
            if (logoPath.includes('firebasestorage.googleapis.com')) {
                 try {
                    const urlPath = logoPath.split('/o/')[1];
                    const filePath = urlPath.split('?')[0];
                    const decodedPath = decodeURIComponent(filePath);
                    const imageRef = ref(storage, decodedPath);
                    await deleteObject(imageRef);
                 } catch (storageError) {
                     console.error("Warning: Failed to delete image from storage.", storageError);
                 }
            }

            // 2. Update Firestore (remove the logo item)
            const updatedLogos = content.logos.filter(logo => logo.id !== idToRemove);
            await setDoc(DOC_REF, { logos: updatedLogos }, { merge: true });

            setContent({ ...content, logos: updatedLogos });
            setSuccess('Logo removed successfully!');

        } catch (err: unknown) {
            console.error('Failed to remove logo.', err); 
            setError('Failed to remove logo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // NAYA: Handle new logo file selection
    const handleNewFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewLogoFile(e.target.files[0]);
        }
    };

    // NAYA: Handle adding a new logo item (Upload + Save to Firestore)
    const handleAddLogo = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newLogoFile || !newLogoName.trim()) {
            setError('Please provide a name and select a logo file.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');
        setUploadProgress(0);

        try {
            // 1. Upload Image
            const storageRef = ref(storage, `trust_logos/${Date.now()}_${newLogoName.trim()}`);
            const uploadTask = uploadBytesResumable(storageRef, newLogoFile);

            const finalImageURL: string = await new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(Math.round(progress));
                    },
                    (uploadError) => {
                        console.error("Image upload failed:", uploadError);
                        setError("Image upload failed. Please try again.");
                        reject(uploadError);
                    },
                    async () => {
                        resolve(await getDownloadURL(uploadTask.snapshot.ref));
                    }
                );
            });
            
            // 2. Add to Logos Array and Save to Firestore
            const newLogoItem: LogoItem = {
                id: Math.random().toString(36).substring(2, 9),
                name: newLogoName.trim(),
                logoPath: finalImageURL,
            };
            
            const updatedLogos = [...content.logos, newLogoItem];
            await setDoc(DOC_REF, { logos: updatedLogos }, { merge: true });

            // 3. Clean up states
            setContent({ ...content, logos: updatedLogos });
            setNewLogoName('');
            setNewLogoFile(null);
            setSuccess('New logo added successfully!');

        } catch (err: unknown) {
            console.error('Failed to add logo.', err); 
            setError('Failed to add logo.');
        } finally {
            setIsSubmitting(false);
            setUploadProgress(null);
        }
    };


    if (isLoading) {
        return <div className={adminStyles.loading}>Loading Trust CMS...</div>;
    }
    
    return (
        <div className={formStyles.formSection}>
            <h2>Client Trust Bar Management</h2>
            <p style={{marginBottom: '2rem', opacity: 0.8}}>Manage the client logos that appear in the scrolling bar beneath the Home Hero section. Logos should be simple vector/PNG formats for best visual results.</p>
            
            {/* Response Messages */}
            {error && <p className={adminStyles.errorMessage}>{error}</p>}
            {success && <p className={formStyles.successMessage}>{success}</p>}

            {/* --- ADD NEW LOGO FORM --- */}
            <form onSubmit={handleAddLogo} className={formStyles.formSection} style={{ padding: '2rem', border: '2px solid var(--color-neon-green)', marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--color-neon-green)', marginBottom: '1.5rem' }}>+ Add New Client Logo</h3>
                <div className={formStyles.formGrid}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="newLogoName">Client Name</label>
                        <input 
                            type="text" 
                            id="newLogoName" 
                            value={newLogoName} 
                            onChange={(e) => setNewLogoName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className={formStyles.formGroup}>
                         <label htmlFor="newLogoFile">Logo File (PNG/SVG/JPEG)</label>
                         <input
                            type="file" id="newLogoFile"
                            onChange={handleNewFileChange} accept="image/*"
                            required={!newLogoFile}
                        />
                    </div>
                </div>
                
                {uploadProgress !== null && uploadProgress < 100 && ( 
                    <p className={newPostStyles.uploadProgress}>Uploading: {uploadProgress}%</p>
                )}

                <button
                    type="submit"
                    className={adminStyles.primaryButton}
                    disabled={isSubmitting || uploadProgress !== null}
                    style={{ width: 'auto', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <FaPlus /> {isSubmitting ? 'Adding...' : 'Upload & Add Logo'}
                </button>
            </form>


            {/* --- EXISTING LOGOS LIST --- */}
            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '2rem', color: 'var(--color-neon-light)' }}>Existing Logos ({content.logos.length})</h3>
                
                <div className={adminStyles.dataContainer}>
                    <table className={adminStyles.dataTable}>
                        <thead>
                            <tr>
                                <th>Preview</th>
                                <th>Client Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {content.logos.map((logo) => (
                                <tr key={logo.id}>
                                    <td>
                                        <Image
                                            src={logo.logoPath}
                                            alt={logo.name}
                                            width={100} height={30}
                                            style={{ objectFit: 'contain', filter: 'grayscale(100%) brightness(200%)', opacity: 0.8, height: '30px', width: '100px' }}
                                        />
                                    </td>
                                    <td>{logo.name}</td>
                                    <td>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveLogo(logo.id, logo.logoPath)} 
                                            className={adminStyles.dangerButton}
                                            disabled={isSubmitting}
                                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem' }}
                                        >
                                            <FaTrash /> Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {content.logos.length === 0 && <p style={{opacity: 0.7, padding: '1rem', textAlign: 'center'}}>No logos added yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default TrustCMS;