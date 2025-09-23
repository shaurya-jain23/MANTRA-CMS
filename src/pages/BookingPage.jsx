import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from '../features/user/userSlice';
import { selectAllContainers, selectContainerStatus, fetchContainers, setContainersStatus } from "../features/containers/containersSlice";
import { selectAllDealers, selectDealersStatus, fetchDealers } from "../features/dealers/dealersSlice";
import { selectAllBookings, selectBookingsStatus, fetchBookings, setBookingsStatus } from "../features/bookings/bookingsSlice";
// import { selectAllUsers, selectUsersStatus, fetchUsers } from "../slices/userSlice";
import bookingService from '../firebase/bookings';
import {BookingForm as BookingFormModal, BookingCard, Container, StatCard,ConfirmationAlert,Loading, Tabs, SearchBar} from '../components';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Ship, Anchor, ListChecks } from 'lucide-react';
import {bookingTabs , salesColumns } from '../assets/utils';


function BookingsPage() {
  const dispatch = useDispatch();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const userData = useSelector(selectUser);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = ['admin', 'superuser'].includes(userData?.role);

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

  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const activeBookings = bookings.filter(b => b.status === 'Approved' && b.container.status !== 'Reached Destination').length;

  return (
   <Container>
     <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
       <div className="w-full flex flex-col justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Booking Requests</h1>
        {/* <div className="mt-6 flex justify-end">
            <Button
                onClick={() => handleOpenForm()}
                className="bg-blue-600 hover:bg-blue-700 !rounded-4xl transition md:w-auto flex items-center"
                >
                <PlusCircle size={20} className="mr-2"/> Register Dealer
            </Button>
        </div> */}
      </div>
      <Loading isOpen={isUpdating} message="Syncing with server..." />
      {loading && <Loading isOpen={isUpdating} message="Loading the bookings..." />}
      {!loading && bookings.length === 0 && (
        <p className="text-gray-600">No bookings found. Go to dashboard and submit new booking requests</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Total Bookings" value={bookings.length} icon={<ListChecks className="text-blue-500" />} />
              <StatCard title="Pending Bookings" value={pendingBookings} icon={<Ship className="text-teal-500" />} />
              <StatCard title="Active Bookings" value={activeBookings} icon={<Anchor className="text-indigo-500" />} />
        </div> 
      <div className="bg-white p-4 border-b-gray-100">
            {isAdmin && <Tabs tabs={bookingTabs} activeTab={activeTab} onTabClick={setActiveTab} />}
            <div className="flex flex-col lg:flex-row justify-between items-center py-6 gap-4">
            <SearchBar
            placeholder= {'Search by Firm name, Gst no, District, State...'}
            query={searchQuery} setQuery={setSearchQuery} className='rounded-xs py-2' resultCount={bookings.length}/>
            </div>
      </div>
       <div className={`hidden lg:grid ${isAdmin ? 'grid-cols-11' : 'grid-cols-10'}  gap-4 px-4 py-2 font-normal text-md text-gray-600 text-center bg-gray-50 rounded-lg`}>
          {isAdmin ? <div className='col-span-2'>Container & Company</div> : 
            <div>Container</div>}
            <div className="col-span-2">Model & Specs</div>
            <div>Qty</div>
            <div className="col-span-2">Colours</div>
            <div className="col-span-2">Battery & Chargers</div>
            <div>ETA / Port</div>
            <div>Actions</div>
        </div>
      {!loading && (
        <div className="space-y-4">
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
     </div>
   </Container>
  );
}

export default BookingsPage;

