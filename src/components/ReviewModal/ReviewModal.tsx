// src/components/ReviewModal/ReviewModal.tsx

"use client";

import { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
    projectTitle?: string;
    allowComment?: boolean; // NAYA PROP: Comment box control karne ke liye
}

const ReviewModal = ({ isOpen, onClose, projectId, projectTitle, allowComment = true }: ReviewModalProps) => {
    // FIX: 'user' ko 'currentUser' se replace kiya
    const { currentUser } = useAuth(); 
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }
        // FIX: user ki jagah currentUser check kiya
        if (!currentUser) { 
             alert("You must be logged in.");
             return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'reviews'), {
                // FIX: user ki jagah currentUser use kiya
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous User',
                userImage: currentUser.photoURL || '',
                rating: rating,
                comment: allowComment ? comment : '', // Agar comment allowed nahi hai to empty string
                projectId: projectId || null,
                projectTitle: projectTitle || 'General Rating',
                type: allowComment ? 'full_review' : 'rating_only', // Type bhi save karte hain
                createdAt: serverTimestamp(),
                status: 'approved'
            });
            alert(allowComment ? "Thank you for your review!" : "Thank you for your rating!");
            onClose();
            setRating(0);
            setComment('');
        } catch (error) {
            console.error("Error submitting:", error);
            alert("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Inline Styles
    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000, backdropFilter: 'blur(5px)'
    };
    const modalContentStyle: React.CSSProperties = {
        backgroundColor: 'var(--color-dark-navy)', padding: '2.5rem', borderRadius: '16px',
        border: '1px solid var(--color-neon-green)', width: '90%', maxWidth: '500px', position: 'relative',
        boxShadow: '0 0 20px rgba(0, 245, 200, 0.3)'
    };
    const starStyle = { cursor: 'pointer', transition: 'color 0.2s', fontSize: '2.5rem' };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#ff4757', fontSize: '1.5rem' }}>
                    <FaTimes />
                </button>
                
                <h2 style={{ color: 'var(--color-neon-green)', marginBottom: '1.5rem', textAlign: 'center' }}>
                    {allowComment ? (projectTitle ? `Review: ${projectTitle}` : 'Write a Review') : 'Rate Us'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Star Rating */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <label key={index}>
                                    <input 
                                        type="radio" 
                                        name="rating" 
                                        value={ratingValue} 
                                        onClick={() => setRating(ratingValue)}
                                        style={{ display: 'none' }} 
                                    />
                                    <FaStar 
                                        style={starStyle} 
                                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"} 
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                </label>
                            );
                        })}
                    </div>

                    {/* Comment Box - Sirf tab dikhega jab allowComment true ho */}
                    {allowComment && (
                        <textarea
                            placeholder="Tell us what you liked or how we can improve..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            rows={4}
                            style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                backgroundColor: 'var(--color-deep-blue)',
                                color: 'var(--color-off-white)',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        style={{
                            padding: '1rem',
                            backgroundColor: 'var(--color-neon-green)',
                            color: 'var(--color-dark-navy)',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        {isSubmitting ? 'Submitting...' : (allowComment ? 'Submit Review' : 'Submit Rating')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;