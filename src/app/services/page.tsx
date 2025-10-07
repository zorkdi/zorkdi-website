import styles from './services.module.css';

const ServicesPage = () => {
  return (
    <main className={styles.main}>
      {/* ===== Hero Section ===== */}
      <section className={styles.hero}>
        <h1>Our Services</h1>
        <p>Custom-built solutions to elevate your business.</p>
      </section>

      {/* ===== Detailed Services List ===== */}
      <section className={styles.detailedServices}>
        {/* Service 1 */}
        <div className={styles.serviceItem}>
          <div className={styles.serviceIcon}>📱</div>
          <h2>Mobile App Development</h2>
          <p>We build high-quality, cross-platform mobile applications for Android & iOS that are fast, intuitive, and scalable, ensuring a seamless user experience.</p>
          <h4>What we offer:</h4>
          <ul>
            <li>Native iOS & Android Apps</li>
            <li>Cross-Platform (Flutter) Apps</li>
            <li>UI/UX Design & Prototyping</li>
            <li>Backend & API Integration</li>
          </ul>
        </div>

        {/* Service 2 */}
        <div className={styles.serviceItem}>
          <div className={styles.serviceIcon}>💻</div>
          <h2>Web Platforms & Websites</h2>
          <p>From modern marketing websites to complex, data-driven web applications, we deliver solutions that are secure, responsive, and optimized for performance.</p>
          <h4>What we offer:</h4>
          <ul>
            <li>Corporate & E-commerce Websites</li>
            <li>Single Page Applications (SPAs)</li>
            <li>Content Management Systems (CMS)</li>
            <li>Progressive Web Apps (PWAs)</li>
          </ul>
        </div>
        
        {/* Service 3 */}
        <div className={styles.serviceItem}>
          <div className={styles.serviceIcon}>⚙️</div>
          <h2>Custom Software Solutions</h2>
          <p>We engineer bespoke software tailored to your specific business needs, including desktop applications, ERP systems, and internal business tools.</p>
          <h4>What we offer:</h4>
          <ul>
            <li>Desktop Apps (Windows/Mac)</li>
            <li>Enterprise Resource Planning (ERP)</li>
            <li>Business Automation Tools</li>
            <li>Third-Party API Integrations</li>
          </ul>
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;