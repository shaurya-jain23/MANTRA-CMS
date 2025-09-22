// src/components/Header/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HeaderContainer, Logo, LogoutBtn, ProfileDropdown } from '../index.js';
import { Menu, X } from 'lucide-react'; 
import { selectUser, selectIsLoggedIn } from '../../features/user/userSlice.js';

function Header() {
  const authStatus = useSelector(selectIsLoggedIn);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userData = useSelector(selectUser);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if(profileDropdownOpen){
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside)
  }, [profileDropdownOpen])
  

  const navItems = [
    { name: 'Home', slug: "/", active: true },
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Signup", slug: "/signup", active: !authStatus },
  ];
  if (authStatus) {
    const adminRoles = ['admin', 'superuser', 'manager'];
    if(adminRoles.includes(userData.role)){
      navItems.push({ name: "Dashboard", slug: "/dashboard", active: authStatus});
    }
    const allowedRoles = ['admin', 'superuser', 'sales'];
    const dealerText = (userData.role === 'sales') ? 'My Bookings' : 'Bookings';
    const salesText = (userData.role === 'sales') ? 'Available Containers' : 'Sales Panel';
    const invoiceText = (userData.role === 'sales') ? 'My PIs' : 'All PIs'
    if(allowedRoles.includes(userData.role)){
      navItems.push({ name: salesText, slug: '/sales', active: authStatus });
      navItems.push({ name: dealerText, slug: '/bookings', active: authStatus });
      navItems.push({ name: invoiceText, slug: '/performa-invoices', active: authStatus });
    }
  }
  if (authStatus) {
    const allowedRoles = ['admin', 'superuser', 'sales', 'accounts'];
    const dealerText = (userData.role === 'sales') ? 'My Dealers' : 'Dealers';
    if(allowedRoles.includes(userData.role)){
      navItems.push({ name: dealerText, slug: "/dealers", active: authStatus });
    }
  }
  if (authStatus && userData?.role === 'superuser') {
    navItems.push({ name: "Manage Users", slug: "/users", active: authStatus });
    }
  

  return (
    <header className="shadow-lg sticky top-0 z-50 bg-white">
      <HeaderContainer>
        <nav className="flex items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="mr-4 gap-2 flex items-center">
            <Link to="/">
              <Logo/>
            </Link>
            <span className="font-bold text-md lg:text-xl text-gray-900 tracking-wide">MANTRA-CMS</span>
          </div>
          <ul className="hidden md:flex items-center ml-auto space-x-4 text-md">
            {navItems.map((item) =>
              item.active? (
                <li key={item.name}>
                  <NavLink
                    to={item.slug}
                    className={({ isActive }) =>
                      `inline-block px-4 py-2 duration-300 rounded-full font-medium transition-all 
                      ${isActive ? "text-blue-700 bg-blue-50" : "text-gray-600 hover:text-blue-800 hover:bg-gray-50"}`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ) : null
            )}
            {authStatus && (
              <li>
                <ProfileDropdown
                    isOpen={profileDropdownOpen}
                    onToggle={(e)=>{
                      e.stopPropagation();
                      setProfileDropdownOpen(!profileDropdownOpen)
                    }}
                    user={userData}
                  />
                {/* <LogoutBtn /> */}
              </li>
            )}
          </ul>

          {/* Hamburger Menu Button (Visible on mobile) */}
          <div className="md:hidden flex">
             {authStatus && (<ProfileDropdown
                    isOpen={profileDropdownOpen}
                    onToggle={(e)=>{
                      e.stopPropagation();
                      setProfileDropdownOpen(!profileDropdownOpen)
                    }}
                    user={userData}
                  />)}
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
                      onClick={toggleMenu} 
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
                  <LogoutBtn className='px-4 py-2 duration-200 rounded-full font-medium w-full text-center text-white bg-red-500' />
                </li>
              )}
            </ul>
          </div>
      </HeaderContainer>
    </header>
  );
}

export default Header;
