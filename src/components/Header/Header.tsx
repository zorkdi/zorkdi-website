import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">ZORK DI</Link>
        </div>
        <nav>
          <ul className={styles.navLinks}>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/portfolio">Portfolio</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            {/* Humne neeche waale link ko ek special class di hai */}
            <li><Link href="/contact" className={styles.ctaButton}>Contact</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;