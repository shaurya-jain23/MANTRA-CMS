import React from 'react';
import { CheckCircle, XCircle, SquarePen, Trash, Banknote } from 'lucide-react';
import { Button, Select } from '../index';
import { format } from 'date-fns';
import {calculatePaymentStatus, containerStatusMap, getPaymentStatusColor} from '../../assets/utils';
import { useNavigate } from 'react-router-dom';

function BookingCard({ booking, userRole, onEdit, onAction, onPaymentUpdate }) {
  const navigate = useNavigate();
  const getStatusColor = (status) => {
    if (status === 'Approved') return 'bg-green-100 text-green-800';
    if (status === 'Rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800'; // Pending
  };
  const container = booking.container
  const isAdmin = userRole === 'admin' || userRole === 'superuser';

  let etaDate;
  if (container.eta && container.eta !== 'N/A') {
    etaDate = format(container.eta, 'dd-MMM');
  } else {
    etaDate = 'N/A';
  }

  const bookingDetails = `₹${booking.pricePerPiece}/psc, ${booking.battery?.included ? 'With Battey, ' : ''} ${booking.charger?.included ? 'With Charger, ' : ''} ${booking.tyre?.included ? 'With tyre, ' : ''} ${booking.assembling?.included ? 'With Assembling, ' : ''} and ${booking.transport?.included ? 'With Transport' : `₹${booking.transport?.charges} Transport extra`}`

  return (
    <>
      <div
        className={`bg-white p-4 md:py-6 flex hover:bg-slate-50 flex-col cursor-pointer justify-start border border-gray-200 lg:border-0 lg:border-b-1 lg:grid ${isAdmin ? 'lg:grid-cols-13' : 'lg:grid-cols-11'} lg:gap-3 lg:items-center lg:text-center`}>
        {/* Container No (1 cols) */}
        <div
          className={`mb-4 lg:mb-0 text-md flex flex-col gap-3/2 pb-2 lg:pb-0 border-b-1 lg:border-b-0 border-gray-200 ${isAdmin ? 'lg:col-span-2' : 'lg:col-span-1'}`}
          onClick={() => navigate(`/bookings/${booking.id}`)}
        >
          {isAdmin && (
            <div className="flex items-center gap-1 lg:justify-center mb-1">
              <div
                className={`py-1/2 px-2 flex lg:flex items-center gap-1 text-[10px] leading-5 font-bold rounded-full outline ${
                  containerStatusMap.find((doc) => (doc.status === container.status ? true : null))
                    ?.colour
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-white outline"></div>
                {container.status.toUpperCase()}
              </div>
            </div>
          )}
          <p className="font-semibold text-blue-700">{container.container_no}</p>
        </div>
          {/* Sales Person */}
        {isAdmin && (<div className="mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0  flex-wrap" onClick={() => navigate(`/bookings/${booking.id}`)}>
          <p className="font-normal lg:hidden lg:text-xs text-gray-500">Sales Person:</p>
          <p className="text-sm">{booking.requested_by_name}</p>
        </div>)}
        {/* Model & Specs (2 cols) */}
        <div className="lg:col-span-2 mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0  flex-wrap" onClick={() => navigate(`/bookings/${booking.id}`)}>
          <p className="font-normal lg:hidden lg:text-xs text-gray-500">Model & Specs:</p>
          <p className="lg:font-normal">{container.model}</p>
          <p className="lg:text-xs lg:text-gray-500">{container.specifications}</p>
        </div>


        {/* Qty (2 col) */}
        <div className="lg:col-span-2 mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0  flex-wrap" onClick={() => navigate(`/bookings/${booking.id}`)}>
          <p className="font-normal lg:hidden lg:text-xs text-gray-500">Dealer:</p>
          <p className="text-sm">{booking.dealer?.trade_name}</p>
          <p className="text-sm">{booking.placeOfDelivery}</p>
        </div>

        {/* Booking Details (2 col) */}
        <div className="lg:col-span-2 mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0  flex-wrap" onClick={() => navigate(`/bookings/${booking.id}`)}>
          <p className="font-normal lg:hidden lg:text-xs text-gray-500">Booking Details:</p>
          <p className="text-sm">{bookingDetails}</p>
        </div>
        {/* Payment (1 col) */}
        <div className="mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0 flex-wrap" onClick={() => navigate(`/bookings/${booking.id}`)}>
          <p className="font-normal lg:hidden lg:text-xs text-gray-500">Payment Status:</p>
          <div className="flex flex-col gap-1">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              getPaymentStatusColor(calculatePaymentStatus(booking.payment?.amountPaid || 0, booking.grandTotal))
            }`}>
              {calculatePaymentStatus(booking.payment?.amountPaid || 0, booking.totals?.grandTotal)}
            </span>
          </div>
        </div>
        {/* Status (1 col) */}
        <div className="mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0 flex-wrap" onClick={() => navigate(`/bookings/${booking.id}`)}>
          <p className="font-normal lg:hidden lg:text-xs text-gray-500">Booking Status:</p>
          <p className="text-sm"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
              {booking.status}</span></p>
        </div>

        {/* Actions (2 col on desktop) */}
        <div className="lg:col-span-2 flex flex-row flex-wrap lg:justify-around justify-between lg:pt-0 lg:items-center gap-2 lg:mt-0 pt-4">
          {userRole === 'superuser' && booking.status === 'Pending' && (
              <>
                <Button
                  onClick={() => onAction('reject', booking)}
                  variant='ghost'
                  size='small'
                  textColor="text-red-700"
                >
                  <XCircle size={18} />
                </Button>
                <Button
                  onClick={() => onAction('approve', booking)}
                  variant='ghost'
                  size='small'
                  textColor="text-green-700"
                >
                  <CheckCircle size={18} />
                </Button>
              </>
            )}
            <Button
              type="submit"
              variant='ghost'
              size='small'
              textColor='text-gray-500'
              onClick={() => onEdit({...container} ,{ ...booking })}
            >
              <SquarePen size={18} />
            </Button>
            <Button
              type="submit"
              variant='ghost'
              size='small'
              textColor='text-blue-500'
              onClick={() => onPaymentUpdate({ ...booking })}
            >
              <Banknote size={18} />
            </Button>
            <Button
              type="submit"
              variant='ghost'
              size='small'
              textColor='text-red-500'
              onClick={() => onAction('delete', booking)}
            >
              <Trash size={18} />
            </Button>
        </div>
      </div>
    </>
  );
}

export default BookingCard;
