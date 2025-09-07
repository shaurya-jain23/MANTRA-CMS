import { SquarePen } from 'lucide-react';
import { Button, Select } from '../index';


function DealerCard({ dealer, onEdit, onStatusChange, userData }) {
  const userRole = userData?.role;
  const isAuthor = dealer?.registered_by_id === userData?.uid;
  
  // const isAuthor = dealer && userData ? dealer.registered_by_id === userData.uid : false;

  const showEditButton = isAuthor || userRole === 'superuser';
  const showRegisteredBy = userRole === 'admin' || userRole === 'superuser';
  
  return (
    <>
    <div className="bg-white p-4 hidden border-gray-200 lg:border-0 lg:border-b-1 lg:grid lg:grid-cols-9 lg:gap-3 lg:items-center lg:text-center">
      {/* Container No (1 cols) */}
      <div className="mb-4 lg:mb-0 text-md pb-2 lg:pb-0 border-b-1 lg:border-b-0 border-gray-200">
        <p className="font-semibold text-indigo-700">{dealer.trade_name}</p>
      </div>

      {/* Model & Specs (2 cols) */}
      <div className="lg:col-span-2 mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0  flex-wrap">
        <p className="font-normal lg:hidden lg:text-xs text-gray-500">Contact Person & Phone No.:</p>
        <p className="font-normal">{dealer.contact_person}</p>
        <p className="text-gray-500">{dealer.contact_number}</p>
      </div>
      
      {/* Qty (1 col) */}
      <div className="mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0  flex-wrap">
        <p className="font-normal lg:hidden lg:text-xs text-gray-500">GST No.:</p>
        <p className="text-sm">{dealer.gst_no}</p>
      </div>

      {/* Colours (2 cols) */}
      <div className="lg:col-span-2 mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0 flex-wrap">
        <p className="font-normal lg:hidden lg:text-xs text-gray-500">Address:</p>
        <p className="text-sm">{dealer.district}, {dealer.state}</p>
        <p className=" text-gray-500">{dealer.pincode}</p>
      </div>

      {/* Battery & Chargers (1 cols) */}
      <div className="lg:col-span-1 mb-4 lg:mb-0 text-sm flex lg:flex-col gap-1 lg:gap-0 flex-wrap">
        <p className="font-normal lg:hidden lg:text-xs text-gray-500">Registered By:</p>
        <p>{dealer.registered_by_name}</p>
      </div>
      
      {/* ETA / Port (1 col) */}
      {/* <div className="mb-4 lg:mb-0 text-sm flex lg:flex-col gap-1 lg:gap-0 flex-wrap">
        <p className="font-normal lg:hidden lg:text-xs text-gray-500">ETA / Port:</p>
        <p className="text-sm">{etaDate}</p>
        <p className="text-sm lg:hidden">@</p>
        <p className="text-sm text-gray-500">{container.port}</p>
      </div> */}
      <div className="lg:col-span-2 flex flex-row justify-around lg:pt-0 lg:items-center gap-2 lg:mt-0 pt-4">
        <Select
            placeholder="Select status"
            defaultValue={dealer.status}
            onChange={(e) => onStatusChange(dealer.id, e.target.value)}
            className="text-xs lg:!w-1/2"
            options={['Active', 'Disabled']}
          />
        
        {showEditButton &&
            <Button
              type="submit" 
              bgColor= 'bg-white'
              textColor='text-black'
              className="hover:bg-gray-100 border border-gray-100 text-gray-500 flex justify-center !w-fit !p-2" 
              onClick={() =>{onEdit({...dealer})}}>
            <SquarePen size={18}/>
          </Button>
          }
        
      </div>
    </div>
  <div className="bg-white p-4 rounded-xs border border-gray-200 w-full lg:hidden">
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
      <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-200">Registered By: {dealer.registered_by_name}</p>
    )}
  </div>
    </>
  )
}

export default DealerCard