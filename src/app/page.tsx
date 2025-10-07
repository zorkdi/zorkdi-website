import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* ===== Hero Section ===== */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroHeadline}>
          Engineering Your Vision into Reality.
        </h1>
        <p className={styles.heroSubheadline}>
          We transform your ideas into high-performance applications, websites, and software.
        </p>
        <a href="/services" className={styles.heroButton}>
          Explore Our Services
        </a>
      </section>

      {/* ===== Services Overview Section ===== */}
      <section className={styles.servicesSection}>
        <h2 className={styles.sectionTitle}>Our Core Services</h2>
        <div className={styles.servicesGrid}>
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>📱</div>
            <h3>Mobile App Development</h3>
            <p>High-quality, cross-platform mobile applications for Android & iOS.</p>
          </div>
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>💻</div>
            <h3>Web Platforms & Websites</h3>
            <p>From modern websites to complex, scalable web applications.</p>
          </div>
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>⚙️</div>
            <h3>Custom Software Solutions</h3>
            <p>Bespoke desktop apps (Windows/Mac), ERPs, and business tools.</p>
          </div>
        </div>
      </section>

      {/* ===== Portfolio Showcase Section ===== */}
      <section className={styles.portfolioSection}>
        <h2 className={styles.sectionTitle}>Our Recent Work</h2>
        <div className={styles.portfolioGrid}>
          <div className={styles.portfolioItem}>
            <div className={styles.portfolioImagePlaceholder}>Project Image</div>
            <h3>Project Alpha</h3>
            <p>Mobile App</p>
          </div>
          <div className={styles.portfolioItem}>
            <div className={styles.portfolioImagePlaceholder}>Project Image</div>
            <h3>Project Beta</h3>
            <p>Web Platform</p>
          </div>
          <div className={styles.portfolioItem}>
            <div className={styles.portfolioImagePlaceholder}>Project Image</div>
            <h3>Project Gamma</h3>
            <p>Custom Software</p>
          </div>
        </div>
      </section>

      {/* ===== Why Choose Us Section ===== */}
      <section className={styles.whyUsSection}>
        <h2 className={styles.sectionTitle}>Why Choose ZORK DI?</h2>
        <div className={styles.whyUsGrid}>
          <div className={styles.whyUsItem}>
            <div className={styles.whyUsIcon}>🏆</div>
            <h3>Premium Quality</h3>
            <p>We do not just build, we craft. Our commitment is to deliver top-notch, reliable, and polished products.</p>
          </div>
          <div className={styles.whyUsItem}>
            <div className={styles.whyUsIcon}>🚀</div>
            <h3>Future-Proof Technology</h3>
            <p>We leverage the latest, most robust technologies to ensure your product is built for tomorrow, not just today.</p>
          </div>
          <div className={styles.whyUsItem}>
            <div className={styles.whyUsIcon}>🤝</div>
            <h3>Client Partnership</h3>
            <p>We believe in working with you, not just for you. Your success is our success.</p>
          </div>
        </div>
      </section>

      {/* ===== Testimonials Section ===== */}
      <section className={styles.testimonialsSection}>
        <h2 className={styles.sectionTitle}>What Our Clients Say</h2>
        <div className={styles.testimonialsGrid}>
          <div className={styles.testimonialCard}>
            <p className={styles.quote}>
              &quot;Working with ZORK DI was a game-changer. Their attention to detail and commitment to quality is unmatched. Our app is not only functional but also incredibly fast.&quot;
            </p>
            <p className={styles.author}>
              - Client Name, CEO of ExampleCorp
            </p>
          </div>
          <div className={styles.testimonialCard}>
            <p className={styles.quote}>
              &quot;The team at ZORK DI delivered beyond our expectations. They understood our vision and translated it into a robust software solution that has streamlined our operations.&quot;
            </p>
            <p className={styles.author}>
              - Another Client, CTO of Biz Inc.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Blog Snippet Section ===== */}
      <section className={styles.blogSection}>
        <h2 className={styles.sectionTitle}>Latest Insights</h2>
        <div className={styles.blogGrid}>
          <div className={styles.blogCard}>
            <div className={styles.blogImagePlaceholder}></div>
            <div className={styles.blogCardContent}>
              <p className={styles.blogCategory}>TUTORIAL</p>
              <h3>How to Optimize Your Flutter App Performance</h3>
              <a href="/blog/flutter-performance" className={styles.readMoreLink}>Read More →</a>
            </div>
          </div>
          <div className={styles.blogCard}>
            <div className={styles.blogImagePlaceholder}></div>
            <div className={styles.blogCardContent}>
              <p className={styles.blogCategory}>WEB SECURITY</p>
              <h3>Top 5 Security Practices for Next.js Apps</h3>
              <a href="/blog/nextjs-security" className={styles.readMoreLink}>Read More →</a>
            </div>
          </div>
          <div className={styles.blogCard}>
            <div className={styles.blogImagePlaceholder}></div>
            <div className={styles.blogCardContent}>
              <p className={styles.blogCategory}>FIREBASE</p>
              <h3>Understanding Firestore: A Deep Dive</h3>
              <a href="/blog/firestore-deep-dive" className={styles.readMoreLink}>Read More →</a>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}