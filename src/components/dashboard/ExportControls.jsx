import React, { useState } from 'react';

function ExportControls({ onExport }) {
  const [fileType, setFileType] = useState('PDF');

  const handleExportClick = () => {
    onExport(fileType);
  };

  return (
    <div className="flex items-center justify-end gap-4 p-4 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Export Data As:</span>
      <select 
        value={fileType} 
        onChange={(e) => setFileType(e.target.value)}
        className="p-2 border border-gray-300 rounded-md shadow-sm"
      >
        <option value="PDF">PDF File</option>
        {/* <option value="XLSX">Excel File</option> */}
      </select>
      <button 
        onClick={handleExportClick}
        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        OK
      </button>
    </div>
  );
}

export default ExportControls;
