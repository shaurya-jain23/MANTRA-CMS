// pages/BookingDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../features/user/userSlice';
import { selectAllBookings, selectBookingsStatus, fetchBookings, setBookingsStatus } from "../features/bookings/bookingsSlice";
import { selectAllContainers, selectContainerStatus, fetchContainers, setContainersStatus } from "../features/containers/containersSlice";
import { setPIStatus } from '../features/performa-invoices/PISlice';
import { selectAllDealers, selectDealersStatus, fetchDealers } from "../features/dealers/dealersSlice";
import { Container, Loading, Button } from '../components';
import {getPaymentStatusColor , calculatePaymentStatus } from '../assets/utils';
import { transformBookingToPI } from '../assets/helperFunctions';
import { parseISO,format, isValid } from 'date-fns';
import piService from '../firebase/piService';
import {ArrowLeft, Calendar, MapPin, Package, User, Building, DollarSign, Truck, FileText, CheckCircle, XCircle, Clock, Edit, Download, Trash2, CreditCard, Building2, Ticket, Cog, Palette,SwatchBook, BatteryChargingIcon, PlugZap, IdCardLanyard, ReceiptText,
} from 'lucide-react';
import bookingService from '../firebase/bookings';
import toast from 'react-hot-toast';

const GeneratePISection = ({ booking, container, dealer, userData, onGenerating, navigate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingPI, setExistingPI] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkExistingPI = async () => {
      if (booking?.id) {
        try {
          const existing = await piService.getPIByBookingId(booking.id);
          setExistingPI(existing);
        } catch (error) {
          console.error('Error checking existing PI:', error);
        } finally {
          setCheckingExisting(false);
        }
      } else {
        setCheckingExisting(false);
      }
    };

    checkExistingPI();
  }, [booking?.id]);

  const handleGeneratePI = async () => {
    if (!booking || !container || !dealer) {
      toast.error('Missing data required to generate PI');
      return;
    }
    if (existingPI) {
      toast.success('Redirecting to PI...');
      navigate(`/performa-invoices/${existingPI.id}`);
      return
    }
    setIsGenerating(true);
    onGenerating(true);
    const toastId = toast.loading('Generating the PI...');
    try {
      const piData = transformBookingToPI(booking, container, dealer, userData);
      const piId = await piService.addPI(piData);
      setExistingPI({ id: piId, ...piData });
      navigate(`/performa-invoices/${piId}`);
      toast.success('Performa Invoice generated successfully!');
    } catch (error) {
      console.error('Failed to generate PI:', error);
      toast.error('Failed to generate Performa Invoice');
    } finally {
      dispatch(setPIStatus("idle"));
      setIsGenerating(false);
      toast.dismiss(toastId);
      onGenerating(false);
    }
  };
   if (checkingExisting) {
    return (
      <DetailCard title="Generate Performa Invoice" icon={FileText}>
        <div className="text-center py-4">
          <p className="text-gray-600">Checking for existing invoices...</p>
        </div>
      </DetailCard>
    );
  }
  if (existingPI) {
    return (
      <DetailCard title="Performa Invoice" icon={FileText}>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="font-semibold text-green-800">PI Already Generated</span>
            </div>
            <p className="text-sm text-green-700 mb-3">
              A Performa Invoice already exists for this booking.
            </p>
            <div className="text-sm">
              <p><strong>PI Number:</strong> {existingPI.pi_number}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  existingPI.status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {existingPI.status}
                </span>
              </p>
            </div>
          </div>

          <Button
            onClick={handleGeneratePI}
            variant='secondary'
            className="gap-2 rounded-full w-full"
          >
            <FileText size={16} />
            View Performa Invoice
          </Button>
        </div>
      </DetailCard>
    );
  }
  return (
    <DetailCard title="Generate Performa Invoice" icon={FileText}>
      <div className="space-y-4">
        <p className="text-gray-600">
          Generate a Performa Invoice based on this booking. The invoice will be pre-filled with booking details.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">What will be included:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Container details and pricing</li>
            <li>• Dealer information</li>
            <li>• Transport charges</li>
            <li>• Add-ons (Battery, Charger, Tyre)</li>
            <li>• Booking remarks</li>
          </ul>
        </div>

        <Button
          onClick={handleGeneratePI}
          disabled={isGenerating}
          variant='primary'
          className='gap-2'
        >
          <FileText size={16} />
          {isGenerating ? 'Generating PI...' : 'Generate Performa Invoice'}
        </Button>
        
        {isGenerating && (
          <p className="text-sm text-gray-500 text-center">
            Creating invoice and redirecting...
          </p>
        )}
      </div>
    </DetailCard>
  );
};

