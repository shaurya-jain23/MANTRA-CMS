import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {ColorBar} from '../index';

// A helper component for displaying details in the expanded view
const DetailRow = ({ label, value }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || 'N/A'}</dd>
  </div>
);

function ContainerCard({ container, visibleColumns }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleBookClick = (e) => {
    e.stopPropagation(); // Prevent the card from toggling when the button is clicked
    navigate(`/book/${container.id}`);
  };

  // Dynamically create a list of key details to show in the collapsed view
  const keyDetails = visibleColumns
    .map((key) => (
      key === 'colours' ? { label: 'Color Distribution', value: <ColorBar colorString={container[key]} /> } :
      { label: key.replace(/_/g, ' '), value: container[key] }))
    .slice(0, 6); // Show up to 4 key details

  return (
    <div
      className="bg-white shadow-3xl  transform translate-y-0 hover:-translate-y-3 transition duration-300 ease-in-out cursor-pointer border-gray-200"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* --- Collapsed View --- */}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800 truncate pr-4">
            {container.container_no}
          </h3>
          <span className='pr-2'>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-8 w-8 text-gray-600 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div >

        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-base text-gray-600">
          {keyDetails.map((detail) => (
            <div className='flex gap-2' key={detail.label}>
              <span className="font-semibold">{detail.label.toUpperCase()}:</span>{' '}
              {detail.label === 'eta'?  (detail.value?.seconds ? new Date(detail.value.seconds * 1000).toLocaleDateString() : 'N/A')  : detail.value || 'N/A'}</div>
          ))}
        </div>
         {/* --- Arrow Icon --- */}
        <div className="flex justify-end">
              <span
            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              container.sales_status === 'Available for sale'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {container.sales_status}
          </span>
        </div>
      </div>
      
      {/* --- Expanded View --- */}
        <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-screen px-6 py-4' : 'max-h-0'}`}>
          <dl>
            {Object.keys(container)
              .filter(key => ['id', 'update_timestamps', 'booking_order'].indexOf(key) === -1)
              .map((key) => (
              <DetailRow 
                label={key.replace(/_/g, ' ').toUpperCase()}
                value={ key === 'eta' || key === 'etd'  ?  (container[key]?.seconds? new Date(container[key].seconds * 1000).toLocaleDateString() : 'N/A') : container[key] || 'N/A'} />
            ))}
          </dl>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleBookClick}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
              disabled={container.sales_status !== 'Available'}
            >
              {(container.sales_status === 'Available for sale') ? 'Book Now' : 'Not Available'}
            </button>
          </div>
        </div>
      
    </div>
  );
}

export default ContainerCard;
