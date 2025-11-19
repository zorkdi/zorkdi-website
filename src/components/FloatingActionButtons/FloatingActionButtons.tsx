// src/components/FloatingActionButtons/FloatingActionButtons.tsx

"use client";

import Link from 'next/link';
import { FaCommentAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

const FloatingActionButtons = () => {
    const { currentUser } = useAuth();

    // CHAT BUTTON:
    // - Sirf logged in user ko dikhana hai.
    const showChatButton = currentUser !== null; 

    return (
        <>
            {/* Review Button (Star) yahan se completely remove kar diya gaya hai */}

            {/* Chat Button - Sirf yeh ab dikhega */}
            {showChatButton && (
                <Link href="/chat" passHref> 
                    <div className="floatingChatButton" style={{ zIndex: 999 }}>
                        <FaCommentAlt />
                    </div>
                </Link>
            )}
        </>
    );
};

export default FloatingActionButtons;