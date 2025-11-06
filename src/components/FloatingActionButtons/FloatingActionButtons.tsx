// src/components/FloatingActionButtons/FloatingActionButtons.tsx

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaCommentAlt, FaStar } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import ReviewModal from '../ReviewModal/ReviewModal';

const FloatingActionButtons = () => {
    // AuthContext se currentUser aur userProfile fetch kiya
    const { currentUser } = useAuth();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // Agar user logged in hai aur uske paas displayName hai, toh woh review de sakta hai.
    // FIX 1: Hum Chat button ke liye bhi yahi currentUser check use karenge.
    const showReviewButton = currentUser && currentUser.displayName;
    const showChatButton = currentUser !== null; // Sirf logged-in users ko dikhana hai

    const openReviewModal = () => {
        if (!currentUser) {
            // Agar koi galti se button click kare (UI se toh hide hai), toh login ke liye redirect kare
            alert("Please log in to leave a general review.");
            return;
        }
        setIsReviewModalOpen(true);
    };

    const closeReviewModal = () => {
        setIsReviewModalOpen(false);
    };

    return (
        <>
            {/* Review Button - Sirf logged-in users ko dikhega (Jo Review de sakte hain) */}
            {showReviewButton && (
                <button 
                    onClick={openReviewModal} 
                    // Style ko FloatingChatButton jaisa hi rakha, lekin right se thoda upar shift kiya
                    className="floatingChatButton" 
                    style={{ 
                        transform: 'scale(0.8)',
                        bottom: '90px', 
                        right: '15px', 
                        backgroundColor: 'var(--color-secondary-accent)',
                        boxShadow: '0 0 15px rgba(139, 92, 246, 0.7)',
                        zIndex: 998,
                    }}
                >
                    <FaStar />
                </button>
            )}

            {/* FIX 2: Chat Button - Sirf tab visible rahega jab currentUser logged in ho */}
            {showChatButton && (
                <Link href="/chat" passHref> 
                    <div className="floatingChatButton" style={{ zIndex: 999 }}>
                        <FaCommentAlt />
                    </div>
                </Link>
            )}

            {/* Review Modal - General Review ke liye (projectId nahi diya) */}
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={closeReviewModal}
                // projectId aur projectTitle optional hain, isliye nahi de rahe hain.
            />
        </>
    );
};

export default FloatingActionButtons;