import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {ColorBar} from '../index';
import { ChevronDown } from "lucide-react";
import {salesStatusMap, containerStatusMap, containerDetailsOrder} from '../../assets/utils'


const DetailRow = ({ label, value }) => (
  <div className="py-2 flex justify-between border-b border-gray-100 last:border-b-0">
    <dt className="text-sm font-medium text-gray-500 capitalize">{label}</dt>
    <dd className="text-sm text-gray-900 text-right truncate">{value || 'N/A'}</dd>
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
  
   // --- Logic for the new 2-column layout ---
  const allDetailKeys = Object.keys(container)
    .filter(key => ['id', 'update_timestamps', 'booking_order'].indexOf(key) === -1)
    .sort((a, b) => containerDetailsOrder[a] - containerDetailsOrder[b]);

  const midPoint = Math.ceil(allDetailKeys.length / 2);
  const leftColumnKeys = allDetailKeys.slice(0, midPoint);
  const rightColumnKeys = allDetailKeys.slice(midPoint);
  return (
    <div
      className="bg-white shadow-3xl  transform translate-y-0 hover:-translate-y-1 transition duration-300 ease-in-out cursor-pointer border-gray-200 rounded-sm"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* --- Collapsed View --- */}
      <div className="p-6 w-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800 truncate pr-4">
              {container.container_no}
            </h3>
            <span
              className={`py-1 px-2 inline-flex text-sm leading-5 font-medium rounded-md ${
                containerStatusMap.find((doc)=> doc.status===container.status ? true: null )?.colour
              }`}
            >
              {container.status.toUpperCase()}
            </span>
          </div>
          <span className='pr-2'>
            <ChevronDown
              className={`w-8 h-8 ml-2 text-gray-600 duration-500 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`} />
          </span>
        </div >
        {/* --- Arrow Icon --- */}
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-base text-gray-600 w-full">
          {keyDetails.map((detail) => (
            <div className='flex gap-2 flex-wrap' key={detail.label}>
              <span className="font-semibold">{detail.label.toUpperCase()}:</span>{' '}
              {detail.label === 'eta'?  (detail.value?.seconds ? new Date(detail.value.seconds * 1000).toLocaleDateString() : 'N/A')  : detail.value || 'N/A'}</div>
          ))}
        </div>
        {container.sales_status && <div className="flex justify-end">
            <span
              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                salesStatusMap.find((doc)=> doc.status===container.sales_status ? true: null )?.colour
              }`}
            >
              {container.sales_status}
            </span>
          </div>}

      </div>
      
      {/* --- Expanded View --- */}
        <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10">
            {/* Left Column */}
            <dl>
              {leftColumnKeys.map((key) => (
                <DetailRow
                  key={key}
                  label={key.replace(/_/g, ' ')}
                  value={key === 'eta' || key === 'etd' ? (container[key]?.seconds ? new Date(container[key].seconds * 1000).toLocaleDateString() : 'N/A') : container[key]}
                />
              ))}
            </dl>
            {/* Right Column */}
            <dl>
              {rightColumnKeys.map((key) => (
                <DetailRow
                  key={key}
                  label={key.replace(/_/g, ' ')}
                  value={key === 'eta' || key === 'etd' ? (container[key]?.seconds ? new Date(container[key].seconds * 1000).toLocaleDateString() : 'N/A') : container[key]}
                />
              ))}
            </dl>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleBookClick}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
              disabled={container.sales_status !== 'Available for sale'}
            >
              {(container.sales_status === 'Available for sale') ? 'Book Now' : 'Not Available'}
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default ContainerCard;
