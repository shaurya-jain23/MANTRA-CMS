import React, { useState, useEffect, useMemo  } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from '../features/user/userSlice';
import { selectAllContainers, selectContainerStatus, fetchContainers, setContainersStatus } from "../features/containers/containersSlice";
import { selectAllDealers, selectDealersStatus, fetchDealers } from "../features/dealers/dealersSlice";
import { selectAllBookings, selectBookingsStatus, fetchBookings, setBookingsStatus } from "../features/bookings/bookingsSlice";
import bookingService from '../firebase/bookings';
import {BookingCard, Container, StatCard,Loading, Tabs, SearchBar, Button, PaymentUpdateModal} from '../components';
import { AlertCircle, AlertTriangle, CheckCircle, FileText, PlusCircle, XCircle } from 'lucide-react';
import { Ship, Anchor, ListChecks } from 'lucide-react';
import {bookingTabs , salesColumns } from '../assets/utils';
import { useModal } from '../contexts/ModalContext';
import { useBooking } from '../contexts/BookingContext';
import { useNavigate } from 'react-router-dom';

function BookingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const userData = useSelector(selectUser);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = ['admin', 'superuser'].includes(userData?.role);
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    selectedBooking: null
  });

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
  
  const { openBookingModal } = useBooking();
  const { showModal } = useModal();

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

  // const TabsOptions =  [...new Set(bookings?.map(c => c.generated_by_name?.trim().toUpperCase()).filter(Boolean))].map(u => { return {name: u}})
  const processedBookings = useMemo(() => {
        let processed = [...bookings]
        bookingTabs.forEach(tab => {
          if(activeTab === 'APPROVAL PENDING') {
            processed = processed.filter(b => b.status.toLowerCase() === 'pending');
          }
          else if(activeTab === 'APPROVED AND ACTIVE') {
            processed = processed.filter(b => b.status.toLowerCase() === 'approved' && b.container?.status !== 'Reached Destination');
          } else if (activeTab === 'COMPLETED') {
            processed = processed.filter(b => b.status.toLowerCase() === 'approved' && b.container?.status === 'Reached Destination');
          }
        })
        if (searchQuery) {
          const lowercasedQuery = searchQuery.toLowerCase();
          processed = processed.filter(b => 
            String(b.containerId).toLowerCase().includes(lowercasedQuery) ||
            String(b.dealer.trade_name).toLowerCase().includes(lowercasedQuery) ||
            String(b.placeOfDelivery).toLowerCase().includes(lowercasedQuery) ||
            String(b.requested_by_name).toLowerCase().includes(lowercasedQuery) ||
            String(b.status).toLowerCase().includes(lowercasedQuery)
          );
        }
        return processed;
      }, [bookings, searchQuery, activeTab]);

  const handleUpdatePayment = (booking) => {
    setPaymentModal({
      isOpen: true,
      selectedBooking: booking
    });
  };
  const handlePaymentUpdate = async (paymentData) => {
    try {
      const { container, dealer, ...bookingData } = paymentModal.selectedBooking;
      const finalData = {...bookingData, 
        payment: {
          ...paymentModal.selectedBooking.payment,
          amountPaid: paymentData.amountPaid,
          notes: paymentData.notes,
          status: paymentData.status,
          transactions: [
            ...(paymentModal.selectedBooking.payment?.transactions || []),
            {
              amount: paymentData.amountPaid - (paymentModal.selectedBooking.payment?.amountPaid || 0),
              date: paymentData.transactionDate,
              id: paymentData.transactionId,
            }
          ]
        }
      }
      // Update booking with new payment information
      await bookingService.updateBooking(paymentModal.selectedBooking.id, finalData);
      // Refresh bookings data
      dispatch(fetchBookings({ role: userData.role, userId: userData.uid }));
      setPaymentModal({ isOpen: false, selectedBooking: null });
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
  };
  
  const handleEdit = (container, booking) => {
    openBookingModal(container, booking);
  };
  
  

  useEffect(() => {
      if (alertState.isOpen && alertState.action) {
        const modalConfig = getModalConfig();
        if (modalConfig) {
          showModal({
            ...modalConfig,
            onConfirm: handleConfirmAction,
          });
        }
      }
    }, [alertState]); 
  
  const handleConfirmAction = async (reason = '') => {
    const { action, booking } = alertState;
    if (!action || !booking) return;
    setIsUpdating(true);
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

  const pendingBookings = processedBookings.filter(b => b.status === 'Pending').length;
  const activeBookings = processedBookings.filter(b => b.status === 'Approved' && b.container.status !== 'Reached Destination').length;

  if (loading) {
    return <Loading isOpen={true} message="Loading Booking Page..." />
  }

  return (
   <Container>
     <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
       <div className="w-full flex flex-col justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Booking Requests</h1>
      </div>
      <Loading isOpen={isUpdating} message="Syncing with server..." />
      {loading && <Loading isOpen={isUpdating} message="Loading the bookings..." />}
      {!loading && bookings.length === 0 && (
        <p className="text-gray-600"></p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Total Bookings" value={processedBookings.length} icon={<ListChecks className="text-blue-500" />} />
              <StatCard title="Pending Bookings" value={pendingBookings} icon={<Ship className="text-teal-500" />} />
              <StatCard title="Active Bookings" value={activeBookings} icon={<Anchor className="text-indigo-500" />} />
        </div> 
      <div className="bg-white p-4 border-b-gray-100">
            {isAdmin && <Tabs tabs={bookingTabs} activeTab={activeTab} onTabClick={setActiveTab} />}
            <div className="flex flex-col lg:flex-row justify-between items-center py-6 gap-4">
            <SearchBar
            placeholder= {'Search by container no, dealer, place of deliver, status...'}
            query={searchQuery} setQuery={setSearchQuery} className='rounded-xs py-2' resultCount={processedBookings.length}/>
            </div>
      </div>
        {error && 
          <div className='flex flex-col items-center py-12 text-center'>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className='w-8 h-8 text-red-600'/>
          </div>
          <h3 className='text-lg font-medium text-slate-900 mb-2'>Error Occured</h3>
          <p className="text-red-500  mb-6 max-w-md">Error: {error}</p>
        </div>      
        }
        {!error && (processedBookings.length === 0 ? <div className='flex flex-col items-center py-12 text-center'>
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <FileText className='w-8 h-8 text-slate-400'/>
        </div>
        <h3 className='text-lg font-medium text-slate-900 mb-2'>No bookings found</h3>
        <p className="text-slate-500 mb-6 max-w-md">{bookings.length === 0 ? 'You have not registered any booking yet.' : 'Your search or filter criteria did not match any booking. Try adjusting search.'}</p>
        {bookings.length === 0 && (
          <Button onClick={() => navigate('/sales')} className=" hover:bg-blue-700 !rounded-4xl transition md:w-auto flex items-center">
            <PlusCircle size={20} className="mr-2"/>Create First Booking</Button>
        )}
      </div> : <>
          <div className={`hidden lg:grid ${isAdmin ? 'grid-cols-13' : 'grid-cols-11'}  gap-4 px-4 py-2 items-center font-normal text-md text-gray-600 text-center bg-gray-50 rounded-lg`}>
            {isAdmin ? <div className='col-span-2' >Container #</div> : 
              <div>Container #</div>}
              {isAdmin && <div>Sales Person</div>}
              <div className="col-span-2">Model & Specs</div>
              <div className="col-span-2">Dealer</div>
              <div className="col-span-2">Booking Details</div>
              <div>Payment Status</div>
              <div>Booking Status</div>
              <div className="col-span-2">Actions</div>
          </div>
          <div className="">
            {processedBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                userRole={userData.role}
                onEdit={handleEdit}
                onPaymentUpdate={handleUpdatePayment}
                onAction={(action, booking)=> setAlertState({ isOpen: true, action, booking })}
              />
            ))}
          </div>
      </>)}
     </div>
     <PaymentUpdateModal
        booking={paymentModal.selectedBooking}
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, selectedBooking: null })}
        onUpdate={handlePaymentUpdate}
      />
   </Container>
  );
}

export default BookingsPage;

