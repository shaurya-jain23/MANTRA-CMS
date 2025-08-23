import React, { useState, useEffect, useMemo } from 'react';
import containerService from '../firebase/container';
import {FilterPanel, ContainerGrid, SortDropdown} from '../components';

// --- CONFIGURATION FOR COLUMNS ---
const ALL_AVAILABLE_COLUMNS = [
  { key: 'company_name', header: 'Company' },
  { key: 'model', header: 'Model' },
  { key: 'container_no', header: 'Container No.' },
  { key: 'destination', header: 'Destination' },
  { key: 'status', header: 'Container Status' },
  { key: 'sales_status', header: 'Sales Status' },
  { key: 'eta', header: 'ETA' },
  { key: 'port', header: 'Port' },
  { key: 'colours', header: 'Colours' },
];

const getColorScore = (colorString = '', type) => {
  const brightColors = ['RED', 'BLUE', 'GREEN'];
  const darkColors = ['BLACK', 'GREY', 'WHITE'];
  let score = 0;
  colorString.replace(/\s/g, '').split(/[，, ;]/).forEach(part => {
    const [name, value] = part.trim().split('-');
    if (type === 'bright' && brightColors.includes(name.toUpperCase())) score+=parseInt(value, 10);
    if (type === 'dark' && darkColors.includes(name.toUpperCase())) score+=parseInt(value, 10);
  });
  return score;
};


const DashboardPage = () => {
  const [allContainers, setAllContainers] = useState([]); // Holds the master list of all containers from Firestore
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    model: [], company: [], status: [], sales_status: [], eta: 'all',
  });
  const [sortKey, setSortKey] = useState('eta_asc');
  const [visibleColumns, setVisibleColumns] = useState([
    'container_no',
    'model',
    'sales_status',
    'eta',
  ]); // Manages which columns are visible

  // --- DATA FETCHING ---
  useEffect(() => {
    // subscribes real-time container data from Firestore.
    const unsubscribe = containerService.getContainers({}, (data) => {
      setAllContainers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- MEMOIZED FILTERING & SORTING ---
  const processedContainers = useMemo(() => {
    const today2 = new Date();
    const today = new Date(today2.getTime() -30 * 24 * 60 * 60 * 1000); 
    const lowerBoundTime = today.getTime() - 20 * 24 * 60 * 60 * 1000;
    const upperBoundTime = today.getTime() + 20 * 24 * 60 * 60 * 1000;
    // 3. Default ETA Filter
    let processed = [...allContainers]
          .filter(c => {
            const timestamp = c.eta?.seconds ? c.eta.seconds : c.etd?.seconds;
            if (timestamp) {
              const itemDate = new Date(timestamp * 1000);
              return itemDate.getTime() >= lowerBoundTime && itemDate.getTime() <= upperBoundTime;
            }
            return false;
          });
        
    // 4. Apply Active Filters
    Object.keys(activeFilters).forEach(key => {
      const filterValue = activeFilters[key];
      if (Array.isArray(filterValue) && filterValue.length > 0) {
        processed = processed.filter(c => filterValue.includes(c[key]));
      } else if (key === 'eta' && filterValue !== 'all') {
        const days = parseInt(filterValue, 10);
        const etaUpperBound = today.getTime() + days * 24 * 60 * 60 * 1000;
        processed = processed.filter(c => {const timestamp = c.eta?.seconds ? c.eta.seconds : c.etd?.seconds;
            if (timestamp) {
              const itemDate = new Date(timestamp * 1000);
              return itemDate.getTime() >= today.getTime() && itemDate.getTime() <= etaUpperBound;
            }
            return false;});
      }
    });

    // 2. Apply Sorting
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
  }, [allContainers, activeFilters, sortKey]);
  // --- MEMOIZED FILTERING & SORTING ---
//  const filteredContainers = useMemo(() => {
//     let filtered = [...allContainers];
//     Object.keys(activeFilters).forEach(key => {
//       if (activeFilters[key].length > 0) {
//         filtered = filtered.filter(container => activeFilters[key].includes(container[key]));
//       }
//     });
//     // Default sort by ETA, can be made configurable later if needed
//     filtered.sort((a, b) => (a.eta || 0) - (b.eta || 0));
//     return filtered;
//   }, [allContainers, activeFilters]);

  // --- HANDLER FUNCTIONS ---
  const handleFilterApply = (filters) => setActiveFilters(filters);

  const resetFilters = () => {
    setActiveFilters({ model: [], company: [], status: [], sales_status: [], eta: 'all' });
  };

  const handleColumnChange = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Filters the full column configuration to get only the currently visible ones
  // const visibleColumnConfig = ALL_AVAILABLE_COLUMNS.filter((col) =>
  //   visibleColumns.includes(col.key)
  // );

  // --- RENDER LOGIC ---
  if (loading) {
    return <div className="p-8 text-center text-lg font-medium">Loading Dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Container Dashboard</h1>
        <SortDropdown sortKey={sortKey} setSortKey={setSortKey} />
      </div>
     <FilterPanel 
        allContainers={allContainers}
        activeFilters={activeFilters}
        onApplyFilters={handleFilterApply}
        onReset={resetFilters}
      />
      <ContainerGrid 
        containers={processedContainers}
        visibleColumns={ALL_AVAILABLE_COLUMNS.filter(col => visibleColumns.includes(col.key))}
      />
    </div>
  );
};

export default DashboardPage;