// Sub-components
const BookingHeader = ({ booking, onBack }) => {
  return (
      <div className="w-full flex flex-col justify-center mb-6 items-start">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-8">Booking Details</h1>
        <div className="flex flex-wrap justify-between gap-2 w-full">
            <Button variant="secondary" size='small' onClick={onBack} className="gap-2">
              <ArrowLeft size={16} />
                Back to Bookings
              </Button>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size='small' className="gap-2 bg-slate-100 border-slate-400 text-slate-800 hover:bg-gray-200">
                <Download size={16} />
                Export
              </Button>
              <Button variant="secondary" size='small' className="gap-2 bg-blue-100 border-blue-400 text-blue-800 hover:bg-blue-200">
                <Edit size={16} />
                Edit
              </Button>
              <Button variant="secondary" size='small' className="gap-2 bg-red-100 border-red-400 text-red-800 hover:bg-red-200">
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
        </div>
      </div>
  );
};

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: XCircle };
      case 'pending':
      default:
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold ${config.color}`}
    >
      <IconComponent size={16} />
      {status || 'Pending'}
    </div>
  );
};

const DetailCard = ({ title, icon: Icon, children, className = '' }) => {
  return (
    <div className={`bg-white shadow-md rounded-sm border border-gray-200 ${className}`}>
      <div className="flex items-center px-6 py-5 gap-3 lg:gap-6 border-b-1 border-gray-200">
        <Icon className="text-blue-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className='p-6'>
        {children}
      </div>
    </div>
  );
};

const ContainerDetailsSection = ({ container, isAdmin }) => {
  let processed = (c) => {
        let dateObject;
        if(c.eta?.seconds){
          let isoString = new Date(c.eta.seconds * 1000).toISOString();
          dateObject= parseISO(isoString)
          if (!isValid(dateObject)) dateObject= 'N/A';
        }
        else{
          dateObject= parseISO(c.eta)
          if (!isValid(dateObject)) dateObject= 'N/A';
        }
          return {...c, eta: dateObject}
      }
    const processedContainer = processed(container);
    const eta = processedContainer.eta ? format(processedContainer.eta, 'MMM dd, yyyy') : 'N/A';

  return (
    <DetailCard title="Container Details" icon={Package}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isAdmin && <DetailField label="Job Number" value={container?.job_no} icon={IdCardLanyard} />}
        {isAdmin && <DetailField label="BL Number" value={container?.bl_number} icon={ReceiptText} />}
        <DetailField label="Container Number" value={container?.container_no} icon={CreditCard} />
        <DetailField label="Model" value={container?.model} icon={SwatchBook} />
        {isAdmin && <DetailField label="Company" value={container?.company_name} icon={Building2} />}
        <DetailField label="Quantity" value={container?.qty} icon={Ticket} />
        <DetailField label="Specifications" value={container?.specifications} icon={Cog} />
        <DetailField label="ETA" value={eta} icon={Calendar} />
        <DetailField label="Port" value={container?.port} icon={MapPin} />
        <DetailField label="Colors" value={container?.colours} icon={Palette} />
        <DetailField label="Colors" value={container?.battery} icon={BatteryChargingIcon} />
        <DetailField label="Colors" value={container?.charger} icon={PlugZap} />
      </div>
    </DetailCard>
  );
};

const BookingInfoSection = ({ booking, dealer, isAdmin }) => {
  const freightText = booking.transport?.included
    ? 'Included in Price'
    : `₹${booking.transport?.charges || 0} Extra`;
  const extras = [];
  if (booking.battery?.included && booking.battery?.price_included) extras.push(`With ${booking.battery?.quantity} psc ${booking.battery?.type.split(/[-_ ]/).join(' ').toLowerCase()} Battery`);
  if (booking.charger?.included && booking.charger?.price_included) extras.push(`With ${booking.charger?.quantity} psc ${booking.charger?.type.split(/[-_ ]/).join(' ').toLowerCase()} Charger`);
  if (booking.tyre?.included && booking.tyre?.price_included) extras.push('With Tyre');
  if (booking.assembling?.included && booking.assembling?.price_included) extras.push('With Assembling');

  const battery = ()=> {if (booking.battery?.included && !booking.battery?.price_included){
    return `${booking.battery?.quantity} psc ${booking.battery?.type.split(/[-_ ]/).join(' ').toLowerCase()} @ ₹${booking.battery?.price}`} else {return false}}
  const charger = ()=> {if (booking.charger?.included && !booking.charger?.price_included){
    return `${booking.charger?.quantity} psc ${booking.charger?.type.split(/[-_ ]/).join(' ').toLowerCase()} @ ₹${booking.charger?.price}`} else {return false}
  }
  return (
    <DetailCard title="Booking Information" icon={FileText}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <DetailField
            label="Price per Unit"
            value={`₹${booking.pricePerPiece}`}
            icon={DollarSign}
          />
          {isAdmin && <DetailField label="Sales Person" value={booking.requested_by_name} icon={User} />}
          <DetailField label="Client Firm" value={dealer?.trade_name} icon={Building} />
          <DetailField label="Place of Delivery" value={booking.placeOfDelivery} icon={MapPin} />
        </div>
        <div className="space-y-4">
          <DetailField label="Freight Charges" value={freightText} icon={Truck} />
          <DetailField label="Extras" value={extras.length > 0 ? extras.join(' | ') : 'None'} />
          {battery() && <DetailField label="Battery" value={battery()} icon={BatteryChargingIcon}/>}
          {charger() && <DetailField label="Charger" value={charger()} icon={PlugZap}/>}
        </div>
      </div>

      {booking.remarks && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <DetailField label="Remarks" value={booking.remarks} multiline />
        </div>
      )}
    </DetailCard>
  );
};

const PaymentSection = ({ booking }) => {
  const amountPaid = booking.payment?.amountPaid || 0;
  const grandTotal = booking.totals?.grandTotal || 0;
  const paymentStatus = calculatePaymentStatus(amountPaid, grandTotal);

  return (
    <DetailCard title="Payment Information" icon={DollarSign}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <DetailField label="Amount Paid" value={`₹${amountPaid.toLocaleString()}`} />
          <DetailField label="Grand Total" value={`₹${grandTotal.toLocaleString()}`} />
        </div>
        <div className="space-y-4">
          <div className="mb-3 space-y-4">
            <span className="block text-sm font-medium text-gray-700 mb-2">Payment Status</span>
            <span
              className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(paymentStatus)}`}
            >
              {paymentStatus}
            </span>
          </div>
          <DetailField label="Balance" value={`₹${(grandTotal - amountPaid).toLocaleString()}`} />
        </div>
      </div>

      {booking.payment?.notes && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <DetailField label="Payment Notes" value={booking.payment.notes} multiline />
        </div>
      )}
    </DetailCard>
  );
};

