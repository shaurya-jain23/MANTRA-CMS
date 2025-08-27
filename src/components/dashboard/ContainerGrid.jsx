import React, { useState, useRef }  from 'react';
import ContainerCard from './ContainerCard';
import html2canvas from 'html2canvas-pro';
import {SalesCardTemp} from '../index';


function ContainerGrid({ containers, visibleColumns, entries }) {

  const [selectedContainer, setSelectedContainer] = useState(null);
  const salesCardRef = useRef();

  const handleDownloadRequest = (container) => {
    setSelectedContainer(container);
    // Use a timeout to ensure the state has updated and the component has re-rendered
    setTimeout(() => {
      triggerDownload();
    }, 100);
  };
  
  const triggerDownload = async () => {
    const cardElement = salesCardRef.current;
    if (!cardElement || !selectedContainer) return;

    const canvas = await html2canvas(cardElement, { scale: 2 });
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `MANTRA_Container_${selectedContainer.container_no}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!containers || containers.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No containers match the current filters.</p>
  }

  return (
    <div>
      {selectedContainer && (
        <div className="absolute -left-[9999px] top-0">
          <SalesCardTemp ref={salesCardRef} container={selectedContainer} />
        </div>
      )}
      <div className='text-lg mb-1'>
        <p>No. of Entries: <b>{entries}</b></p>
      </div>
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-1">
        {containers.map((container) => (
          <ContainerCard 
            key={container.id} 
            container={container} 
            visibleColumns={visibleColumns.map(key => key.key)}
            onDownloadRequest={() => handleDownloadRequest(container)}
          />
        ))}
      </div>
    </div>
  );
}

export default ContainerGrid;
