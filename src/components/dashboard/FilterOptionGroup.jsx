import {CheckBox as FilterOption} from '../index'

function FilterOptionGroup({ activePanel, currentOptions, selectedOptions, onChange }) {
  const handleCheckboxChange = (option) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    onChange(newSelection);
  };
  return (
    <>
       <div className="w-full md:w-1/2">
        {currentOptions && (
          <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2'>
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
