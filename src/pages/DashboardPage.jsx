import React, { useState, useEffect, useMemo, useRef } from 'react';
import { selectAllContainers ,selectContainerStatus, fetchContainers } from '../features/containers/containersSlice';
import { useSelector, useDispatch } from 'react-redux';
import {FilterPanel, ContainerGrid, VisibleColumns, DropDown, SearchBar, ShowMoreButton, ExportControls, BookingForm, Loading} from '../components';
import {sortOptions, etaOptions, ALL_AVAILABLE_COLUMNS, monthOptions} from '../assets/utils'
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import bookingService from '../firebase/bookings';
import dealerService from '../firebase/dealers';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from "firebase/firestore";

const getColorScore = (colorString = '', type) => {
  const brightColors = ['RED', 'BLUE', 'GREEN'];
  const darkColors = ['BLACK', 'GREY', 'WHITE'];
  let score = 0;
  const colors = colorString.replace(/\s/g, '').split(/[，, ;]/).map(part => {
    const [name, value] = part.trim().split('-');
    return {
      name: name.trim().toUpperCase(),
      value: parseInt(value, 10),
    };
  }).filter(color => !isNaN(color.value) && color.value > 0);

  const total = colors.reduce((sum, color) => sum + color.value, 0);
  colors.forEach(({name, value}) =>{
    if(type === 'bright' && total > 0 && brightColors.includes(name)){
      score += parseInt((value / total) * 100, 10);
    }
    if(type === 'dark' && total > 0 && darkColors.includes(name)){
      score += parseInt((value / total) * 100);
    }
  })
  console.log(colorString, score);
  return score;
};


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
  const [visibleColumns, setVisibleColumns] = useState([
    'model',
    'destination',
    'party_name',
    'eta',
    'port',
    'colours'
  ]); // Manages which columns are visible

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);

  const dropdownRef = useRef();

  
  useEffect(() => {
      if (containerStatus === 'idle') {
        dispatch(fetchContainers());
      }
      if(containerStatus === 'succeeded'){
        setAllContainers(containerData);
        setLoading(false);
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
      if (Array.isArray(filterValue) && filterValue.length > 0) {
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
      return processedContainers.length; 
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

      doc.save(`ContainerReport_${new Date().toLocaleDateString()}.pdf`);
    }
    // Add logic for XLSX later if needed
  };

  const handleOpenBookingModal = (container) => {
    setSelectedContainer(container);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setSelectedContainer(null);
    setIsBookingModalOpen(false);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
        await bookingService.createBooking(bookingData);
        const dealer = await dealerService.getDealerById(bookingData.dealerId); 
        await bookingService.updateContainerStatus(bookingData.containerId, `Pending Apporval`, dealer.trade_name);
        handleCloseBookingModal();
        navigate('/bookings');
    } catch (error) {
        alert(error.message);
    }
  };

  // --- RENDER LOGIC ---
  if (loading) {
    return <Loading isOpen={true} message="Loading Dashboard..." />
  }
  const containersToShow = processedContainers.slice(0, visibleCount);
  return (
    <div className="w-full flex flex-col justify-center items-center px-5 py-10 sm:px-10 md:px-20 lg:px-30 space-y-6">
      <div className="w-full flex flex-col justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Container Dashboard</h1>
        <div className="mt-6 md:w-auto flex flex-col sm:items-center gap-4 sm:gap-6">
            <SearchBar
            query={searchQuery}
            setQuery={setSearchQuery}
            resultCount={processedContainers.length} />
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
      <BookingForm
        container={selectedContainer}
        onSubmit={handleBookingSubmit}
        onCancel={handleCloseBookingModal}
        isOpen= {isBookingModalOpen}
      />
      <ContainerGrid 
        containers={containersToShow}
        entries={processedContainers.length}
        visibleColumns={ALL_AVAILABLE_COLUMNS.filter(col => visibleColumns.includes(col.key))}
        onBookNow={handleOpenBookingModal}
      />
      {visibleCount < processedContainers.length && (
        <ShowMoreButton onClick={handleShowMore} />
      )}
      {processedContainers.length > 0 && (
        <div className="w-full sm:mt-8">
          <ExportControls onExport={handleExportData} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
