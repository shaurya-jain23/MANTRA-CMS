import React from 'react';
import ContainerCard from './ContainerCard';

function ContainerGrid({ containers, visibleColumns, entries }) {
  if (!containers || containers.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No containers match the current filters.</p>
  }

  return (
    <div>
      <div className='text-lg mb-1'>
        <p>No. of Entries: <b>{entries}</b></p>
      </div>
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-1">
        {containers.map((container) => (
          <ContainerCard 
            key={container.id} 
            container={container} 
            visibleColumns={visibleColumns.map(key => key.key)} // Pass down the keys for key details
          />
        ))}
      </div>
    </div>
  );
}

export default ContainerGrid;
