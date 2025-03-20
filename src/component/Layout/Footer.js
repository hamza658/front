import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section brand">
            <h2 className="footer-logo">Trip Tracker</h2>
            <p className="footer-tagline">Efficient logistics management for drivers and fleet managers.</p>
            <div className="social-icons">
              <a href="https://facebook.com" aria-label="Facebook"><i className="fa fa-facebook"></i></a>
              <a href="https://twitter.com" aria-label="Twitter"><i className="fa fa-twitter"></i></a>
              <a href="https://linkedin.com" aria-label="LinkedIn"><i className="fa fa-linkedin"></i></a>
              <a href="https://instagram.com" aria-label="Instagram"><i className="fa fa-instagram"></i></a>
            </div>
          </div>

          <div className="footer-section links">
            <h3>Navigation</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/RouteMap">Route Map</Link></li>
              <li><Link to="/log-sheets">Log Sheets</Link></li>
              <li><Link to="/help">Help & Support</Link></li>
            </ul>
          </div>
      
          <div className="footer-section resources">
            <h3>Resources</h3>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>

          <div className="footer-section contact-info">
            <h3>Contact Us</h3>
            <div className="contact-item">
              <i className="fa fa-envelope"></i>
              <span>info@triptracker.com</span>
            </div>
            <div className="contact-item">
              <i className="fa fa-phone"></i>
              <span>(555) 123-4567</span>
            </div>
            <div className="contact-item">
              <i className="fa fa-map-marker"></i>
              <span>123 Logistics Ave, Transport City</span>
            </div>
          </div>
        </div>
        
        <div className="newsletter">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for the latest updates and features.</p>
          <form className="subscribe-form">
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Trip Tracker | All Rights Reserved</p>
          <div className="footer-bottom-links">
            <Link to="/sitemap">Sitemap</Link>
            <Link to="/accessibility">Accessibility</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;