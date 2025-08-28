import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="py-4 mt-auto bg-gray-800 text-gray-300">
      <div className="container mx-auto text-sm md:text-base px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; {new Date().getFullYear()} MANTRA-CMS. All Rights Reserved.</p>
        <div className="mt-2">
          <p className='text-xs md:text-sm'>Designed & Developed by Shaurya Jain</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;