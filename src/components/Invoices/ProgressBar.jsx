import React from 'react';

const ProgressBar = ({ currentSection, completedSections, onSectionClick }) => {
  const sections = [
    { id: 'invoice', label: 'Invoice Details' },
    { id: 'shipping', label: 'Billing & Shipping' },
    { id: 'items', label: 'Item Details' },
    { id: 'summary', label: 'Summary & Terms' }
  ];

  const currentIndex = sections.findIndex(section => section.id === currentSection);

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center w-full max-w-4xl">
            {sections.map((section, index) => (
              <React.Fragment key={section.id}>
                {/* Section Circle */}
                <div className="flex flex-col items-center z-10 bg-white">
                  <button
                    type="button"
                    onClick={() => onSectionClick(section.id)}
                    className={`flex md:flex-row flex-col gap-2 justify-center items-center transition-all duration-200 ${
                      currentIndex >= index ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      completedSections[section.id] 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : currentIndex >= index 
                        ? 'border-blue-600 bg-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {completedSections[section.id] ? (
                        <span className="text-sm font-bold">✓</span>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className="md:text-sm text-xs md:mt-0 mt-2 font-medium text-center md:max-w-fit max-w-20 leading-tight">
                      {section.label}
                    </span>
                  </button>
                </div>
                
                {/* Connecting Line */}
                {index < sections.length - 1 && (
                  <div className="flex-1 mx-2 relative">
                    <div className={`h-0.5 w-full transition-all duration-500 ${
                      currentIndex > index ? 'bg-blue-600' : 'bg-slate-200'
                    }`} />
                    <div className={`absolute inset-0 h-0.5 w-0 transition-all duration-500 ${
                      currentIndex > index ? 'w-full bg-blue-600' : 'bg-transparent'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;