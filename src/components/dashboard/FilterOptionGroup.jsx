import React, {useEffect, useState} from 'react';


const FilterOption = ({ label, value, type, isSelected, onSelect }) => {
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    isSelected.includes(value)? setChecked(true) : setChecked(false);
  }, [isSelected])
  
  return (
    <label
      htmlFor={value}
      className="flex items-center space-x-2 my-2 cursor-pointer"
    >
      <div className="relative flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 flex-shrink-0">
        <input
          type={type === 'radio' ? 'radio' : 'checkbox'}
          id={value}
          name={type === 'radio' ? 'radio-group' : value}
          checked={checked}
          onChange={() => onSelect(value)}
          // Visually hide the default input but keep it accessible
          className="absolute opacity-0 w-full h-full cursor-pointer"
        />
        {checked && (
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
        )}
      </div>
      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>
    </label>
  );
};



function FilterOptionGroup({ activePanel, currentOptions, selectedOptions, onChange }) {
  const handleCheckboxChange = (option) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    onChange(newSelection);
  };
  return (
    <>
       <div className="w-1/2 ">
        {currentOptions && (
          <div className='p-6 grid grid-cols-2'>
            {/* <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-sm">Show only</h4>
              <button className="text-blue-500 text-xs font-semibold">CLEAR</button>
            </div> */}
            {currentOptions.options.map(option => (
              <FilterOption
                key={option?.value}
                label={option?.label}
                value={option?.value}
                type={currentOptions.type}
                isSelected={selectedOptions || []}
                onSelect={(value) => handleCheckboxChange(value)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default FilterOptionGroup;
