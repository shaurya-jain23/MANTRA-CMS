import { Anchor, Package } from 'lucide-react';
import React, {useMemo} from 'react'

function SalesStats({containers}) {

    const portModelCounts = useMemo(() => {
    const availableSalesStatus = ['Available for sale', 'Booked for Adampur', 'Booked for Noida'];
    const containerStatus= ['On the way', 'Reached Destination']
    const processed = [...containers].filter(c => availableSalesStatus.includes(c.sales_status));
    let availableContainers = [...processed].filter(c => !containerStatus.includes(c.status));
    // const uniqueModels = [...new Set(processed.map(c => c.model?.trim().toUpperCase()).filter(Boolean))]
    const uniquePorts = [...new Set(availableContainers.map(c => c.port?.trim().toUpperCase()).filter(Boolean))]
    const counts = availableContainers.reduce((acc, container) => {
      const model = container.model?.trim().toUpperCase() || 'UNKNOWN';
      const port = container.port?.trim().toUpperCase() || 'NO_PORT';
      // Initialize the entry for a model if it's the first time we've seen it.
      if (!acc[port]) {
        acc[port] = {};
      }
      // Increment the count for the model within that port.
      acc[port][model] = (acc[port][model] || 0) + 1;
      
      return acc;
    }, {});
    const sortedCounts = Object.entries(counts)
        .map(([portName, models]) => ({
            portName,
            models: Object.entries(models)
            .map(([modelName, count]) => ({ modelName, count }))
            .sort((a, b) => b.count - a.count), // Sort models by count within each port
        }))
        .sort((a, b) => a.portName.localeCompare(b.portName))

    return sortedCounts;
  }, [containers]);

  if (portModelCounts.length === 0) {
    return null; // Don't render the component if there's no data to show
  }

  return (
   <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Map over each Port */}
        {portModelCounts.map(({ portName, models }) => (
          <div key={portName} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center mb-4">
              <Anchor className="h-5 w-5 text-indigo-600 mr-3" />
              <h4 className="font-bold text-lg text-gray-900">{portName}</h4>
            </div>
            
            {/* List of Models for that Port */}
            <div className="space-y-3">
              {models.map(({ modelName, count }) => (
                <div key={modelName} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <Package size={16} className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">{modelName}</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SalesStats