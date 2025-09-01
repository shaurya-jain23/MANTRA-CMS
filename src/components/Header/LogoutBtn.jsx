import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/user/userSlice';
import authService from '../../firebase/auth';

function LogoutBtn() {
    const dispath = useDispatch();
    const navigate = useNavigate();
    const logoutHandler = () => {
         authService.logout()
                .then(()=> dispath(logout()))
                .catch((error) => console.error("Logout failed:", error));
          navigate("/login");
    }
  return (
    <button className='inline-block px-6 py-2 duration-200 font-semibold text-white bg-red-600 rounded-full hover:bg-red-700' onClick={logoutHandler}>Logout</button>
  )
}

export default LogoutBtn