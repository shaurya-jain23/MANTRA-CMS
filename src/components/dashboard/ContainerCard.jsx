import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import { ColorBar, SalesCardTemp } from '../index';
import { ChevronDown, Download } from 'lucide-react';
import {Button} from '../index'
import { salesStatusMap, containerStatusMap, containerDetailsOrder } from '../../assets/utils';

const DetailRow = ({ label, value }) => (
  <div className="py-2 flex justify-between border-b border-gray-100 last:border-b-0">
    <dt className="text-sm font-medium text-gray-500 capitalize">{label}</dt>
    <dd className="text-sm text-gray-900 text-right truncate">{value || 'N/A'}</dd>
  </div>
);

function ContainerCard({ container, visibleColumns, onDownloadRequest }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const salesCardRef = useRef();
  const eta = container.eta?.seconds ? new Date(container.eta.seconds * 1000).toLocaleDateString() : null;

  const handleBookClick = (e) => {
    e.stopPropagation(); // Prevent the card from toggling when the button is clicked
    navigate(`/book/${container.id}`);
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    onDownloadRequest(); // Call the function passed from the parent grid
  };

  const handleTrackClick = (e) => {
    e.stopPropagation(); // Prevent the card from toggling when the button is clicked
    if (container.container_no) {
      const url = `https://www.ldb.co.in/ldb/containersearch/39/${container.container_no}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Tracking link not available for this container.');
    }
  }

  // const handleDownloadSalesCard = async (e) => {
  //   e.stopPropagation(); // Prevent card from toggling
  //   const cardElement = salesCardRef.current;
  //   if (!cardElement) return;

  //   const canvas = await html2canvas(cardElement, { scale: 2 });
  //   const dataUrl = canvas.toDataURL('image/png');

  //   const link = document.createElement('a');
  //   link.href = dataUrl;
  //   link.download = `MANTRA_Container_${container.container_no}.png`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  // Dynamically create a list of key details to show in the collapsed view
  const keyDetails = visibleColumns
    .map((key) =>
      key === 'colours'
        ? { label: 'Color Distribution', value: <ColorBar colorString={container[key]} /> }
        : { label: key.replace(/_/g, ' '), value: container[key] }
    )
    .slice(0, 6); // Show up to 4 key details

  // --- Logic for the new 2-column layout ---
  const allDetailKeys = Object.keys(container)
    .filter((key) => ['id', 'update_timestamps', 'booking_order'].indexOf(key) === -1)
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
        {/* --- Arrow Icon --- */}
        <div className='flex gap-2 lg:justify-between flex-col lg:flex-row'>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-base text-gray-600">
            {keyDetails.map((detail) => (
              <div className="flex gap-2 flex-wrap" key={detail.label}>
                <span className="font-semibold">{detail.label.toUpperCase()}:</span>{' '}
                {detail.label === 'eta'
                  ? detail.value?.seconds
                    ? new Date(detail.value.seconds * 1000).toLocaleDateString()
                    : 'N/A'
                  : detail.value || 'N/A'}
              </div>
            ))}
          </div>
          
            <div className="flex flex-col items-end gap-1.5 min-w-50">
              <span
                className={`px-3 py-1 flex text-xs leading-5 font-semibold ${container.sales_status? '': 'hidden'} rounded-full ${
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
            <div className={`${eta && eta <= new Date().toLocaleDateString() ? 'block' : 'hidden' } w-40`}>
              <Button type="submit" bgColor='bg-blue-600' className="hover:bg-blue-700 text-sm" onClick={handleTrackClick}>
                Track Shipment
              </Button>
            </div>
            <div>
              <Button
                onClick={handleBookClick}
                bgColor='bg-blue-800'
                className="text-sm font-medium hover:bg-blue-600 disabled:bg-gray-400"
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
