import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-column">
        <div className="social-media">
          <a href="#facebook" aria-label="Facebook">
            <FaFacebook className="social-icon" />
            <span className="social-text">Facebook</span> 
          </a>
          <a href="#twitter" aria-label="Twitter">
            <FaTwitter className="social-icon" />
            <span className="social-text">Twitter</span> 
          </a>
          <a href="#instagram" aria-label="Instagram">
            <FaInstagram className="social-icon" />
            <span className="social-text">Instagram</span> 
          </a>
          <a href="#youtube" aria-label="YouTube">
            <FaYoutube className="social-icon" />
            <span className="social-text">YouTube</span> 
          </a>
        </div>
        <div className="footer-copyright">
          &copy; Dhruv Mundada 2024
        </div>
      </div>
    </footer>
  );
}

export default Footer;
