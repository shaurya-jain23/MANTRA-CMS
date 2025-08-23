import React, { useState, useEffect } from 'react';
import CheckboxGroup from './CheckboxGroup';

function FilterPanel({ allContainers, onFilterApply, activeFilters}) {
  const [localFilters, setLocalFilters] = useState(activeFilters);

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // --- DYNAMIC FILTER OPTIONS ---
  const options = React.useMemo(() => ({
    model: [...new Set(allContainers.map(c => c.model).filter(Boolean))],
    company: [...new Set(allContainers.map(c => c.company_name).filter(Boolean))],
    status: [...new Set(allContainers.map(c => c.status).filter(Boolean))],
    sales_status: [...new Set(allContainers.map(c => c.sales_status).filter(Boolean))],
  }), [allContainers]);


  const handleLocalChange = (filterName, value) => {
    setLocalFilters(prev => ({ ...prev, [filterName]: value }));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Checkbox Filters now update local state */}
        <CheckboxGroup title="Model" options={options.model} selectedOptions={localFilters.model} onChange={(s) => handleLocalChange('model', s)} />
        <CheckboxGroup title="Company" options={options.company} selectedOptions={localFilters.company} onChange={(s) => handleLocalChange('company', s)} />
        <CheckboxGroup title="Container Status" options={options.status} selectedOptions={localFilters.status} onChange={(s) => handleLocalChange('status', s)} />
        <CheckboxGroup title="Sales Status" options={options.sales_status} selectedOptions={localFilters.sales_status} onChange={(s) => handleLocalChange('sales_status', s)} />
        
        {/* Dropdown Filters now update local state */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">ETA</h4>
          <select name="eta" value={localFilters.eta} onChange={(e) => handleLocalChange('eta', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            <option value="all">All</option>
            <option value="5">Next 5 days</option>
            <option value="10">Next 10 days</option>
            <option value="15">Next 15 days</option>
            <option value="20">Next 20 days</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button onClick={()=> onFilterApply({ model: [], company: [], status: [], sales_status: [], eta: 'all' })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Reset</button>
        {/* The Apply button now sends the local state to the parent */}
        <button onClick={() => onFilterApply(localFilters)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Apply Filters</button>
      </div>
    </div>
  );
}

export default FilterPanel;