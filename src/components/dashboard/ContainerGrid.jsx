import React, { useState, useRef, useEffect }  from 'react';
import ContainerCard from './ContainerCard';
import html2canvas from 'html2canvas-pro';
import {SalesCardTemp} from '../index';
import toast from 'react-hot-toast';


function ContainerGrid({ containers, visibleColumns, entries, onBookNow }) {

  const [selectedContainer, setSelectedContainer] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const salesCardRef = useRef();

 const handleDownloadRequest = (container) => {
    if (isDownloading) return; // Prevent new downloads while one is in progress
    setSelectedContainer(container);
    setIsDownloading(true);
    toast.loading('Preparing container card...');
  };
  const handleToggleCard = (cardId) => {
    setExpandedCardId(prevId => (prevId === cardId ? null : cardId));
  };

  useEffect(() => {
    if (selectedContainer && salesCardRef.current) {
      const triggerDownload = async () => {
        const cardElement = salesCardRef.current;
        if (!cardElement) return;

        try {
          const canvas = await html2canvas(cardElement, { scale: 2 });
          const dataUrl = canvas.toDataURL('image/png');
          
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `MANTRA_Container_${selectedContainer.container_no}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.dismiss();
          toast.success('Container card downloaded');

        } catch (error) {
          toast.dismiss();
          toast.error('Failed to download card.');
        } finally {
          // Reset the state so another download can be triggered
          setSelectedContainer(null);
          setIsDownloading(false);
        }
      };

      triggerDownload();
    }
  }, [selectedContainer, isDownloading]); 

  // const triggerDownload = async () => {
  //    const toastId = toast.loading('Downloading container card...');
  //   const cardElement = salesCardRef.current;
  //   if (!cardElement || !selectedContainer) return;

  //   const canvas = await html2canvas(cardElement, { scale: 2 });
  //   const dataUrl = canvas.toDataURL('image/png');
    
  //   const link = document.createElement('a');
  //   link.href = dataUrl;
  //   link.download = `MANTRA_Container_${selectedContainer.container_no}.png`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   toast.dismiss(toastId);
  //   toast.success('Container card downloaded');
  // };

  if (!containers || containers.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No containers match the current filters.</p>
  }

  return (
    <div className='xs:mb-5 mb-0'>
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
            isExpanded={expandedCardId === container.id}
            onToggle={() => handleToggleCard(container.id)}
            onBookNow={() => onBookNow(container)}
          />
        ))}
      </div>
    </div>
  );
}

export default ContainerGrid;
