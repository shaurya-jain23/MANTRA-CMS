import React, { useState, useEffect, useMemo, useRef } from 'react';
import containerService from '../firebase/container';
import {FilterPanel, ContainerGrid, VisibleColumns, DropDown, SearchBar, ShowMoreButton, ExportControls} from '../components';
import {sortOptions, etaOptions, ALL_AVAILABLE_COLUMNS, monthOptions} from '../assets/utils'
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [allContainers, setAllContainers] = useState([]); // Holds the master list of all containers from Firestore
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [sortKey, setSortKey] = useState('eta_asc');
  const [etaKey, setEtaKey] = useState('20')
  const [monthKey, setMonthKey] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState([
    'model',
    'status',
    'eta',
    'port',
    'colours'
  ]); // Manages which columns are visible

  const dropdownRef = useRef();
  // --- DATA FETCHING ---
  useEffect(() => {
    const unsubscribe = containerService.getContainers({}, (data) => {
      setAllContainers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- MEMOIZED FILTERING & SORTING ---
  const processedContainers = useMemo(() => {
    const today = new Date();
    // const today = new Date(today2.getTime() -30 * 24 * 60 * 60 * 1000); 
    const lowerBoundTime = today.getTime() - 20 * 24 * 60 * 60 * 1000;
    const upperBoundTime = today.getTime() + 20 * 24 * 60 * 60 * 1000;

    //Default filter
    let processed = [...allContainers]
                            .filter(c => {
                              const timestamp = c.eta?.seconds ? c.eta.seconds : c.etd?.seconds;
                              if (timestamp) {
                                const itemDate = new Date(timestamp * 1000);
                                return itemDate.getTime() >= lowerBoundTime && itemDate.getTime() <= upperBoundTime;
                              }
                              return false;
                            });

    // eta wise filter
    if (etaKey !== '20') {
      const selectedDays = parseInt(etaKey, 10);
        if(etaKey === 'all'){
          processed = [...allContainers];
        } else{
          const etaUpperBound = today.getTime() + selectedDays * 24 * 60 * 60 * 1000;
          const etalowerBound = today.getTime() - 10 * 24 * 60 * 60 * 1000;
          processed = processed.filter(c => {
            const timestamp = c.eta?.seconds ? c.eta.seconds : c.etd?.seconds;
            if (timestamp) {
              const itemDate = new Date(timestamp * 1000);
              return itemDate.getTime() >= etalowerBound && itemDate.getTime() <= etaUpperBound;
            }
            return false;});
        }
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
      processed = [...allContainers].filter(c => 
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
      if (key === 'eta') return direction === 'asc' ? (a.eta || 0) - (b.eta || 0) : (b.eta || 0) - (a.eta || 0);
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
      const doc = new jsPDF();
      
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

  // --- RENDER LOGIC ---
  if (loading) {
    return <div className="p-8 text-center text-lg font-medium">Loading Dashboard...</div>;
  }
  const containersToShow = processedContainers.slice(0, visibleCount);
  return (
    <div className="w-full flex flex-col justify-center items-center p-10 sm:px-20 lg:px-30 space-y-6">
      <div className="w-full flex flex-col justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Container Dashboard</h1>
        <div className="mt-6 md:w-auto flex flex-col sm:items-center gap-6">
            <SearchBar
            query={searchQuery}
            setQuery={setSearchQuery}
            resultCount={processedContainers.length} />
          <div className="flex gap-5 items-center flex-wrap sm:justify-center">
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
      <ContainerGrid 
        containers={containersToShow}
        entries={processedContainers.length}
        visibleColumns={ALL_AVAILABLE_COLUMNS.filter(col => visibleColumns.includes(col.key))}
      />
      {visibleCount < processedContainers.length && (
        <ShowMoreButton onClick={handleShowMore} />
      )}
      {processedContainers.length > 0 && (
        <div className="w-full mt-8">
          <ExportControls onExport={handleExportData} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
