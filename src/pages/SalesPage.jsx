import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../features/user/userSlice';
import { selectAllContainers ,selectContainerStatus, fetchContainers } from '../features/containers/containersSlice';
import {SalesCard, BookingForm, SalesCardTemp,SearchBar, DropDown, ExportControls,StatCard, Pagination, Container, Tabs, Loading} from '../components'; 
import bookingService from '../firebase/bookings';
import dealerService from '../firebase/dealers';
import { Ship, Anchor, ListChecks, FileText, AlertCircle } from 'lucide-react';
import { TABS, salesColumns, salesSortOptions } from '../assets/utils';
import html2canvas from 'html2canvas-pro';
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import {toast} from 'react-hot-toast';
import { parseISO,format, isValid } from 'date-fns';


function SalesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerStatus = useSelector(selectContainerStatus);
  const containerData = useSelector(selectAllContainers);
  const [allContainers, setAllContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('eta_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('')
  const containersPerPage = 10;
    const dropdownRef = useRef();
    const salesCardRef = useRef();

  // State for the booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [bookedContainer, setBookedContainer] = useState(null);
  
  
  useEffect(() => {
    if (containerStatus === 'idle') {
      dispatch(fetchContainers());
    }
    if(containerStatus === 'succeeded'){
      setAllContainers(containerData);
      setLoading(false);
    }
    if(containerStatus === 'failed'){
        setError('Failed to fetch containers data.')
        toast.error(`Failed to fetch containers data`)
        setLoading(false)
      }
  }, [containerStatus, dispatch]);
  
  const userData = useSelector(selectUser);

  const isAdmin = ['admin', 'superuser'].includes(userData?.role);

  const availableContainers = useMemo(() => {
    const OTHER_MODELS = ['SINGLE LIGHT', 'DOUBLE LIGHT'];
    let processed = [...allContainers].filter(c => c.sales_status === 'Available for sale');
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
        String(c.model).toLowerCase().includes(lowercasedQuery) ||
        String(c.job_no).toLowerCase().includes(lowercasedQuery) ||
        String(c.bl_number).toLowerCase().includes(lowercasedQuery) || 
        String(c.port).toLowerCase().includes(lowercasedQuery) 
      );
    }

    processed = processed.map(c => {
      let dateObject;
      if (c.eta === 'N/A' || !c.eta) dateObject= c.eta
      else dateObject= parseISO(c.eta)

      if (!isValid(dateObject)) dateObject= 'N/A';
      
      return {...c, eta: dateObject}})
    

    const [key, direction] = sortKey.split('_');
    processed.sort((a, b) => {
      if (key === 'eta') {
        const timeA = a.eta || 0;
        const timeB = b.eta || 0;
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
      if (isDownloading) return; // Prevent new downloads while one is in progress
      setSelectedContainer(container);
      setIsDownloading(true);
      toast.loading('Preparing container card...');
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

  const handleExportData = (fileType) => {
    const toastId = toast.loading('Exporting containers data...');
      if (fileType === 'PDF') {
        const doc = new jsPDF({
          orientation: "landscape",
        });
        
        doc.setFontSize(18);
        doc.text(`${activeTab} Available Containers`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Date: ${new Date().toLocaleDateString() }`, 14, 30);
  
        const exportColumns = isAdmin ? [{ header: 'Company Name', key: 'company_name' }, ...salesColumns, { header: 'Port', key: 'port' }] : salesColumns;
        const tableColumn = exportColumns.map(c => c.header);
        
        const tableRows = availableContainers.map(container => {
          return exportColumns.map(c => {
            const key = c.key;
            const value = container[key];
            if (key === 'eta') return ((container.eta instanceof Date) ? format(container[key], 'dd-MMM'): 'N/A');
            return value || 'N/A';
          });
        });
  
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 35,
        });
        toast.success('Containers data exported');
        doc.save(`${activeTab}_Available_Containers_${new Date().toLocaleDateString()}.pdf`);
        toast.dismiss(toastId);
      }
    };

  // --- Booking Modal Handlers ---
  const handleOpenBookingModal = (container) => {
    setBookedContainer(container);
    setIsBookingModalOpen(true);
  };
  const handleCloseBookingModal = () => setIsBookingModalOpen(false);

  const handleBookingSubmit = async (bookingData) => {
    const toastId = toast.loading('Creating the Booking...');
    try {
      await bookingService.createBooking(bookingData);
      const dealer = await dealerService.getDealerById(bookingData.dealerId);
      await bookingService.updateContainerStatus(bookingData.containerId, 'Pending Booking', dealer.trade_name);
      handleCloseBookingModal();
      navigate('/bookings');
    } catch (error) {
      toast.error(error.message)
    }
     finally{
      toast.dismiss(toastId);
     }
  };

  const atSeaCount = availableContainers.filter(c => c.status === 'At Sea').length;
  const atPortCount = availableContainers.filter(c => c.status !== 'At Sea').length;

  const paginatedContainers = availableContainers.slice((currentPage - 1) * containersPerPage, currentPage * containersPerPage);

  if (loading) {
    return <Loading isOpen={true} message="Loading Available Containers..." />
  }

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
            <SearchBar
            query={searchQuery} 
            setQuery={setSearchQuery} 
            className='rounded-xs py-2'
            resultCount={availableContainers.length}
            placeholder='Search by Container No, Model,Port , BL No, Job No...'
            />
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
      
      {error && 
        <div className='flex flex-col items-center py-12 text-center'>
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className='w-8 h-8 text-red-600'/>
        </div>
        <h3 className='text-lg font-medium text-slate-900 mb-2'>Error Occured</h3>
        <p className="text-red-500  mb-6 max-w-md">Error: {error}</p>
      </div>      
      }

      {!error && (availableContainers.length === 0 ? <div className='flex flex-col items-center py-12 text-center'>
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <FileText className='w-8 h-8 text-slate-400'/>
        </div>
        <h3 className='text-lg font-medium text-slate-900 mb-2'>No containers found</h3>
        <p className="text-slate-500 mb-6 max-w-md">Your search or filter criteria did not match any of the containers. <br /> Try adjusting search.</p>
      </div> : <>
      <div className={`hidden lg:grid ${isAdmin ? 'grid-cols-11' : 'grid-cols-10'}  gap-4 px-4 py-2 font-normal text-md text-gray-600 text-center bg-gray-50 rounded-lg`}>
            {isAdmin ? <div className='col-span-2'>Container & Company</div> : 
            <div>Container</div>}
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
                isAdmin= {isAdmin}
            />
            ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalEntries={availableContainers.length}
          entriesPerPage={containersPerPage}
          onPageChange={setCurrentPage}
        />
        {availableContainers.length > 0 && (
            <div className="sm:mt-8">
              <ExportControls onExport={handleExportData} />
            </div>
        )}
      </>)}
      
        <BookingForm
            container={bookedContainer}
            onSubmit={handleBookingSubmit}
            onCancel={handleCloseBookingModal}
            isOpen= {isBookingModalOpen}
          />
      </div>
    </Container>
    
  );
}

export default SalesPage;
