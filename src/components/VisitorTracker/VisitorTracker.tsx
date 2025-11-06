// src/components/VisitorTracker/VisitorTracker.tsx

"use client";

import { useEffect, useRef } from 'react';
import { db } from '@/firebase';
import { doc, updateDoc, increment, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const VisitorTracker = () => {
    // useRef ka use karke ensure karenge ki effect sirf ek baar chale, 
    // even in React Strict Mode (development mein jo do baar chalta hai)
    const hasRun = useRef(false);

    useEffect(() => {
        // Agar already run ho chuka hai development mode mein, to wapas mat chalao
        if (hasRun.current) return;
        hasRun.current = true;

        const trackVisitor = async () => {
            // LocalStorage check karo ki aaj user already visit kar chuka hai kya
            const todayDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const lastVisitDate = localStorage.getItem('lastVisitDate');

            if (lastVisitDate !== todayDate) {
                // User aaj pehli baar aaya hai
                try {
                    const analyticsRef = doc(db, 'cms', 'analytics');
                    const analyticsSnap = await getDoc(analyticsRef);

                    if (analyticsSnap.exists()) {
                        // Document exist karta hai, sirf update karo
                        
                        // Check karo agar naya din shuru hua hai server ke hisab se
                        const data = analyticsSnap.data();
                        const serverLastDate = data.lastUpdatedDate;

                        if (serverLastDate !== todayDate) {
                            // Naya din hai, dailyVisits ko reset karke 1 se shuru karo
                             await updateDoc(analyticsRef, {
                                totalVisitors: increment(1),
                                dailyVisits: 1,
                                lastUpdatedDate: todayDate,
                                lastUpdatedTimestamp: serverTimestamp()
                            });
                        } else {
                            // Wahi din hai, dailyVisits badhao
                            await updateDoc(analyticsRef, {
                                totalVisitors: increment(1),
                                dailyVisits: increment(1),
                                lastUpdatedTimestamp: serverTimestamp()
                            });
                        }

                    } else {
                        // Document nahi hai, pehli baar create karo
                        await setDoc(analyticsRef, {
                            totalVisitors: 1,
                            dailyVisits: 1,
                            lastUpdatedDate: todayDate,
                            lastUpdatedTimestamp: serverTimestamp()
                        });
                    }

                    // LocalStorage update karo taaki dobara count na ho aaj
                    localStorage.setItem('lastVisitDate', todayDate);

                } catch (error) {
                    console.error("Error tracking visitor:", error);
                    // Error silent rakhenge taaki user ko pata na chale
                }
            }
        };

        trackVisitor();
    }, []);

    return null; // Yeh component kuch bhi render nahi karega (invisible)
};

export default VisitorTracker;