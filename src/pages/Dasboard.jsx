import React, { useState, useEffect, useMemo } from 'react';
import containerService from '../firebase/container';
import FilterPanel from '../components/dashboard/FilterPanel';
import ContainerTable from '../components/dashboard/ContainerTable';

// --- CONFIGURATION FOR COLUMNS ---
const ALL_AVAILABLE_COLUMNS = [
  { key: 'company_name', header: 'Company' },
  { key: 'model', header: 'Model' },
  { key: 'specifications', header: 'Specifications' },
  { key: 'container_no', header: 'Container No.' },
  { key: 'destination', header: 'Destination' },
  { key: 'status', header: 'Container Status' },
  { key: 'sales_status', header: 'Sales Status' },
    { key: 'eta', header: 'ETA' },
  { key: 'port', header: 'Port' },
];

const DashboardPage = () => {
  const [allContainers, setAllContainers] = useState([]); // Holds the master list of all containers from Firestore
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({ model: [], sales_status: [], status: [] }); // Holds the currently applied filters
  const [sortConfig, setSortConfig] = useState({ key: 'eta', direction: 'ascending' }); // Manages table sorting
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
  const filteredAndSortedContainers = useMemo(() => {
    let filtered = [...allContainers];
    // multi-select filters but time complexity is O(n*m) where n is number of containers and m is number of filters
    Object.keys(activeFilters).forEach((key) => {
      if (activeFilters[key].length > 0) {
        filtered = filtered.filter((container) => activeFilters[key].includes(container[key]));
      }
    });
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key] || ''; // Fallback for null/undefined values
        const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [allContainers, activeFilters, sortConfig]);

  // --- HANDLER FUNCTIONS ---
  const handleFilterApply = (filters) => setActiveFilters(filters);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleColumnChange = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Filters the full column configuration to get only the currently visible ones
  const visibleColumnConfig = ALL_AVAILABLE_COLUMNS.filter((col) =>
    visibleColumns.includes(col.key)
  );

  // --- RENDER LOGIC ---
  if (loading) {
    return <div className="p-8 text-center text-lg font-medium">Loading Dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Container Dashboard</h1>

      <FilterPanel
        allContainers={allContainers}
        onFilterApply={handleFilterApply}
        availableColumns={ALL_AVAILABLE_COLUMNS}
        visibleColumns={visibleColumns}
        onColumnChange={handleColumnChange}
      />

      <ContainerTable
        containers={filteredAndSortedContainers}
        columns={visibleColumnConfig}
        sortConfig={sortConfig}
        requestSort={requestSort}
      />
    </div>
  );
};

export default DashboardPage;
