import React, { useState } from 'react';
import {Button, Select} from '../index'

function ExportControls({ onExport }) {
  const [fileType, setFileType] = useState('PDF');

  const handleExportClick = () => {
    onExport(fileType);
  };

  return (
    <div className="flex flex-col items-start xs:flex-row xs:items-center justify-end gap-4 p-4">
      <span className="text-sm font-medium text-gray-700">Export Data As:</span>
      <Select 
        value={fileType} 
        onChange={(e) => setFileType(e.target.value)}
        className="text-sm !w-fit !py-1"
        options={[{name: 'PDF File', value: 'PDF'}]}
      />
      <Button 
        variant='secondary'
        onClick={handleExportClick}
        className=""
      >
        OK
      </Button>
    </div>
  );
}

export default ExportControls;
