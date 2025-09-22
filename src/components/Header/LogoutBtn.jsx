import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/user/userSlice';
import { clearDealers } from '../../features/dealers/dealersSlice';
import { clearContainers } from '../../features/containers/containersSlice';
import { clearBookings } from '../../features/bookings/bookingsSlice';
import { clearPIs } from '../../features/performa-invoices/PISlice';

import authService from '../../firebase/auth';

function LogoutBtn({className}) {
    const dispath = useDispatch();
    const navigate = useNavigate();
    const logoutHandler = () => {
         authService.logout()
                .then(()=> dispath(logout()))
                .then(()=> dispath(clearDealers()))
                .then(()=> dispath(clearContainers()))
                .then(()=> dispath(clearBookings()))
                .then(()=> dispath(clearPIs()))
                .catch((error) => console.error("Logout failed:", error));
          navigate("/login");
    }
  return (
    <button className={`inline-block w-full text-start ${className}`} onClick={logoutHandler}>Logout</button>
  )
}

export default LogoutBtn

