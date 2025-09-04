import { SquarePen } from 'lucide-react';
import { Button, Select } from '../index';


function DealerCard({ dealer, onEdit, onStatusChange, userData }) {
  const userRole = userData?.role;
  const isAuthor = dealer?.registered_by_id === userData?.uid;
  
  // const isAuthor = dealer && userData ? dealer.registered_by_id === userData.uid : false;

  const showEditButton = isAuthor || userRole === 'superuser';
  const showRegisteredBy = userRole === 'admin' || userRole === 'superuser';
  
  return (
  <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200 w-full">
    <div className="flex justify-between items-start">
      <h3 className="font-bold text-lg text-blue-700">{dealer.trade_name}</h3>
      <div className="flex items-center space-x-2 gap-2 w-auto">
          <Select
            placeholder="Select status"
            defaultValue={dealer.status}
            onChange={(e) => onStatusChange(dealer.id, e.target.value)}
            className="text-xs "
            options={['Active', 'Disabled']}
          />
          {showEditButton &&
            <Button type="submit" className="hover:bg-blue-600 text-gray-500 flex justify-center rounded-sm !w-fit !p-2" onClick={() => onEdit({...dealer})}>
            <SquarePen size={18}/>
          </Button>
          }
      </div>
    </div>
    <p className="text-sm text-gray-600 mt-2">GST: {dealer.gst_no}</p>
    <p className="text-sm text-gray-600">{dealer.contact_person} - {dealer.contact_number}</p>
    <p className="text-sm text-gray-500 mt-1">{dealer.district}, {dealer.state} - {dealer.pincode}</p>
    {showRegisteredBy && (
      <p className="text-xs text-gray-400 mt-3 pt-2 border-t">Registered By: {dealer.registered_by_name}</p>
    )}
  </div>

  )
}

export default DealerCard