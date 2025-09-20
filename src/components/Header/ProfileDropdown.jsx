import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LogoutBtn from './LogoutBtn';

function ProfileDropdown({ isOpen, user, onToggle }) {
  const navigate = useNavigate();
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg:gray-50 transition-colors duration-200"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="Avatar" className="h-9 w-9 object-cover rounded-xl" />
        ) : (
          <div className="h-8 w-8 bg-gradient-to-br from-blue-800 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-md">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 sm:block hidden" />
      </button>

      {true && (
        <>
          <div className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 transform transition-all duration-300 ease-in-out
              ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 ">{user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <Link to="/profile" className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>View Profile</Link>
            <div className='border-t border-gray-100'>
              <LogoutBtn className='px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors' />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileDropdown;
