// src/components/dashboard/ContainerTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function ContainerTable({ containers, columns, sortConfig, requestSort }) {
  const navigate = useNavigate();

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕';
    if (sortConfig.direction === 'ascending') return '↑';
    return '↓';
  };

  const handleBookClick = (containerId) => {
    navigate(`/book/${containerId}`);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => requestSort(col.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                {col.header} {getSortIndicator(col.key)}
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {containers.map((container) => (
            <tr key={container.id} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {col.key === 'eta'?  (container.eta?.seconds ? new Date(container.eta.seconds * 1000).toLocaleDateString() : 'N/A')  : container[col.key] || 'N/A'}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleBookClick(container.id)}
                  className="text-indigo-600 hover:text-indigo-900"
                  disabled={container.sales_status !== 'Available for sale'}
                >
                  {container.sales_status === 'Available for sale' ? 'Book' : container.sales_status}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContainerTable;
