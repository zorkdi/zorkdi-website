// app/admin/shield-partners/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import styles from './shield.module.css';
import Image from 'next/image';
import { FaPlus, FaTrash, FaSpinner, FaMapMarkerAlt, FaEdit, FaTimes, FaSave, FaPhone } from 'react-icons/fa';

// Firebase
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';

interface Partner {
    id: string;
    name: string;
    designation: string;
    location: string;
    contact: string; 
    photoUrl: string;
}

export default function ShieldPartnersAdmin() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [designation, setDesignation] = useState('');
    const [location, setLocation] = useState('');
    const [contact, setContact] = useState(''); 
    const [imageFile, setImageFile] = useState<File | null>(null);
    
    // Edit Mode State
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- FETCH DATA ---
    const fetchPartners = async () => {
        try {
            const q = query(collection(db, 'shield_partners'), orderBy('createdAt', 'asc'));
            const querySnapshot = await getDocs(q);
            const data: Partner[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Partner));
            setPartners(data);
        } catch (error) {
            console.error("Error fetching:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    // --- HANDLE SUBMIT (ADD or UPDATE) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !designation || !location) {
            alert("Please fill all required text fields.");
            return;
        }
        if (!editingId && !imageFile) {
            alert("Please select an image for the new partner.");
            return;
        }

        setSubmitting(true);

        try {
            let downloadURL = "";

            // 1. Upload New Image (If selected)
            if (imageFile) {
                const storageRef = ref(storage, `shield_partners/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                downloadURL = await getDownloadURL(snapshot.ref);
            }

            // Define base data without 'any'
            const baseData = {
                name,
                designation,
                location,
                contact,
                updatedAt: serverTimestamp()
            };

            if (editingId) {
                // --- UPDATE EXISTING ---
                const partnerRef = doc(db, 'shield_partners', editingId);
                
                // Create update object with flexible type
                const updateData: Record<string, unknown> = { ...baseData };
                
                if (downloadURL) {
                    updateData.photoUrl = downloadURL;
                }

                await updateDoc(partnerRef, updateData);
                alert("Partner updated successfully!");
            } else {
                // --- ADD NEW ---
                await addDoc(collection(db, 'shield_partners'), {
                    ...baseData,
                    photoUrl: downloadURL,
                    createdAt: serverTimestamp()
                });
                alert("Partner added successfully!");
            }

            resetForm();
            await fetchPartners();

        } catch (error) {
            console.error("Error submitting:", error);
            alert("Operation failed.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- PREPARE EDIT ---
    const handleEdit = (partner: Partner) => {
        setEditingId(partner.id);
        setName(partner.name);
        setDesignation(partner.designation);
        setLocation(partner.location);
        setContact(partner.contact || ''); 
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- DELETE PARTNER ---
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this partner?")) return;

        try {
            await deleteDoc(doc(db, 'shield_partners', id));
            setPartners(prev => prev.filter(p => p.id !== id));
            if (editingId === id) resetForm();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete.");
        }
    };

    // --- RESET FORM ---
    const resetForm = () => {
        setEditingId(null);
        setName('');
        setDesignation('');
        setLocation('');
        setContact('');
        setImageFile(null);
        const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Shield Partners Management</h1>
            </div>

            {/* --- ADD / EDIT FORM --- */}
            <form 
                className={`${styles.addForm} ${editingId ? styles.editingMode : ''}`} 
                onSubmit={handleSubmit}
            >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <h3 style={{color: editingId ? '#f39c12' : '#fff'}}>
                        {editingId ? 'Edit Partner Details' : 'Add New Strategic Partner'}
                    </h3>
                    {editingId && (
                        <span style={{color: '#aaa', fontSize: '0.9rem'}}>
                            (Editing Mode Active)
                        </span>
                    )}
                </div>
                
                <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input 
                            type="text" 
                            className={styles.input} 
                            placeholder="e.g. Rahul Sharma"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Designation</label>
                        <input 
                            type="text" 
                            className={styles.input} 
                            placeholder="e.g. State Distributor"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Location</label>
                        <input 
                            type="text" 
                            className={styles.input} 
                            placeholder="e.g. Hyderabad, Telangana"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Mobile Number (Optional)</label>
                        <input 
                            type="text" 
                            className={styles.input} 
                            placeholder="+91 98765 43210"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            {editingId ? 'Update Profile Image (Optional)' : 'Profile Image'}
                        </label>
                        <input 
                            id="fileUpload"
                            type="file" 
                            accept="image/*"
                            className={styles.fileInput}
                            onChange={(e) => {
                                if (e.target.files) setImageFile(e.target.files[0]);
                            }}
                        />
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    {editingId && (
                        <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                            <FaTimes style={{marginRight: '5px'}}/> Cancel
                        </button>
                    )}
                    
                    <button 
                        type="submit" 
                        className={`${styles.submitBtn} ${editingId ? styles.updateBtn : ''}`} 
                        disabled={submitting}
                    >
                        {submitting ? <FaSpinner className="spin"/> : (editingId ? <FaSave /> : <FaPlus />)} 
                        {submitting ? ' Processing...' : (editingId ? ' Update Partner' : ' Add Partner')}
                    </button>
                </div>
            </form>

            <h2 className={styles.listHeading}>Current Partners List</h2>
            
            {loading ? (
                <p style={{color: '#aaa'}}>Loading partners...</p>
            ) : partners.length === 0 ? (
                <p style={{color: '#aaa', fontStyle: 'italic'}}>No partners added yet. Add one above.</p>
            ) : (
                <div className={styles.partnersGrid}>
                    {partners.map(partner => (
                        <div key={partner.id} className={styles.partnerCard}>
                            <div className={styles.imgContainer}>
                                <Image 
                                    src={partner.photoUrl} 
                                    alt={partner.name} 
                                    width={80} 
                                    height={80} 
                                    className={styles.pImage}
                                />
                            </div>
                            <h3 className={styles.pName}>{partner.name}</h3>
                            <p className={styles.pRole}>{partner.designation}</p>
                            <p className={styles.pLocation}>
                                <FaMapMarkerAlt style={{marginRight: '5px'}}/> 
                                {partner.location}
                            </p>
                            {partner.contact && (
                                <p className={styles.pLocation} style={{marginTop: '-10px', color: '#ccc'}}>
                                    <FaPhone style={{marginRight: '5px', fontSize:'0.8em'}}/> 
                                    {partner.contact}
                                </p>
                            )}
                            
                            <div className={styles.cardActions}>
                                <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => handleEdit(partner)}>
                                    <FaEdit /> Edit
                                </button>
                                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(partner.id)}>
                                    <FaTrash /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}