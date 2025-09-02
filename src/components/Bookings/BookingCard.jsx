import React from 'react';
import { CheckCircle, XCircle, SquarePen, Trash } from 'lucide-react';
import { Button, Select } from '../index';

function BookingCard({ booking, userRole, onEdit, onAction }) {
  const getStatusColor = (status) => {
    if (status === 'Approved') return 'bg-green-100 text-green-800';
    if (status === 'Rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800'; // Pending
  };

  const handleReject = () => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      onReject(booking.id, reason);
    }
  };

  const canEdit = userRole === 'sales' && (booking.status === 'Pending' || booking.status === 'Approved');

  return (
    <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200 w-full">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-blue-700">{booking.container?.container_no}</h3>
          <div className="flex items-center space-x-2 gap-2 w-auto">
            {(userRole === 'superuser') && booking.status === 'Pending' && (
            <>
                <Button onClick={() => onAction('reject', booking.id)} className="hover:bg-red-700 text-gray-500 flex justify-center rounded-sm !w-fit !p-2" bgColor="bg-red-600">
                    <XCircle size={18}/>
                </Button>
                <Button onClick={() => onAction('approve', booking.id)} className="hover:bg-green-700 text-gray-500 flex justify-center rounded-sm !w-fit !p-2" bgColor="bg-green-600">
                    <CheckCircle size={18} />
                </Button>
            </>
            )}
            <Button type="submit" className="hover:bg-blue-600 text-gray-500 flex justify-center rounded-sm !w-fit !p-2" onClick={() => onEdit({...booking})}>
                <SquarePen size={18}/>
            </Button>
            <Button type="submit" className="hover:bg-stone-600 text-gray-500 flex justify-center rounded-sm !w-fit !p-2" bgColor="bg-stone-600" onClick={() => onAction('delete', booking.id)}>
                <Trash size={18} />
            </Button>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                {booking.status}
            </span>
      </div>
        </div>
        <div className='mt-2 flex flex-col md:flex-row gap-1.5 flex-wrap md:gap-x-6 md:gap-y-2'>
            <p className="text-sm text-gray-600"><strong>Dealer:</strong> {booking.dealer?.trade_name}</p>
            <p className="text-sm text-gray-600"><strong>Place of Delivery:</strong> {booking.dealer?.district}, {booking.dealer?.state}</p>
            <p className="text-sm text-gray-600"><strong>Price:</strong> ₹{booking.pricePerPiece}/psc</p>
            <p className="text-sm text-gray-600"><strong>Freight:</strong> {booking.transport.included === 'true' ? 'Included' : `₹${booking.transport.charges} Extra`}</p>
            <p className="text-sm text-gray-600">
            <strong>Extras:</strong> {booking.withBattery ? 'With Battery' : ''} {booking.withCharger ? 'With Charger' : ''} {booking.withTyre ? 'With Tyre' : ''}  </p>
            <p className="text-sm text-gray-500 w-full">
            Remarks: {booking.remarks || 'N/A'}
            </p>
        </div>

        {booking.status === 'Rejected' && (
            <div className="mt-2 p-2 md:px-6 bg-red-50 border-l-4 border-red-400 w-fit">
            <p className="text-xs text-red-700"><strong>Reason:</strong> {booking.rejectionReason || 'No reason provided.'}</p>
            <Button className="mt-2 text-xs">Resend Request</Button>
            </div>
        )}
        {(userRole === 'superuser' || userRole === 'admin') && (
          <p className="text-xs text-gray-400 mt-3 pt-2 border-t">
            Requested By: {booking.requested_by_name}
          </p>
        )}
      {/* <div className="mt-4 pt-2 border-t flex justify-end items-center space-x-2">
        {canEdit && (
          <Button onClick={() => onEdit(booking)} size="sm" variant="outline">
            <Edit2 size={14} className="mr-1" /> Edit
          </Button>
        )}
        
      </div> */}
    </div>
  );
}

export default BookingCard;
