// src/components/Header/Header.jsx
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Logo, LogoutBtn } from '../index.js';
import { Menu, X } from 'lucide-react'; 
import { selectUser, selectIsLoggedIn } from '../../features/user/userSlice.js';

function Header() {
  const authStatus = useSelector(selectIsLoggedIn);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userData = useSelector(selectUser);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: 'Home', slug: "/", active: true },
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Signup", slug: "/signup", active: !authStatus },
    { name: "Dashboard", slug: "/dashboard", active: authStatus},
  ];

  if (authStatus && userData?.role === 'superuser') {
    navItems.push({ name: "Manage Users", slug: "/users", active: authStatus });
  }
  if (authStatus) {
    const allowedRoles = ['admin', 'superuser', 'sales', 'accounts'];
    const dealerText = (userData.role === 'sales') ? 'My Dealers' : 'Dealers';
    if(allowedRoles.includes(userData.role)){
      navItems.push({ name: dealerText, slug: "/dealers", active: authStatus });
    }
  }

  return (
    <header className="shadow-lg sticky top-0 z-50 bg-white">
      <Container>
        <nav className="flex items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="mr-4 flex items-center">
            <Link to="/">
              <Logo/>
            </Link>
            <span className="font-bold text-md lg:text-xl text-gray-800">MANTRA-CMS</span>
          </div>
          <ul className="hidden md:flex items-center ml-auto space-x-4">
            {navItems.map((item) =>
              item.active? (
                <li key={item.name}>
                  <NavLink
                    to={item.slug}
                    className={({ isActive }) =>
                      `inline-block px-4 py-2 duration-200 rounded-full font-medium
                      ${isActive ? "text-blue-700 bg-blue-50" : "text-gray-700 hover:text-blue-700"}`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ) : null
            )}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>

          {/* Hamburger Menu Button (Visible on mobile) */}
          <div className="md:hidden">
            <button onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu (Dropdown) */}
        
          <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
            <ul className="flex flex-col gap-4 items-start justify-center space-y-4  sm:space-y-4 py-4 pl-8 text-sm sm:text-base">
              {navItems.map((item) =>
                item.active ? (
                  <li className='m-0' key={item.name}>
                    <NavLink
                      to={item.slug}
                      onClick={toggleMenu} // Close menu on click
                      className={({ isActive }) =>
                        `inline-block px-4 py-2 duration-200 rounded-full font-medium w-full text-center
                        ${isActive ? "text-blue-700 bg-blue-50" : "text-gray-700 bg-gray-100 hover:text-blue-700"}`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ) : null
              )}
              {authStatus && (
                <li>
                  <LogoutBtn />
                </li>
              )}
            </ul>
          </div>
      </Container>
    </header>
  );
}

export default Header;
