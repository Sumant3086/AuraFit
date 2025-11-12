import React from 'react'
import './footer.css'
import Logo from '../logo/Logo'
import { Link } from 'react-router-dom'
import { FaInstagram, FaYoutube, FaFacebook, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'

const Footer = () => {
  return (
    <section id='footer'>
      <div className="footer-container">
        <div className="col1">
          <h3 className='footer-title'><span className="underline">AURA FIT</span></h3>
          <ul className='footer-text'>
            <li><FaMapMarkerAlt /> Premium Fitness Center</li>
            <li>Sports Complex, Downtown</li>
            <li>Open 24/7 - 365 Days</li>
          </ul>
        </div>

        <div className="col2">
          <h3 className='footer-title'><span className="underline">Quick Links</span></h3>
          <ul className='footer-text'>
            <li><Link to="/classes">Classes</Link></li>
            <li><Link to="/pricing">Membership</Link></li>
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="col4">
          <h3 className='footer-title'><span className="underline">Get in Touch</span></h3>
          <ul className='footer-text'>
            <li><a href="mailto:sumantyadav3086@gmail.com"><FaEnvelope /> sumantyadav3086@gmail.com</a></li>
            <li><a href="tel:+919599617479"><FaPhone /> +91 9599 617 479</a></li>
          </ul>
        </div>

        <div className="col5">
          <h3 className='footer-title'><span className="underline">Follow Us</span></h3>
          <div className="footer-socials">
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaInstagram />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaYoutube />
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaFacebook />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaTwitter />
            </a>
          </div>
        </div>

        <div className="col3">
          <Logo size="large" color="gradient" />
          <p className="footer-tagline">Transform Your Body, Transform Your Life</p>
          <div className="footer-bottom">
            <p>&copy; 2024 AURA FIT. All rights reserved.</p>
            <p>Powered by AI • Built with ❤️</p>
            <p style={{ fontSize: '0.7rem', marginTop: '10px', opacity: 0.3 }}>
              <Link to="/admin/login" style={{ color: '#333' }}>•</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Footer