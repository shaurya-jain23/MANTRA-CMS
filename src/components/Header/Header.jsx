// src/components/Header/Header.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {Container, Logo, LogoutBtn} from '../index.js'; // Assuming you have a Logo component

function Header() {
  const authStatus = useSelector((state) => state.user.status);

  // Define navigation items based on auth status
  const navItems = [
    { name: 'Home', slug: "/", active: true },
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Signup", slug: "/signup", active: !authStatus },
    { name: "Available Containers", slug: "/dashboard", active: authStatus },
    // We can add more role-specific links here later
    // { name: "Generate PI", slug: "/generate-pi", active: authStatus && user.role === 'Admin' },
  ];

  return (
    <header className="shadow-lg sticky top-0 z-50 bg-white">
      <Container>
        <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="mr-4">
            <Link to="/">
              <span className="font-bold text-xl text-gray-800">MANTRA-CMS</span>
              <Logo/>
            </Link>
          </div>
          <ul className="flex items-center ml-auto space-x-4">
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <NavLink
                    to={item.slug}
                    className={({ isActive }) =>
                      `inline-block px-4 py-2 duration-200 rounded-full font-medium
                      ${isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-700 hover:text-indigo-700"}`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ) : null
            )}
            {/* Conditionally render the Logout button */}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

export default Header;