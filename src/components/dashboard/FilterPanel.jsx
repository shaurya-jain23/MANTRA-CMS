// src/components/dashboard/FilterPanel.jsx
import React, { useState, useMemo } from 'react';
import CheckboxGroup from './CheckboxGroup';

function FilterPanel({ allContainers, onFilterApply, availableColumns, visibleColumns, onColumnChange }) {
  // --- DYNAMIC FILTER OPTIONS ---
  const filterOptions = useMemo(() => {
    const models = [...new Set(allContainers.map(c => c.model).filter(Boolean))];
    const salesStatus = [...new Set(allContainers.map(c => c.sales_status).filter(Boolean))];
    const containerStatus = [...new Set(allContainers.map(c => c.status).filter(Boolean))];
    return { models, salesStatus, containerStatus };
  }, [allContainers]);

  // --- LOCAL STATE FOR SELECTIONS ---
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedSalesStatus, setSelectedSalesStatus] = useState([]);
  const [selectedContainerStatus, setSelectedContainerStatus] = useState([]);

  // --- HANDLERS ---
  const handleApply = () => {
    onFilterApply({
      model: selectedModels,
      sales_status: selectedSalesStatus,
      status: selectedContainerStatus,
    });
  };

  const handleReset = () => {
    setSelectedModels([]);
    setSelectedSalesStatus([]);
    setSelectedContainerStatus([]);
    onFilterApply({ model: [], sales_status: [], status: [] });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Filters & View Options</h2>
      
      {/* FILTER SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CheckboxGroup 
          title="Model"
          options={filterOptions.models}
          selectedOptions={selectedModels}
          onChange={setSelectedModels}
        />
        <CheckboxGroup 
          title="Sales Status"
          options={filterOptions.salesStatus}
          selectedOptions={selectedSalesStatus}
          onChange={setSelectedSalesStatus}
        />
        <CheckboxGroup 
          title="Container Status"
          options={filterOptions.containerStatus}
          selectedOptions={selectedContainerStatus}
          onChange={setSelectedContainerStatus}
        />
      </div>

      {/* COLUMN VISIBILITY */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Visible Columns</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {availableColumns.map(col => (
            <label key={col.key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={visibleColumns.includes(col.key)}
                onChange={() => onColumnChange(col.key)}
              />
              <span className="text-sm text-gray-600">{col.header}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t">
        <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
          Reset
        </button>
        <button onClick={handleApply} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Apply Filters
        </button>
      </div>
    </div>
  );
}

export default FilterPanel;
