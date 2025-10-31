// src/app/services/page.tsx

import styles from './services.module.css';
import { FaLaptopCode, FaMobileAlt, FaCogs, FaCode, FaPaintBrush } from "react-icons/fa"; // FIX: FaDraftingCompass removed
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Data types (Should match ServicesCMS.tsx)
interface ServiceOffering {
    id: string;
    title: string;
    description: string;
    offerings: string[]; 
}

interface ServicesContent {
    heroHeadline: string;
    heroSubheadline: string;
    services: ServiceOffering[];
}

// Default/Fallback data (Server-side rendering ke liye)
const initialServiceData: ServicesContent = {
    heroHeadline: "Our Digital Engineering Services",
    heroSubheadline: "Transforming complex ideas into clean, high-performance, and scalable software solutions.",
    services: [
        {
            id: '1', title: 'Custom Web App Development',
            description: "Building fast, secure, and resilient web applications using modern frameworks like Next.js and React.",
            offerings: ["Scalable Architecture Design", "Full-Stack Development (Frontend & Backend)", "API Integration & Development", "Performance Optimization & Testing"]
        },
        {
            id: '2', title: 'Mobile App Development',
            description: "Creating engaging native and cross-platform mobile experiences for iOS and Android devices.",
            offerings: ["Native iOS/Android Development", "Cross-Platform (React Native/Flutter)", "App Store Submission Management", "Mobile UI/UX Implementation"]
        },
        {
            id: '3', title: 'UI/UX Design & Branding',
            description: "Focusing on user-centric design to create intuitive, beautiful interfaces that drive user engagement.",
            offerings: ["Wireframing & Prototyping", "User Research & Testing", "Visual Identity & Branding", "Design System Creation"]
        },
        {
            id: '4', title: 'Custom Software Solutions',
            description: "Tailored software development for unique business needs, including internal tools and enterprise systems.",
            offerings: ["Cloud Infrastructure Setup (AWS/GCP/Azure)", "Legacy System Modernization", "Automated Workflows & Integrations", "Database Design & Management"]
        },
    ],
};

// Icon map (based on service index in the array)
// Agar service array change hua to aapko yahan bhi update karna padega
const serviceIconMap = [FaLaptopCode, FaMobileAlt, FaPaintBrush, FaCogs];


// Server Component to fetch data
async function getServicesContent(): Promise<ServicesContent> {
    try {
        const docRef = doc(db, 'cms', 'services_page');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as ServicesContent;
        } else {
            return initialServiceData;
        }
    } catch (error) {
        console.error("Server-side fetching error for Services page:", error);
        return initialServiceData; 
    }
}

// Component ko async Server Component banaya
const ServicesPage = async () => {
  const content = await getServicesContent();
  
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1>{content.heroHeadline}</h1>
        <p>{content.heroSubheadline}</p>
      </section>

      {/* Services List (Dynamic) */}
      {content.services.map((service, index) => {
        const IconComponent = serviceIconMap[index] || FaCode; // Fallback icon
        
        return (
          // NAYA: AnimationWrapper ko Server Component mein direct use nahi karte. 
          // Client-side animation ke liye isko alag component mein wrap karna padega, 
          // filhaal hum simple div use kar rahe hain, jisse Server Component run ho sake.
          <div key={service.id} className={styles.serviceItem}>
            <div className={styles.serviceIcon}><IconComponent /></div>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
            
            <h4>What we offer:</h4>
            <ul>
                {/* Offerings list */}
                {service.offerings.map((offering, i) => (
                    <li key={i}>{offering}</li>
                ))}
            </ul>
          </div>
        );
      })}

    </main>
  );
};

export default ServicesPage;