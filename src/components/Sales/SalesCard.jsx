import React from 'react';
import { Button } from '../';
import { Download } from 'lucide-react';
import { ColorBar } from '../index';
import { format } from 'date-fns';

function SalesCard({ container, onBookNow,onDownloadRequest, isAdmin }) {

  // Dummy download handler
  const handleDownloadCard = (e) => {
    e.stopPropagation(); // Prevent card click
    onDownloadRequest();
  };

   const handleBookClick = (e) => {
    e.stopPropagation(); 
    onBookNow(container);
  };

  let etaDate;
  if (container.eta && container.eta !== 'N/A') {
    etaDate = format(container.eta, 'dd-MMM');
  } else {
    etaDate = 'N/A';
  }
  

  return (
    <>
    <div className={`bg-white p-4 flex flex-col justify-start border border-gray-200 lg:border-0 lg:border-b-1 lg:grid ${isAdmin? 'lg:grid-cols-11' : 'lg:grid-cols-10'} lg:gap-3 lg:items-center lg:text-center`}>
      {/* Container No (1 cols) */}
      <div className={`mb-4 lg:mb-0 text-md pb-2 lg:pb-0 border-b-1 lg:border-b-0 border-gray-200 ${isAdmin ? 'lg:col-span-2' : 'lg:col-span-1'}`} >
        <p className="font-semibold text-blue-700">{container.container_no}</p>
        {isAdmin && <div className='flex items-center gap-1 lg:justify-center text-sm '>
        <p className="font-normal lg:hidden lg:text-xs text-gray-500">Company:</p>
        <p className=" lg:text-center lg:text-gray-500">{container.company_name}</p></div>}
      </div>

      {/* Model & Specs (2 cols) */}
      <div className="lg:col-span-2 mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0  flex-wrap">
        <p className="font-normal lg:hidden lg:text-xs text-gray-500">Model & Specs:</p>
        <p className="lg:font-normal">{container.model}</p>
        <p className="lg:text-xs lg:text-gray-500">{container.specifications}</p>
      </div>
      
      {/* Qty (1 col) */}
      <div className="mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0  flex-wrap">
        <p className="font-normal lg:hidden lg:text-xs text-gray-500">Qty:</p>
        <p className="text-sm">{container.qty}</p>
      </div>

      {/* Colours (2 cols) */}
      <div className="lg:col-span-2 mb-2 lg:mb-0 flex lg:flex-col text-sm gap-1 lg:gap-0 flex-wrap">
        <p className="font-normal lg:hidden lg:text-xs text-gray-500">Color Distribution:</p>
        <p className="text-sm">{container.colours}</p>
      </div>

      {/* Battery & Chargers (2 cols) */}
      <div className="lg:col-span-2 mb-4 lg:mb-0 text-sm flex lg:flex-col gap-1 lg:gap-0 flex-wrap">
        <p className="font-normal lg:hidden lg:text-xs text-gray-500">Extras:</p>
        <p>{container.battery}</p>
        <p>{container.charger}</p>
      </div>
      
      {/* ETA / Port (1 col) */}
      <div className="mb-4 lg:mb-0 text-sm flex lg:flex-col gap-1 lg:gap-0 flex-wrap">
        <p className="font-normal lg:hidden lg:text-xs text-gray-500">ETA / Port:</p>
        <p className="text-sm">{etaDate}</p>
        <p className="text-sm lg:hidden">@</p>
        <p className="text-sm text-gray-500">{container.port}</p>
      </div>

      <div className="lg:hidden xs:block hidden mb-4">
        <ColorBar colorString={container.colours} />
      </div>
      {/* Actions (1 col on desktop) */}
      <div className="flex flex-row-reverse justify-between lg:flex-col lg:pt-0 lg:items-center gap-2 lg:mt-0 pt-4">
        <Button
          onClick={handleBookClick}
          bgColor= 'bg-blue-700'
          textColor='text-white'
          className="hover:border-blue-700 !shadow-none border border-gray-100 !w-fit !p-2 text-xs !font-normal transition-all duration-300">
                BOOK NOW
        </Button>
        <Button
          onClick={handleDownloadCard}
          bgColor= 'bg-white'
          textColor='text-black'
          className="hover:bg-gray-100 border border-gray-100 !w-fit !p-2">
                <Download size={16} />
        </Button>
      </div>
    </div>
    </>
  );
}

export default SalesCard;
