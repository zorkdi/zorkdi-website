"use client"; // Hum is component ko interactive banane ke liye ise 'Client Component' bana rahe hain

import { useState } from 'react'; // 'State' manage karne ke liye
import styles from './portfolio.module.css';

// Projects ka data
const allProjects = [
  {
    title: 'Fintech Mobile App',
    category: 'Mobile Apps',
    image: '/path/to/image1.jpg',
  },
  {
    title: 'E-commerce Platform',
    category: 'Web Platforms',
    image: '/path/to/image2.jpg',
  },
  {
    title: 'Inventory Management Software',
    category: 'Custom Software',
    image: '/path/to/image3.jpg',
  },
  {
    title: 'Social Media Analytics Dashboard',
    category: 'Web Platforms',
    image: '/path/to/image4.jpg',
  },
  {
    title: 'Healthcare Companion App',
    category: 'Mobile Apps',
    image: '/path/to/image5.jpg',
  },
  {
    title: 'CRM for Small Business',
    category: 'Custom Software',
    image: '/path/to/image6.jpg',
  },
];

const PortfolioPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredProjects = activeFilter === 'All'
    ? allProjects
    : allProjects.filter(project => project.category === activeFilter);

  return (
    <main className={styles.main}>
      {/* ===== Hero Section ===== */}
      <section className={styles.hero}>
        <h1>Our Work</h1>
        <p>A showcase of our passion, dedication, and the problems we have solved.</p>
      </section>

      {/* ===== Filter Buttons ===== */}
      <div className={styles.filters}>
        <button 
          onClick={() => setActiveFilter('All')}
          className={activeFilter === 'All' ? styles.activeFilter : ''}
        >
          All
        </button>
        <button 
          onClick={() => setActiveFilter('Mobile Apps')}
          className={activeFilter === 'Mobile Apps' ? styles.activeFilter : ''}
        >
          Mobile Apps
        </button>
        <button 
          onClick={() => setActiveFilter('Web Platforms')}
          className={activeFilter === 'Web Platforms' ? styles.activeFilter : ''}
        >
          Web Platforms
        </button>
        <button 
          onClick={() => setActiveFilter('Custom Software')}
          className={activeFilter === 'Custom Software' ? styles.activeFilter : ''}
        >
          Custom Software
        </button>
      </div>

      {/* ===== Portfolio Grid ===== */}
      <section className={styles.portfolioGrid}>
        {filteredProjects.map((project, index) => (
          <div key={index} className={styles.portfolioItem}>
            <div className={styles.portfolioImagePlaceholder}>
              Project Image
            </div>
            <div className={styles.portfolioItemInfo}>
              <h3>{project.title}</h3>
              <p>{project.category}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default PortfolioPage;