// src/components/FloatingChatButton/FloatingChatButton.tsx

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // NAYA: Pathname hook import kiya
import { FaComments } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext'; 

// NAYA: is component ko hum layout mein import karenge
const FloatingChatButton = () => {
    // Auth context se user aur loading state lein
    const { currentUser, loading } = useAuth();
    const pathname = usePathname(); // NAYA: Current path li

    // Agar loading ho rahi hai, ya user logged-in nahi hai, toh button hide karo
    if (loading || !currentUser) {
        return null;
    }
    
    // CRITICAL FIX: Agar current path /chat ya /project-chat/... hai, toh button hide karo.
    const isChatPage = pathname === '/chat' || pathname.startsWith('/project-chat/');
    
    if (isChatPage) {
        return null;
    }

    return (
        <Link href="/chat" className="floatingChatButton" aria-label="Start a chat with support">
            <FaComments />
        </Link>
    );
};

export default FloatingChatButton;