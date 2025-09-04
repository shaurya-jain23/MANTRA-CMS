import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/user/userSlice';
import bookingService from '../firebase/bookings';
import {BookingForm as BookingFormModal, BookingCard, Container, ConfirmationAlert} from '../components';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const userData = useSelector(selectUser);

  const [alertState, setAlertState] = useState({
    isOpen: false,
    action: null, // 'approve', 'reject', 'delete'
    bookingId: null,
  });

  // Fetch data on load
  useEffect(() => {
    if (userData?.uid) {
      bookingService.getBookings(userData).then(setBookings).finally(() => setLoading(false));
    }
  }, [userData]);

  const openConfirmationModal = (action, bookingId) => {
    setAlertState({ isOpen: true, action, bookingId });
  };

  const closeConfirmationModal = () => {
    setAlertState({ isOpen: false, action: null, bookingId: null });
  };

  const handleConfirmAction = async (reason = '') => {
    const { action, bookingId } = alertState;
    if (!action || !bookingId) return;

    switch (action) {
      case 'approve':
        await bookingService.approveAndSyncBooking(bookingId);
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'Approved' } : b));
        alert("Booking approved and synced!");
        break;
      case 'reject':
        await bookingService.rejectBooking(bookingId, reason);
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'Rejected', rejectionReason: reason } : b));
        break;
      case 'delete':
        await bookingService.deleteBooking(bookingId);
        setBookings(bookings.filter(b => b.id !== bookingId));
        break;
      default:
        break;
    }
    closeConfirmationModal();
  };

  const handleEdit = (booking) => {
    setBookingToEdit(booking);
    setIsModalOpen(true);
  };

  
  const handleFormSubmit = async (formData) => {
    if (bookingToEdit) {
      console.log(bookingToEdit.id, formData);
      
      await bookingService.updateBooking(bookingToEdit.id, formData);
      // Refresh the list to show the updated "Pending" status
      bookingService.getBookings(userData).then(setBookings);
    }
    setIsModalOpen(false);
    setBookingToEdit(null);
  };

  const getModalConfig = () => {
    switch (alertState.action) {
      case 'approve':
        return { title: 'Approve Request', message: 'Are you sure you want to approve this booking request?', confirmText: 'Yes, Approve', confirmColor: 'bg-green-600', icon: <CheckCircle className="h-12 w-12 text-green-500"/> };
      case 'reject':
        return { title: 'Reject Request', message: 'Please provide a reason for rejecting this booking request.', requiresReason: true, confirmText: 'Yes, Reject', confirmColor: 'bg-red-600', icon: <XCircle className="h-12 w-12 text-red-500"/> };
      case 'delete':
        return { title: 'Delete Booking', message: 'Are you sure you want to permanently delete this booking request? This action cannot be undone.', confirmText: 'Yes, Delete', confirmColor: 'bg-red-600', icon: <AlertTriangle className="h-12 w-12 text-red-500"/> };
      default:
        return {};
    }
  };

  return (
   <Container>
    <div className="w-full flex flex-col justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Booking Requests</h1>
      </div>
      {loading && <p>Loading bookings...</p>}
      {!loading && bookings.length === 0 && (
        <p className="text-gray-600">No bookings found. Go to dashboard and submit new booking requests</p>
      )}
      {!loading && (
        <div className="w-full grid grid-cols-1 gap-6">
          {bookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              userRole={userData.role}
              onEdit={handleEdit}
              onAction={openConfirmationModal}
            />
          ))}
        </div>
      )}
    <BookingFormModal
        // Note: you'll need to pass container and initial booking data for editing
        bookingToEdit={bookingToEdit} 
        container={bookingToEdit?.container}
        onSubmit={handleFormSubmit}
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
    />
    <ConfirmationAlert
      isOpen={alertState.isOpen}
      onClose={closeConfirmationModal}
      onConfirm={handleConfirmAction}
      {...getModalConfig()}
    />
   </Container>
  );
}

export default BookingsPage;

