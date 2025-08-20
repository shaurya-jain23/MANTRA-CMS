// src/components/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="py-4 mt-auto bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; {new Date().getFullYear()} MANTRA-CMS. All Rights Reserved.</p>
        <div className="mt-2">
          <Link to="/privacy-policy" className="text-sm hover:text-white duration-200">
            Privacy Policy
          </Link>
          <span className="mx-2">|</span>
          <Link to="/terms-of-service" className="text-sm hover:text-white duration-200">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;