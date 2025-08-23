// src/components/dashboard/ContainerGrid.jsx
import React from 'react';
import ContainerCard from './ContainerCard';

function ContainerGrid({ containers, visibleColumns }) {
  if (!containers || containers.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No containers match the current filters.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-0">
      {containers.map((container) => (
        <ContainerCard 
          key={container.id} 
          container={container} 
          visibleColumns={visibleColumns.map(key => key.key)} // Pass down the keys for key details
        />
      ))}
    </div>
  );
}

export default ContainerGrid;
