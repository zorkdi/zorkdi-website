import Link from 'next/link';
import styles from './Footer.module.css';
// NAYA: Humne Facebook ka icon bhi import kiya hai
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <h3>ZORK DI</h3>
            <p>Crafting Digital Excellence.</p>
          </div>
          <div className={styles.footerSocial}>
            <h3>Social</h3>
            {/* NAYA: Humne links ko vertical list mein daala hai */}
            <ul className={styles.socialList}>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin /> <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FaTwitter /> <span>Twitter</span>
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FaInstagram /> <span>Instagram</span>
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FaFacebook /> <span>Facebook</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2025 ZORK DI. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;