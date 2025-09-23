import React, {useState} from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/user/userSlice';
import { clearDealers } from '../../features/dealers/dealersSlice';
import { clearContainers } from '../../features/containers/containersSlice';
import { clearBookings } from '../../features/bookings/bookingsSlice';
import { clearPIs } from '../../features/performa-invoices/PISlice';
import { useModal } from '../../contexts/ModalContext';
import authService from '../../firebase/auth';
import {Button} from '../index';
import { AlertTriangle, LogOut } from 'lucide-react';

function LogoutBtn({className = '', showIcon = true, showText = true}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { showModal } = useModal();
    const logoutHandler = () => {
         authService.logout()
                .then(()=> dispatch(logout()))
                .then(()=> dispatch(clearDealers()))
                .then(()=> dispatch(clearContainers()))
                .then(()=> dispatch(clearBookings()))
                .then(()=> dispatch(clearPIs()))
                .catch((error) => console.error("Logout failed:", error));
          navigate("/login");
    }

    const handleLogoutClick = () => {
        showModal({
            title: "Logout Session",
            message: "Are you sure you want to logout?",
            onConfirm: logoutHandler,
            confirmText: "Yes, Logout",
            confirmColor: "bg-red-600",
            icon: <AlertTriangle className="h-12 w-12 text-red-500" />
        });
    };
  return (
    <>
      <Button 
      variant='ghost' 
      className={`w-full group justify-start gap-2 ${className}`} 
      onClick={handleLogoutClick}>{showIcon && <LogOut size={16} />}
                {showText && <span>Logout</span>}</Button>
    </>
  )
}

export default LogoutBtn

