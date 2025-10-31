// src/app/api/contact/route.ts

import { db } from '@/firebase'; // Assuming your Firestore instance is exported from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

/**
 * Handle POST requests for contact form submission.
 * This API endpoint receives form data and stores it in Firestore.
 */
export async function POST(request: Request) {
    try {
        // 1. Request body se data extract karna
        const body = await request.json();
        const { name, email, subject, message } = body;

        // 2. Basic validation check karna
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { success: false, message: 'Please fill out all required fields.' }, 
                { status: 400 } // Bad Request
            );
        }

        // Optional: Email format validation (simple check)
        if (!email.includes('@') || !email.includes('.')) {
             return NextResponse.json(
                { success: false, message: 'Please enter a valid email address.' }, 
                { status: 400 }
            );
        }

        // 3. Data ko Firestore mein 'messages' collection mein add karna
        const messagesCollectionRef = collection(db, 'messages');
        
        await addDoc(messagesCollectionRef, {
            name: name,
            email: email,
            subject: subject,
            message: message,
            status: 'Unread', // Default status for new messages
            createdAt: serverTimestamp(), // Firebase server timestamp
        });

        // 4. Success response bhejna
        return NextResponse.json(
            { success: true, message: 'Your message has been sent successfully!' }, 
            { status: 200 } // OK
        );

    } catch (error) {
        console.error("Error submitting contact form:", error);
        
        // 5. Error response bhejna
        return NextResponse.json(
            { success: false, message: 'An internal server error occurred. Please try again later.' }, 
            { status: 500 } // Internal Server Error
        );
    }
}

/**
 * Handle other HTTP methods (optional, for security/completeness)
 */
export async function GET() {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}