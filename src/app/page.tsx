// src/app/page.tsx

import { Metadata } from 'next';
import HomeClient, { 
    ServicesContent, 
    BlogPreview, 
    PortfolioPreview, 
    Review, 
    GlobalSettings 
} from '@/components/HomeClient'; 
import { doc, getDoc, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/firebase';

// --- FALLBACK DATA ---
const fallbackServiceData: ServicesContent = {
    heroHeadline: "Building Digital Empires.",
    heroSubheadline: "From innovative startups to global enterprises, we engineer software that dominates the market.",
    heroButtonText: "Start Your Journey", 
    services: [],
};

const fallbackGlobalSettings: GlobalSettings = {
    statProjects: "150+", statTeam: "45+", statClients: "120+", statYears: "8+",
};

// --- DATA FETCHING (SERVER SIDE) ---
async function getHomePageData() {
    let serviceContent: ServicesContent = fallbackServiceData;
    let blogPosts: BlogPreview[] = [];
    let portfolioProjects: PortfolioPreview[] = [];
    let latestReviews: Review[] = [];
    let globalSettings: GlobalSettings = fallbackGlobalSettings;
    let averageRating = 0;
    let totalReviewsCount = 0;

    try {
        // 1. Fetch CMS Content
        const cmsDocRef = doc(db, 'cms', 'services_page');
        const cmsDocSnap = await getDoc(cmsDocRef);
        if (cmsDocSnap.exists()) {
            const data = cmsDocSnap.data() as Partial<ServicesContent>;
            serviceContent = { ...fallbackServiceData, ...data };
        }

        // 2. Fetch Blogs
        const blogQ = query(collection(db, 'blog'), orderBy('createdAt', 'desc'), limit(3));
        const blogSnap = await getDocs(blogQ);
        blogPosts = blogSnap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                title: d.title,
                slug: d.slug,
                coverImageURL: d.coverImageURL || '',
                summary: d.summary || 'Latest technology insights.',
                // FIX: Convert Timestamp to String for Client Component
                createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : null,
            } as BlogPreview;
        });

        // 3. Fetch Portfolio
        const portQ = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'), limit(5));
        const portSnap = await getDocs(portQ);
        portfolioProjects = portSnap.docs.map(doc => {
            const data = doc.data();
            const cleanContent = data.content ? data.content.replace(/<[^>]*>?/gm, '').substring(0, 80) + '...' : 'Innovation showcased.';
            return {
                id: doc.id,
                title: data.title,
                category: data.category || 'Technology',
                content: cleanContent,
                coverImageURL: data.coverImageURL || '',
            } as PortfolioPreview;
        });

        // 4. Fetch Reviews & Stats
        const reviewsRef = collection(db, 'reviews');
        const qAllApproved = query(reviewsRef, where('status', '==', 'approved'));
        const snapshotAll = await getDocs(qAllApproved);
        totalReviewsCount = snapshotAll.size; // FIX: Correct variable name

        if (totalReviewsCount > 0) {
            const totalRating = snapshotAll.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
            // FIX: Used correct variable totalReviewsCount here
            averageRating = totalRating / totalReviewsCount;
        }

        const qLatest = query(qAllApproved, orderBy('createdAt', 'desc'), limit(10));
        const snapshotLatest = await getDocs(qLatest);
        latestReviews = snapshotLatest.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                userName: d.userName || 'Client',
                rating: d.rating || 5,
                comment: d.comment || 'Great service.',
                // FIX: Convert Timestamp to String
                createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : null,
            } as Review;
        });

        // 5. Fetch Global Settings (Stats)
        const settingsRef = doc(db, 'cms', 'global_settings');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
            const sData = settingsSnap.data();
            globalSettings = {
                statProjects: sData.statProjects || "100+",
                statTeam: sData.statTeam || "20+",
                statClients: sData.statClients || "50+",
                statYears: sData.statYears || "5+",
            };
        }

    } catch (error) {
        console.error("Server Fetch Error:", error);
    }

    return {
        serviceContent,
        blogPosts,
        portfolioProjects,
        latestReviews,
        averageRating,
        totalReviewsCount,
        globalSettings
    };
}

// --- SEO METADATA GENERATION ---
export const metadata: Metadata = {
    title: "ZORK DI | World's #1 Custom Software, App & Web Development Company",
    description: "ZORK DI is a global leader in IT solutions. We build E-commerce Apps, School Management Systems, Hospital Software, CRM, ERP, Real Estate Portals, Uber-like Apps, and AI Solutions. Transform your business today.",
    keywords: [
        "Best Software Company", "Top IT Company India", "App Developers Near Me", "Website Design Company",
        "E-commerce App Development", "Online Store Builder", "Amazon Clone Script",
        "School Management Software", "College ERP System", "LMS Development",
        "Hospital Management System", "Doctor Booking App", "Telemedicine App",
        "Real Estate Portal Development", "Property Booking App",
        "Restaurant Management System", "Food Delivery App Developer", "Zomato Clone",
        "Taxi Booking App Development", "Uber Clone App", "Logistics Software",
        "Gym Management Software", "Salon Booking App",
        "Travel & Tourism App", "Hotel Booking Engine",
        "Matrimonial Website Development", "Dating App Developers",
        "CRM Software", "ERP Implementation", "HRMS System", "Payroll Software",
        "Billing & Invoicing Software", "Inventory Management System",
        "Flutter App Development", "React Native Developers", "Android App Makers", "iOS App Development",
        "Custom Web Application", "SaaS Product Development", "Startup MVP Development",
        "Fintech App Development", "Loan Management System", "EMI Locking Software", "NBFC Software",
        "Software Company in Mumbai", "Software Company in Delhi", "Software Company in Bangalore", "Global IT Services"
    ],
    openGraph: {
        title: "ZORK DI - We Build Software For Every Industry",
        description: "From Schools to Hospitals, Startups to Factories - ZORK DI engineers world-class mobile apps and software solutions for everyone.",
        type: 'website',
        locale: 'en_US',
        siteName: 'ZORK DI',
    }
};

// --- MAIN SERVER COMPONENT ---
export default async function Home() {
    const data = await getHomePageData();

    return (
        <HomeClient 
            serviceContent={data.serviceContent}
            blogPosts={data.blogPosts}
            portfolioProjects={data.portfolioProjects}
            latestReviews={data.latestReviews}
            averageRating={data.averageRating}
            totalReviewsCount={data.totalReviewsCount}
            globalSettings={data.globalSettings}
        />
    );
}