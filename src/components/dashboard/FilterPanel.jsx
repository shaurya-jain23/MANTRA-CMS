import React, { useState, useEffect } from 'react';
import CheckboxGroup from './FilterOptionGroup';
import { X } from "lucide-react";

const FilterSection = ({ title, icon, isSelected, onClick }) => {
  const baseClasses = "flex items-center space-x-3 p-3 rounded-lg cursor-pointer";
  const selectedClasses = "bg-blue-100 text-blue-600 font-semibold";
  const unselectedClasses = "text-gray-600 hover:bg-gray-100";

  return (
    <div
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
      onClick={onClick}
    >
      <span className="text-xl">{icon}</span> {/* Replace with actual icons */}
      <span className="text-base">{title}</span>
    </div>
  );
};

const SelectedFilters = ({ filters, onRemove }) => {
  
  const totalFilterCount = Object.values(filters).reduce((count, values) => {
    return count + (Array.isArray(values) ? values.length : 0);
  }, 0);
  return (
    <div className="p-4 md:border-l border-t border-gray-200 md:w-1/4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-sm">{totalFilterCount} filters selected</h4>
      </div>
      <div className="space-y-4">
        {Object.entries(filters).map(([key, values]) => (
          <div key={key}>
            <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">{key}</h5>
            {Array.isArray(values) && values.map(value => (
              <div key={value} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg text-sm mb-1">
                <span>{value.replace(/_/g, ' ').toUpperCase()}</span>
                <button
                  onClick={() => onRemove(key, value)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

function FilterPanel({ allContainers, onFilterApply, activeFilters}) {
  const [activePanel, setActivePanel] = useState('model');
  const [localFilters, setLocalFilters] = useState(activeFilters);

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);


  // --- DYNAMIC FILTER OPTIONS ---
  const options = React.useMemo(() => ({
    model: [...new Set(allContainers.map(c => c.model?.trim().toUpperCase()).filter(Boolean))],
    company_name: [...new Set(allContainers.map(c => c.company_name?.trim().toUpperCase()).filter(Boolean))],
    status: [...new Set(allContainers.map(c => c.status?.trim().toUpperCase()).filter(Boolean))],
    sales_status: [...new Set(allContainers.map(c => c.sales_status?.trim().toUpperCase()).filter(Boolean))],
  }), [allContainers]);

    const handleLocalChange = (filterName, value) => {
      setLocalFilters(prev => ({ ...prev, [filterName]: value }));
    };

  // Define the main filters based on the keys of the filterData prop
  const mainFilters = Object.keys(options).map(key => ({
    name: key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    key: key,
    propKey: key
  }));
  const handleRemoveFilter = (key, value) => {
    setLocalFilters(prevFilters => {
      const updatedValues = prevFilters[key].filter(v => v !== value);
      if (updatedValues.length === 0) {
        const { [key]: _, ...rest } = prevFilters;
        return rest;
      }
      return { ...prevFilters, [key]: updatedValues };
    });
  };


   const getFilterOptions = (panelKey) => {
    return { type: 'checkbox',
             options: options[panelKey].map(item => ({ label: item, value: item.trim().replace(/\s+/g, '_').toLowerCase() })) };
    };

  const currentOptions = getFilterOptions(activePanel);

  const handleReset = () => {
    setLocalFilters({});
    onFilterApply({})
  };


  return (
    <div className='flex w-full flex-col my-2 md:my-10 rounded-lg shadow-xl bg-white'>
      <div className="flex flex-col flex-wrap md:flex-row">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/4 p-4 space-y-2 border-b md:border-r border-gray-200">
          <h3 className="font-bold text-lg mb-4">Filters</h3>
          {mainFilters.map(filter => (
            <FilterSection
              key={filter.key}
              title={filter.name}
              icon={filter.icon}
              isSelected={activePanel === filter.key}
              onClick={() => setActivePanel(filter.key)}
            />
          ))}
        </div>
        {/* Middle Content Panel */}
        <CheckboxGroup 
          activePanel={activePanel}
          currentOptions={currentOptions}
          selectedOptions={localFilters[activePanel] || []}
          onChange={(s) => handleLocalChange(activePanel, s)} />
        {/* Right Sidebar */}
        <SelectedFilters
          filters={localFilters}
          onRemove={handleRemoveFilter}
        />
        
      </div>
      {/* Footer Buttons */}
      <div className="flex justify-between p-4 border-t border-gray-200">
        <button onClick={handleReset} className="text-blue-600 font-semibold text-sm cursor-pointer duration-150 hover:text-blue-400">
          RESET FILTER
        </button>
        <div className="space-x-4">
          <button onClick={() => onFilterApply(localFilters)} className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700 duration-150 font-semibold text-sm px-6 py-2 rounded-full">
            APPLY
          </button>
        </div>
      </div>
    </div>
     
  );
}

export default FilterPanel;