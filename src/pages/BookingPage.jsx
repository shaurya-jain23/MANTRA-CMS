import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from '../features/user/userSlice';
import { selectAllContainers, selectContainerStatus, fetchContainers, setContainersStatus } from "../features/containers/containersSlice";
import { selectAllDealers, selectDealersStatus, fetchDealers } from "../features/dealers/dealersSlice";
import { selectAllBookings, selectBookingsStatus, fetchBookings, setBookingsStatus } from "../features/bookings/bookingsSlice";
// import { selectAllUsers, selectUsersStatus, fetchUsers } from "../slices/userSlice";
import bookingService from '../firebase/bookings';
import {BookingForm as BookingFormModal, BookingCard, Container, ConfirmationAlert,Loading} from '../components';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';


function BookingsPage() {
  const dispatch = useDispatch();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const userData = useSelector(selectUser);
  const [isUpdating, setIsUpdating] = useState(false);

  // Redux state
  const containers = useSelector(selectAllContainers);
  const dealers = useSelector(selectAllDealers);
  const allbookings = useSelector(selectAllBookings);
  const containerMap = Object.fromEntries(containers.map(c => [c.id, c]));
  const dealerMap = Object.fromEntries(dealers.map(d => [d.id, d]));

  const completeBookingData = allbookings.map(b => ({
    ...b,
    container: containerMap[b.containerId] || null,
    dealer: dealerMap[b.dealerId] || null,
    // requested_by_name: userData.displayName || 'Unknown',
  }));
  

  const containersStatus = useSelector(selectContainerStatus);
  const dealersStatus = useSelector(selectDealersStatus);
  const bookingsStatus = useSelector(selectBookingsStatus);

  const [alertState, setAlertState] = useState({
    isOpen: false,
    action: null, // 'approve', 'reject', 'delete'
    bookingId: null,
  });

  useEffect(() => {
    if (containersStatus === "idle") dispatch(fetchContainers());
    if (dealersStatus === "idle") dispatch(fetchDealers({ role: userData.role, userId: userData.uid }));
    if (bookingsStatus === "idle") dispatch(fetchBookings({ role: userData.role, userId: userData.uid }));

    if (containersStatus === 'failed' || dealersStatus === 'failed' || bookingsStatus === 'failed') {
    setError('Failed to fetch data. Please try again.');
    setLoading(false);
  } else if (containersStatus === 'succeeded' && dealersStatus === 'succeeded' && bookingsStatus === 'succeeded') {
    setBookings(completeBookingData);
    setLoading(false);
  }
  }, [dispatch, containersStatus, dealersStatus, bookingsStatus, userData]);



  const openConfirmationModal = (action, booking) => {
    setAlertState({ isOpen: true, action, booking });
  };

  const closeConfirmationModal = () => {
    setAlertState({ isOpen: false, action: null, booking: null });
  };

  const handleConfirmAction = async (reason = '') => {
    const { action, booking } = alertState;
    if (!action || !booking) return;
    setIsUpdating(true);
    closeConfirmationModal();
    try {
      switch (action) {
        case 'approve':
          await bookingService.approveAndSyncBooking(booking);
          setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'Approved' } : b));
          alert("Booking approved and synced!");
          break;
        case 'reject':
          await bookingService.rejectBooking(booking, reason);
          setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'Rejected', rejectionReason: reason } : b));
          break;
        case 'delete':
          await bookingService.deleteBooking(booking);
          setBookings(bookings.filter(b => b.id !== booking.id));
          break;
        default:
          break;
      }
    } catch (error) {
      alert("An error occurred: " + error.message);
    } finally {
      setIsUpdating(false); 
      dispatch(setBookingsStatus("idle"))
      dispatch(setContainersStatus("idle"))
    }
  };

  const handleEdit = (booking) => {
    setBookingToEdit(booking);
    setIsModalOpen(true);
  };

  
  const handleFormSubmit = async (formData) => {
    if (bookingToEdit) {
      const { container, dealer, ...bookingData } = formData;
      await bookingService.updateBooking(bookingToEdit.id, bookingData);
      // Refresh the list to show the updated "Pending" status
      setBookings(completeBookingData);
      // bookingService.getBookings(userData.uid, userData.role).then(setBookings);
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
      <Loading isOpen={isUpdating} message="Syncing with server..." />
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

