import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/user/userSlice';
import containerService from '../firebase/container';
import {SalesCard, BookingForm, SalesCardTemp,SearchBar, DropDown, ExportControls,StatCard, Pagination, Container, Tabs} from '../components'; 
import bookingService from '../firebase/bookings';
import dealerService from '../firebase/dealers';
import { Ship, Anchor, ListChecks } from 'lucide-react';
import { TABS, salesColumns, salesSortOptions } from '../assets/utils';
import html2canvas from 'html2canvas-pro';




function SalesPage() {
  const [allContainers, setAllContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('eta_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  const containersPerPage = 10;
    const dropdownRef = useRef();
    const salesCardRef = useRef();

  // State for the booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  
  const userData = useSelector(selectUser);

  useEffect(() => {
    const unsubscribe = containerService.getContainers({}, (data) => {
      setAllContainers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const availableContainers = useMemo(() => {
    const OTHER_MODELS = ['SINGLE LIGHT', 'DOUBLE LIGHT'];
    let processed = allContainers.filter(c => c.sales_status === 'Available for sale');
    if (activeTab === 'SINGLE LIGHT') {
      processed = processed.filter(c => c.model === 'SINGLE LIGHT');
    } else if (activeTab === 'DOUBLE LIGHT') {
      processed = processed.filter(c => c.model === 'DOUBLE LIGHT');
    } else if (activeTab === 'OTHER MODELS') {
      processed = processed.filter(c => !OTHER_MODELS.includes(c.model));
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      processed = processed.filter(c => 
        String(c.container_no).toLowerCase().includes(lowercasedQuery) ||
        String(c.model).toLowerCase().includes(lowercasedQuery)
      );
    }

    const [key, direction] = sortKey.split('_');
    processed.sort((a, b) => {
      if (key === 'eta') {
        const timeA = a.eta?.seconds || 0;
        const timeB = b.eta?.seconds || 0;
        return direction === 'asc' ? timeA - timeB : timeB - timeA;
      }
      const valA = a[key] || '';
      const valB = b[key] || '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return processed;
  }, [allContainers, searchQuery, sortKey,activeTab]);

  useEffect(() => {
      setCurrentPage(1);
  }, [availableContainers]);

  const handleDownloadRequest = (container) => {
    setSelectedContainer(container);
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

  // --- Booking Modal Handlers ---
  const handleOpenBookingModal = (container) => {
    console.log(container);
    
    setSelectedContainer(container);
    setIsBookingModalOpen(true);
  };
  const handleCloseBookingModal = () => setIsBookingModalOpen(false);

  const handleBookingSubmit = async (bookingData) => {
    try {
      await bookingService.createBooking(bookingData);
      const dealer = await dealerService.getDealerById(bookingData.dealerId);
      await bookingService.updateContainerStatus(bookingData.containerId, 'Pending Booking', dealer.trade_name);
      alert('Booking request submitted!');
      handleCloseBookingModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const atSeaCount = availableContainers.filter(c => c.status === 'At Sea').length;
  const atPortCount = availableContainers.filter(c => c.status !== 'At Sea').length;

    const paginatedContainers = availableContainers.slice((currentPage - 1) * containersPerPage, currentPage * containersPerPage);


  if (loading) return <div className="p-8 text-center">Loading Available Containers...</div>;

  return (
    <Container>
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
        <div className="w-full flex flex-col justify-between mb-10">
            <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Available" value={availableContainers.length} icon={<ListChecks className="text-blue-500" />} />
            <StatCard title="At Sea" value={atSeaCount} icon={<Ship className="text-teal-500" />} />
            <StatCard title="At Port / In Transit" value={atPortCount} icon={<Anchor className="text-indigo-500" />} />
        </div>

        <div className="bg-white p-4 border-b-gray-100">
            <Tabs tabs={TABS} activeTab={activeTab} onTabClick={setActiveTab} />
            <div className="flex flex-col lg:flex-row justify-between items-center pt-6 gap-4">
            <SearchBar query={searchQuery} setQuery={setSearchQuery} className='rounded-xs py-2' resultCount={availableContainers.length}/>
            <DropDown 
                ref={dropdownRef}
                options={salesSortOptions} 
                selected={sortKey} 
                label="Sort by" 
                onChange={(val) => setSortKey(val)} />
            </div>
        </div>
        {selectedContainer && (
        <div className="absolute -left-[9999px] top-0">
          <SalesCardTemp ref={salesCardRef} container={selectedContainer} />
        </div>
        )}
      {/* Desktop Header for the Grid */}
        <div className="hidden lg:grid grid-cols-10 gap-4 px-4 py-2 font-normal text-md text-gray-600 text-center bg-gray-50 rounded-lg">
            <div>Container</div>
            <div className="col-span-2">Model & Specs</div>
            <div>Qty</div>
            <div className="col-span-2">Colours</div>
            <div className="col-span-2">Battery & Chargers</div>
            <div>ETA / Port</div>
            <div>Actions</div>
        </div>
      
        <div className="space-y-4">
            {paginatedContainers.map(container => (
            <SalesCard 
                key={container.id} 
                container={container}
                onDownloadRequest={() => handleDownloadRequest(container)}
                onBookNow={() => handleOpenBookingModal(container)}
            />
            ))}
        </div>

      <Pagination
        currentPage={currentPage}
        totalEntries={availableContainers.length}
        entriesPerPage={containersPerPage}
        onPageChange={setCurrentPage}
      />
      
      <div className="mt-8">
        <ExportControls 
          data={availableContainers} 
          columns={salesColumns} 
          fileName="Available_Containers_Report"
        />
      </div>
        <BookingForm
            container={selectedContainer}
            onSubmit={handleBookingSubmit}
            onCancel={handleCloseBookingModal}
            isOpen= {isBookingModalOpen}
          />
      </div>
    </Container>
    
  );
}

export default SalesPage;
