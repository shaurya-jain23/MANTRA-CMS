import React, { useState, useRef } from 'react';
import { ColorBar } from '../index';
import { ChevronDown, Download } from 'lucide-react';
import {Button} from '../index'
import { salesStatusMap, containerStatusMap, containerDetailsOrder } from '../../assets/utils';

const DetailRow = ({ label, value }) => (
  <div className="py-2 flex flex-col xs:flex-row sm:justify-between border-b border-gray-100 last:border-b-0 gap-2">
    <dt className="text-sm font-medium text-gray-500 capitalize">{label}:</dt>
    <dd className="text-sm text-wrap text-gray-900 sm:text-right truncate">{value || 'N/A'}</dd>
  </div>
);

function ContainerCard({ container, visibleColumns, onDownloadRequest,  isExpanded, onToggle, onBookNow }) {
  const salesCardRef = useRef();
  const eta = container.eta?.seconds ? new Date(container.eta.seconds * 1000).toLocaleDateString() :'N/A';
  const etd = container.etd?.seconds ? new Date(container.etd.seconds * 1000).toLocaleDateString() : 'N/A';

  const handleBookClick = (e) => {
    e.stopPropagation(); 
    onBookNow(container);
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    onDownloadRequest(); 
  };

  const handleTrackClick = (e) => {
    e.stopPropagation(); 
    if (container.container_no) {
      const url = `https://www.ldb.co.in/ldb/containersearch/39/${container.container_no}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Tracking link not available for this container.');
    }
  }
  
  const keyDetails = visibleColumns
    .map((key) =>
      key === 'colours'
        ? { label: 'Color Distribution', value: <ColorBar colorString={container[key]} /> }
        : { label: key.replace(/_/g, ' '), value: container[key] }
    )
    .slice(0, 8); 

  // --- Logic for the new 2-column layout ---
  const allDetailKeys = Object.keys(container)
    .filter((key) => ['id', 'update_timestamps', 'booking_order', 'booking_remarks', 'shipping_rent'].indexOf(key) === -1)
    .sort((a, b) => containerDetailsOrder[a] - containerDetailsOrder[b]);

  const midPoint = Math.ceil(allDetailKeys.length / 2);
  const leftColumnKeys = allDetailKeys.slice(0, midPoint);
  const rightColumnKeys = allDetailKeys.slice(midPoint);
  return (
    <div
      className="bg-white shadow-3xl  transform translate-y-0 hover:-translate-y-1 transition duration-300 ease-in-out cursor-pointer border-gray-200 rounded-sm"
      onClick={onToggle}
    >
      {/* --- Collapsed View --- */}
      <div className="p-4 sm:p-6 w-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800 truncate pr-4">
              {container.container_no}
            </h3>
            <span
              className={`py-1 px-2 inline-flex text-xs sm:text-sm leading-5 font-medium rounded-3xl sm:rounded-md ${
                containerStatusMap.find((doc) => (doc.status === container.status ? true : null))
                  ?.colour
              }`}
            >
              {container.status.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="pr-2">
              <ChevronDown
                className={`w-8 h-8 ml-2 text-gray-600 duration-500 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </span>
          </div>
        </div>
        <div className='flex gap-3 sm:gap-2 lg:justify-between flex-col lg:flex-row'>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-base text-gray-600">
            {keyDetails.map((detail) => (
              <div className="flex gap-2 flex-wrap w-full sm:w-fit" key={detail.label}>
                <span className="font-semibold">{detail.label.toUpperCase()}:</span>{' '}
                {detail.label === 'eta'
                  ? eta
                  : detail.value || 'N/A'}
              </div>
            ))}
          </div>
          
            <div className="flex flex-row sm:flex-col justify-end sm:items-end gap-1.5 min-w-50">
              <span
                className={`px-3 py-1 flex text-xs leading-5 font-semibold ${(!container.sales_status || container.sales_status== 'N/A' )? 'hidden': ''} rounded-full ${
                  salesStatusMap.find((doc) =>
                    doc.status === container.sales_status ? true : null
                  )?.colour
                }`}
              >
                {container.sales_status}
              </span>
              <button
                onClick={handleDownloadClick}
                className="p-1 text-gray-500 hover:text-blue-600"
              >
                <Download size={23} />
              </button>
            </div>
          
        </div>
      </div>

      {/* --- Expanded View --- */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-screen' : 'max-h-0'}`}
      >
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10">
            {/* Left Column */}
            <dl>
              {leftColumnKeys.map((key) => (
                <DetailRow
                  key={key}
                  label={key.replace(/_/g, ' ')}
                  value={
                    key === 'eta' || key === 'etd'
                      ? container[key]?.seconds
                        ? new Date(container[key].seconds * 1000).toLocaleDateString()
                        : 'N/A'
                      : container[key]
                  }
                />
              ))}
            </dl>
            {/* Right Column */}
            <dl>
              {rightColumnKeys.map((key) => (
                <DetailRow
                  key={key}
                  label={key.replace(/_/g, ' ')}
                  value={
                    key === 'eta' || key === 'etd'
                      ? container[key]?.seconds
                        ? new Date(container[key].seconds * 1000).toLocaleDateString()
                        : 'N/A'
                      : container[key]
                  }
                />
              ))}
            </dl>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <div className={`${container.status !=='Reached Destination' ? 'block' : 'hidden' }`}>
              <Button type="submit" variant='secondary' size='small' onClick={handleTrackClick}>
                Track Shipment
              </Button>
            </div>
            <div>
              <Button
                onClick={handleBookClick}
                variant='primary'
                size='small'
                disabled={container.sales_status !== 'Available for sale'}
              >
                {container.sales_status === 'Available for sale' ? 'Book Now' : 'Not Available'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContainerCard;
