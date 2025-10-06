import React, { useState, useEffect, useMemo, useRef } from 'react';
import { selectAllContainers ,selectContainerStatus, fetchContainers } from '../features/containers/containersSlice';
import { useSelector, useDispatch } from 'react-redux';
import {FilterPanel, ContainerGrid, VisibleColumns, DropDown, SearchBar, ShowMoreButton, ExportControls, Loading, Container} from '../components';
import {sortOptions, etaOptions, ALL_AVAILABLE_COLUMNS, monthOptions} from '../assets/utils'
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from "firebase/firestore";
import toast from 'react-hot-toast';
import { useBooking } from '../contexts/BookingContext';
import { getColorScore } from '../assets/helperFunctions';
import { AlertCircle, FileText } from 'lucide-react';




const DashboardPage = () => {
  const dispatch = useDispatch();
  const containerStatus = useSelector(selectContainerStatus);
  const containerData = useSelector(selectAllContainers);
  const [allContainers, setAllContainers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState({});
  const [sortKey, setSortKey] = useState('eta_asc');
  const [etaKey, setEtaKey] = useState('all')
  const [monthKey, setMonthKey] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [error, setError] = useState('')
  const [visibleColumns, setVisibleColumns] = useState([
    'model',
    'destination',
    'party_name',
    'eta',
    'port',
    'colours'
  ]); 


  const dropdownRef = useRef();
  const { openBookingModal } = useBooking();

  
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

  // --- MEMOIZED FILTERING & SORTING ---
  const processedContainers = useMemo(() => {
    const today = new Date();
    const etaProcessed = [...allContainers].map(c => {const dateObject= new Date(c.eta); 
          const firestoreTimestamp = Timestamp.fromDate(dateObject);
          return {...c, eta: firestoreTimestamp}})
    let processed = [...etaProcessed].filter(c => !['Reached Destination', 'On the way', 'N/A'].includes(c.status));
    

    if (etaKey !== 'all') {
      const selectedDays = parseInt(etaKey, 10);
          const etaUpperBound = today.getTime() + selectedDays * 24 * 60 * 60 * 1000;
          const etalowerBound = today.getTime() - 10 * 24 * 60 * 60 * 1000;
          processed = processed.filter(c => {
            const timestamp = c.eta?.seconds ? c.eta.seconds : c.etd?.seconds;
            if (timestamp) {
              const itemDate = new Date(timestamp * 1000);
              return itemDate.getTime() >= etalowerBound && itemDate.getTime() <= etaUpperBound;
            }
            return false });
    }
    // monthwise filter
    if (monthKey !== 'all') {
      setEtaKey('all')
      const selectedMonth = parseInt(monthKey, 10);
        processed = [...allContainers].filter(c => {
          const timestamp = c.eta?.seconds ? c.eta.seconds : c.etd?.seconds;
          if (timestamp) {
            const itemDate = new Date(timestamp * 1000);
            return itemDate.getMonth() === selectedMonth;
          }
          return false;
        });
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      processed = [...etaProcessed].filter(c => 
        (String(c.container_no).toLowerCase().includes(lowercasedQuery)) ||
        (String(c.bl_number).toLowerCase().includes(lowercasedQuery)) ||
        (String(c.job_no).toLowerCase().includes(lowercasedQuery)) ||
        (String(c.party_name).toLowerCase().includes(lowercasedQuery)) ||
        (String(c.destination).toLowerCase().includes(lowercasedQuery))
      );
    } 
    
    //filterpanel filters
    Object.keys(activeFilters).forEach(key => {
      const filterValue = activeFilters[key];
      if (Array.isArray(filterValue) && filterValue?.length > 0) {
        processed = processed.filter(c => {
          const match = c[key]?.trim().replace(/\s+/g, '_').toLowerCase()
          return filterValue.includes(match)
        });
      } 
    });

    //sorting
    const [key, direction] = sortKey.split('_');
    processed.sort((a, b) => {
      if (key === 'eta') {
        const etaA = a.eta?.seconds;
        const etaB = b.eta?.seconds;
        const etdA = a.etd?.seconds;
        const etdB = b.etd?.seconds;

        const hasEtaA = !!etaA;
        const hasEtaB = !!etaB;

        // Rule 1: If one has an ETA and the other doesn't, the one with the ETA comes first.
        if (hasEtaA && !hasEtaB) return -1;
        if (!hasEtaA && hasEtaB) return 1;

        // Rule 2: If both have an ETA, sort by ETA.
        if (hasEtaA && hasEtaB) {
          return direction === 'asc' ? etaA - etaB : etaB - etaA;
        }

        // Rule 3: If neither has an ETA, sort by ETD instead.
        const effectiveEtdA = etdA || (direction === 'asc' ? Infinity : -Infinity);
        const effectiveEtdB = etdB || (direction === 'asc' ? Infinity : -Infinity);
        return direction === 'asc' ? effectiveEtdA - effectiveEtdB : effectiveEtdB - effectiveEtdA;
      }
      if (key === 'color') return direction === 'bright' ? getColorScore(b.colours, 'bright') - getColorScore(a.colours, 'bright') : getColorScore(b.colours, 'dark') - getColorScore(a.colours, 'dark');
      const valA = a[key] || '';
      const valB = b[key] || '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return processed;
  }, [allContainers, activeFilters, sortKey, monthKey, etaKey, searchQuery]);

  useEffect(() => {
    setVisibleCount(10);
  }, [processedContainers]);

  const handleShowMore = () => {
    setVisibleCount(prevCount => {
      if (prevCount === 10) return 25;
      if (prevCount === 25) return 45; 
      return processedContainers?.length; 
    });
  };
  
  // --- HANDLER FUNCTIONS ---
  const handleFilterApply = (filters) => setActiveFilters(filters);

  const handleColumnChange = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleExportData = (fileType) => {
    const toastId = toast.loading('Exporting containers data...');
    if (fileType === 'PDF') {
      const doc = new jsPDF({
        orientation: "landscape",
      });
      
      // Set Header
      doc.setFontSize(18);
      doc.text("Containers Report", 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Date: ${new Date().toLocaleDateString() }`, 14, 30);

      // Define table columns from visibleColumns state
      const tableColumn = visibleColumns.map(key => ALL_AVAILABLE_COLUMNS.find(c => c.key === key)?.header || key);
      
      // Define table rows from the processed (filtered and sorted) data
      const tableRows = processedContainers.map(container => {
        return visibleColumns.map(key => {
          const value = container[key];
          if (key === 'eta') return (value?.seconds ? new Date(value.seconds * 1000).toLocaleDateString(): 'N/A');
          return value || 'N/A';
        });
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
      });
      
      toast.success('Containers data exported');
      doc.save(`ContainerReport_${new Date().toLocaleDateString()}.pdf`);
      toast.dismiss(toastId);
    }
    // Add logic for XLSX later if needed
  };


  const handleOpenBookingModal = (container) => {
    openBookingModal(container);
  };


  // --- RENDER LOGIC ---
  if (loading) {
    return <Loading isOpen={true} message="Loading Dashboard..." />
  }
  const containersToShow = processedContainers?.slice(0, visibleCount);
  return (
    <Container>
      <div className="w-full flex flex-col justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Container Dashboard</h1>
        <div className="mt-6 md:w-auto flex flex-col sm:items-center gap-4 sm:gap-6">
            <SearchBar
            query={searchQuery}
            setQuery={setSearchQuery}
            resultCount={processedContainers?.length} />
          <div className="flex gap-3 sm:gap-5 items-center flex-wrap sm:justify-center">
            <DropDown
              label="Port Arrival in"
              options={etaOptions}
              selected={etaKey}
              onChange={(val) => setEtaKey(val)}
            />
            <DropDown
              label="Month"
              options={monthOptions}
              selected={monthKey}
              onChange={(val) => setMonthKey(val)}
            />
            <DropDown
              ref={dropdownRef}
              label="Sort by"
              options={sortOptions}
              selected={sortKey}
              onChange={(val) => setSortKey(val)}
            />
          </div>
        </div>
      </div>
     <FilterPanel 
        allContainers={allContainers}
        onFilterApply={handleFilterApply}
        activeFilters={activeFilters}
      />
      <VisibleColumns 
        visibleColumns={visibleColumns}
        onColumnChange={handleColumnChange}
        availableColumns={ALL_AVAILABLE_COLUMNS}
      />
      {error && 
        <div className='flex flex-col items-center py-12 text-center'>
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className='w-8 h-8 text-red-600'/>
        </div>
        <h3 className='text-lg font-medium text-slate-900 mb-2'>Error Occured</h3>
        <p className="text-red-500  mb-6 max-w-md">Error: {error}</p>
      </div>      
      }
      {!error && (processedContainers?.length === 0 ? <div className='flex flex-col items-center py-12 text-center'>
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <FileText className='w-8 h-8 text-slate-400'/>
        </div>
        <h3 className='text-lg font-medium text-slate-900 mb-2'>No containers found</h3>
        <p className="text-slate-500 mb-6 max-w-md">Your search or filter criteria did not match any of the containers. <br /> Try adjusting search.</p>
      </div> : <>
       <ContainerGrid 
        containers={containersToShow}
        entries={processedContainers?.length}
        visibleColumns={ALL_AVAILABLE_COLUMNS.filter(col => visibleColumns.includes(col.key))}
        onBookNow={handleOpenBookingModal}
      />
      {visibleCount < processedContainers?.length && (
        <ShowMoreButton onClick={handleShowMore} />
      )}
      {processedContainers?.length > 0 && (
        <div className="w-full sm:mt-8">
          <ExportControls onExport={handleExportData} />
        </div>
      )}
      </>)}
    </Container>
  );
};

export default DashboardPage;
