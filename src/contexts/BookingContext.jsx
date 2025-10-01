import React, { createContext, useContext, useState, useCallback } from 'react';
import {BookingForm} from '../components';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [bookingToEdit, setBookingToEdit] = useState(null);

  const openBookingModal = useCallback((container = null, editBooking = null) => {
    setSelectedContainer(container);
    setBookingToEdit(editBooking);
    setIsBookingModalOpen(true);
  }, []);

  const closeBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
    setSelectedContainer(null);
    setBookingToEdit(null);
  }, []);

  const value = {
    // State
    isBookingModalOpen,
    selectedContainer,
    bookingToEdit,
    
    // Actions
    openBookingModal,
    closeBookingModal,
    setBookingToEdit,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingForm />
    </BookingContext.Provider>
  );
};