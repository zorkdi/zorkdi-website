// src/app/faq/page.tsx

"use client"; // Accordion ke liye client component zaroori hai

import { useState } from 'react';
import styles from './faq.module.css';
import { FaPlus } from 'react-icons/fa'; // Icon ke liye
import { AnimationWrapper } from '@/components/AnimationWrapper/AnimationWrapper'; // Animation ke liye

// FAQ item ka type
type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

// NAYA: Professional & Comprehensive Dummy Data (Pure English)
// ZORK DI ki "sab kuch build kar sakta hai" philosophy ke hisaab se
const faqData: FaqItem[] = [
  // General
  {
    id: 'gen1',
    question: 'What truly sets ZORK DI apart from other IT companies?',
    answer:
      "We aren't just developers; we are full-stack architects. While many agencies specialize in just frontend or backend, we master the entire digital ecosystem—from initial UI/UX design to a high-performance Next.js frontend, a scalable Node.js or Python backend, and a robust database (SQL or NoSQL). We deliver complete, end-to-end solutions, not just components.",
  },
  {
    id: 'gen2',
    question: 'What is your typical project development process?',
    answer:
      'We follow a battle-tested Agile methodology that ensures transparency and results:\n1.  **Discovery & Strategy:** We dive deep into your business goals, not just your tech requirements.\n2.  **UI/UX Prototyping:** We design and prototype the entire user experience before writing a single line of code.\n3.  **Agile Development:** We build your project in two-week "sprints," allowing you to test features and provide feedback continuously.\n4.  **Quality Assurance (QA):** Rigorous testing is performed to ensure your application is bug-free, fast, and secure.\n5.  **Deployment & Handoff:** We manage the full deployment to scalable platforms (like Vercel, Firebase, or AWS) and provide comprehensive documentation.',
  },
  {
    id: 'gen3',
    question: 'How do you handle project pricing and timelines?',
    answer:
      'We do not compete on "cheap." We compete on "value" and "quality." After our initial discovery phase, we provide a detailed, fixed-cost proposal. This ensures you have a clear budget and timeline with no hidden surprises. We build custom, high-performance assets, not template-based websites.',
  },

  // Frontend
  {
    id: 'fe1',
    question: 'Why do you specialize in Next.js and React for frontends?',
    answer:
      'For one reason: performance. React provides a dynamic, component-based architecture, while Next.js adds critical features like Server-Side Rendering (SSR) and Static Site Generation (SSG). This results in blazing-fast load times, superior SEO performance, and a world-class user experience that is impossible to achieve with older technologies.',
  },
  {
    id: 'fe2',
    question: 'Can you build complex, real-time admin panels and dashboards?',
    answer:
      'Yes. This is one of our core strengths. We specialize in building complex admin panels, real-time data visualization dashboards, and secure management portals that handle thousands of data points simultaneously.',
  },

  // Backend
  {
    id: 'be1',
    question: 'Node.js (NestJS) or Python (Django)? Which do you use?',
    answer:
      'We use the right tool for the job. We master both.\n\n* **Node.js (NestJS):** We use this for high-performance, real-time applications such as chat apps, financial transaction systems, and services requiring instant data sync.\n* **Python (Django):** We leverage Django for data-heavy applications, complex business logic, scientific computing, and building robust, secure Enterprise Resource Planning (ERP) systems.',
  },
  {
    id: 'be2',
    question: 'Do you build custom APIs?',
    answer:
      'Absolutely. We build secure, robust, and well-documented RESTful and GraphQL APIs. A strong API is the backbone of any modern application, allowing your web frontend, mobile app, and any third-party services to communicate flawlessly.',
  },

  // Mobile
  {
    id: 'mob1',
    question: 'Do you build for both iOS and Android?',
    answer:
      "Yes. We specialize in cross-platform development using **React Native** and **Flutter**. This allows us to build beautiful, native-performing apps for *both* iOS and Android from a single codebase, drastically reducing development time and cost while maintaining quality.",
  },

  // Database & FinTech
  {
    id: 'db1',
    question: 'SQL (PostgreSQL) or NoSQL (MongoDB, Firebase)?',
    answer:
      "We are experts in both and design your database architecture based on your specific needs.\n\n* **PostgreSQL (SQL):** We use this for applications requiring complex, structured data and absolute data integrity, such as financial systems, payroll, and complex ERPs.\n* **MongoDB/Firebase (NoSQL):** We use this for applications that require massive scalability, flexible data structures, and extreme-speed real-time data syncing, such as chat apps or IoT platforms.",
  },
  {
    id: 'fin1',
    question: 'I have a complex FinTech idea (like an agent app or PDF reports). Can you build it?',
    answer:
      'Yes. This is our exact area of expertise. We have proven experience building complex financial solutions that replace manual pen-and-paper processes. We can build secure agent apps, admin panels for loan management, and custom PDF generation for passbooks, statements, and daily collection reports.',
  },
];

// Accordion Item component
const AccordionItem = ({
  item,
  isOpen,
  toggleOpen,
}: {
  item: FaqItem;
  isOpen: boolean;
  toggleOpen: () => void;
}) => {
  return (
    <div className={`${styles.accordionItem} ${isOpen ? styles.active : ''}`}>
      <button className={styles.question} onClick={toggleOpen}>
        <h3>{item.question}</h3>
        <FaPlus className={styles.icon} />
      </button>
      <div className={styles.answer}>
        {/* Answer ko pre-wrap kiya taaki \n (new lines) kaam karein */}
        <p style={{ whiteSpace: 'pre-wrap' }}>{item.answer}</p>
      </div>
    </div>
  );
};

// Main FAQ Page
const FAQPage = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    // Agar item pehle se khula hai, toh use band karo, warna naye ko kholo
    setOpenId(openId === id ? null : id);
  };

  return (
    <main className={styles.faqPage}>
      <div className={styles.container}>
        <AnimationWrapper>
          <header className={styles.header}>
            <h1>Frequently Asked Questions</h1>
            <p>
              Our expertise, your questions. A deep dive into our capabilities and
              processes.
            </p>
          </header>
        </AnimationWrapper>

        <section className={styles.accordion}>
          {faqData.map((item, index) => (
            <AnimationWrapper key={item.id} delay={0.1 * index}>
              <AccordionItem
                item={item}
                isOpen={openId === item.id}
                toggleOpen={() => toggleItem(item.id)}
              />
            </AnimationWrapper>
          ))}
        </section>
      </div>
    </main>
  );
};

export default FAQPage;