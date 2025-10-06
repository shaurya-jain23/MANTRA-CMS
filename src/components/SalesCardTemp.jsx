import React from 'react';
import {ColorBar} from './index';
import { parseISO,format, isValid } from 'date-fns';

// This component is designed to be rendered off-screen for image capture.
const SalesCardTemp = React.forwardRef(({ container }, ref) => {
  const today = new Date().toLocaleDateString();
  let processed = (c) => {
    let dateObject;
    if(c.eta?.seconds){
      let isoString = new Date(c.eta.seconds * 1000).toISOString();
      dateObject= parseISO(isoString)
      if (!isValid(dateObject)) dateObject= 'N/A';
    }
    else{
        dateObject = c.eta;
      }
      return {...c, eta: dateObject}
  }
  const processedContainer = processed(container);
  const eta = processedContainer.eta ? format(processedContainer.eta, 'dd-MMM') : 'N/A';

  return (
    <div ref={ref} className="w-[600px] bg-white p-6 border-2 border-gray-800 font-sans">
      <div className="text-center flex flex-col items-center justify-center mb-4">
        <img className='h-10' src="/images/Mantra_logo.png" alt="logo" />
        <h2 className="text-2xl font-bold text-gray-900">MANTRA E-BIKES</h2>
        <p className="text-sm text-gray-500">Available Container Details</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-center"><span className="font-semibold">Model:</span><span>{container.model}</span></div>
        <div className="flex justify-between text-center"><span className="font-semibold">Specification:</span><span>{container.specifications}</span></div>
        <div className="flex justify-between text-center"><span className="font-semibold">Quantity:</span><span>{container.qty}</span></div>
        <div className="flex justify-between text-center"><span className="font-semibold">Colours:</span><span>{container.colours}</span></div>
        
        {container.status === 'At Sea' && eta && (
          <div className="flex justify-between"><span className="font-semibold">ETA:</span><span>{eta}</span></div>
        )}
        {eta && eta <= today && (
          <div className="flex justify-between"><span className="font-semibold">Status:</span><span>{container.status}</span></div>
        )}

        <div className="flex justify-between"><span className="font-semibold">Port:</span><span>{container.port}</span></div>
        <div className="flex justify-between"><span className="font-semibold">Battery:</span><span>{container.battery || 'N/A'}</span></div>
        <div className="flex justify-between"><span className="font-semibold">Charger:</span><span>{container.charger || 'N/A'}</span></div>
      </div>
      <div className="mt-6 text-center border-t pt-2">
        <p className="text-xs text-gray-500">Contact for more details | Prices are subject to change.</p>
      </div>
    </div>
  );
});

export default SalesCardTemp;
