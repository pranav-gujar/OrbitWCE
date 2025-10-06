import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-xl font-bold mb-4">OrbitWCE</h3>
            <p className="text-gray-400 mb-4">
              Empowering connections and creating memorable experiences through seamless event and club management solutions.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.youtube.com/@mediawce" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaYoutube className="h-6 w-6" />
              </a>
             
              <a href="https://www.linkedin.com/school/walchandcollegeofengineering/?originalSubdomain=in" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/wcesangli/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link 
                to="/" 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Home
              </Link></li>
              <li><Link 
                to="/events" 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Events
              </Link></li>
          
             
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link 
                to="/privacy-policy" 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Privacy Policy
              </Link></li>
              <li><Link 
                to="/terms-conditions" 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Terms & Conditions
              </Link></li>
             
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <address className="not-italic text-gray-400">
              <p>📍 Sangli, Maharashtra, India</p>
              <p className="mt-2">✉️ orbitwce@walchandsangli.ac.in</p>
              {/* <p>Phone: +91 8999902805</p> */}
            </address>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>© {currentYear} OrbitWCE. All rights reserved.</p>
          <p className="mt-2">Designed with ❤️ by Team ApexLegion.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
