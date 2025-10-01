// BookingLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { BookingProvider } from '../contexts/BookingContext';

function BookingLayout({children}) {
  return (
    <BookingProvider>
      {children}
    </BookingProvider>
  );
}

export default BookingLayout;
