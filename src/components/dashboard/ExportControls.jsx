import React, { useState } from 'react';
import {Button} from '../index'

function ExportControls({ onExport }) {
  const [fileType, setFileType] = useState('PDF');

  const handleExportClick = () => {
    onExport(fileType);
  };

  return (
    <div className="flex flex-col items-start xs:flex-row xs:items-center justify-end gap-4 p-4">
      <span className="text-sm font-medium text-gray-700">Export Data As:</span>
      <select 
        value={fileType} 
        onChange={(e) => setFileType(e.target.value)}
        className="p-2 border border-gray-300 rounded-md shadow-sm"
      >
        <option value="PDF">PDF File</option>
        {/* <option value="XLSX">Excel File</option> */}
      </select>
      <Button 
        onClick={handleExportClick}
        className="px-6 py-2 !w-fit text-sm font-medium"
      >
        OK
      </Button>
    </div>
  );
}

export default ExportControls;