const ActionSection = ({ booking, userRole, onAction }) => {
  const isAdmin = ['admin', 'superuser'].includes(userRole);
  const canApprove = isAdmin && booking.status === 'Pending';

  if (!canApprove) return null;

  return (
    <DetailCard title="Actions" icon={CheckCircle}>
      <div className="flex gap-4">
        <Button
          variant='secondary'
          onClick={() => onAction('approve', booking)}
          className="gap-2 w-full text-teal-800 bg-teal-100 border-teal-500 hover:bg-teal-200"
        >
          <CheckCircle size={16} />
          Approve
        </Button>
        <Button
          onClick={() => onAction('reject', booking)}
          variant='secondary'
          className="gap-2 w-full text-red-600 border-red-300 hover:bg-red-50"
        >
          <XCircle size={16} />
          Reject
        </Button>
      </div>
    </DetailCard>
  );
};

const ActionLogSection = ({ booking }) => {
  const actionLog = booking.actionLog || [];

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <DetailCard title="Action History" icon={Clock}>
      <div className="space-y-4">
        {actionLog.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No action history available</p>
        ) : (
          actionLog.map((log, index) => {
            const IconComponent = getActionIcon(log.action);
            return (
              <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                <IconComponent
                  className={`mt-1 flex-shrink-0 ${getActionColor(log.action)}`}
                  size={16}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 capitalize">{log.action}</div>
                  <div className="text-sm text-gray-600">{log.notes}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {log.timestamp
                      ? format(new Date(log.timestamp), 'MMM dd, yyyy, hh:mm a')
                      : 'Unknown date'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DetailCard>
  );
};

const DetailField = ({ label, value, icon: Icon, multiline = false }) => {
  if (!value) return null;

  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
        {Icon && <Icon size={14} />}
        {label}
      </span>
      {multiline ? (
        <p className="text-gray-900 whitespace-pre-wrap">{value}</p>
      ) : (
        <span className="text-gray-900 font-semibold">{value}</span>
      )}
    </div>
  );
};


// Main Component
function BookingDetailsPage() {
  const { bId } = useParams();
  const bookingId = bId;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userData = useSelector(selectUser);
  const isAdmin = ['admin', 'superuser'].includes(userData?.role);
  const allBookings = useSelector(selectAllBookings);
  const containers = useSelector(selectAllContainers);
  const dealers = useSelector(selectAllDealers);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
   const [generatingPI, setGeneratingPI] = useState(false);

  const containersStatus = useSelector(selectContainerStatus);
  const dealersStatus = useSelector(selectDealersStatus);
  const bookingsStatus = useSelector(selectBookingsStatus);

  const booking = allBookings.find((b) => b.id === bookingId);
  const container = containers.find((c) => c.id === booking?.containerId);
  const dealer = dealers.find((d) => d.id === booking?.dealerId);


  useEffect(() => {
      if (containersStatus === "idle") dispatch(fetchContainers());
      if (dealersStatus === "idle") dispatch(fetchDealers({ role: userData.role, userId: userData.uid }));
      if (bookingsStatus === "idle") dispatch(fetchBookings({ role: userData.role, userId: userData.uid }));
  
      if (containersStatus === 'failed' || dealersStatus === 'failed' || bookingsStatus === 'failed') {
      setError('Failed to fetch data. Please try again.');
      setLoading(false);
    } else if (containersStatus === 'succeeded' && dealersStatus === 'succeeded' && bookingsStatus === 'succeeded') {
      setLoading(false);
    }
    }, [dispatch, containersStatus, dealersStatus, bookingsStatus, userData]);


  const handleAction = async (action, booking) => {
    setProcessingAction(true);
    try {
      if (action === 'approve') {
        await bookingService.approveAndSyncBooking(booking);
      } else if (action === 'reject') {
        // You might want to show a modal for rejection reason
        await bookingService.rejectBooking(booking, 'Rejected by admin');
      }
      // Refresh data
      dispatch(fetchBookings({ role: userData.role, userId: userData.uid }));
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading isOpen={true} message="Loading booking details..." />
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container>
        <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist.</p>
          <Button variant='secondary' onClick={()=> {navigate('/bookings')}}>Back to Bookings</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
        <BookingHeader booking={booking} onBack={()=> navigate('/bookings')} />

        {/* Status Banner */}
        <div className="py-3 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Booking #{booking.booking_id || booking.id}</h2>
              <p className="text-gray-600">
                Created on{' '}
                {booking.createdAt
                  ? format(new Date(booking.createdAt), 'MMM dd, yyyy')
                  : 'Unknown date'}
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <ContainerDetailsSection container={container} isAdmin={isAdmin} />
            <BookingInfoSection booking={booking} dealer={dealer} isAdmin={isAdmin}  />
            <PaymentSection booking={booking} />
          </div>

          {/* Right Column - Actions and History */}
          <div className="space-y-6">
             <GeneratePISection 
              booking={booking}
              container={container}
              dealer={dealer}
              userData={userData}
              navigate={navigate}
              onGenerating={setGeneratingPI}
            />
            <ActionSection booking={booking} userRole={userData?.role} onAction={handleAction} />
            <ActionLogSection booking={booking} />
          </div>
        </div>

        <Loading isOpen={processingAction} message="Processing action..." />
      </div>
    </Container>
  );
}

export default BookingDetailsPage;
