import React from 'react';
import {Tooltip} from '../index';

const InvoiceSummary = ({ subtotal, taxAmount, freightCharges, grandTotal, freightIncluded }) => {
  return (
    <div className="space-y-4 bg-slate-50 p-6 rounded-lg">
      <div className="flex justify-between text-sm">
        <Tooltip text="Total amount before taxes and additional charges">
          <span className="text-slate-600">Subtotal (Without GST)</span>
        </Tooltip>
        <span className="font-medium text-slate-900">₹{subtotal.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <Tooltip text="Total tax amount including Central GST and State GST">
          <span className="text-slate-600">Tax Amount (Inc. GST)</span>
        </Tooltip>
        <span className="font-medium text-slate-900">₹{taxAmount.toFixed(2)}</span>
      </div>
      
      {freightIncluded === "false" && (
        <div className="flex justify-between text-sm">
          <Tooltip text="Shipping and handling costs for the order">
            <span className="text-slate-600">Freight Charges</span>
          </Tooltip>
          <span className="font-medium text-slate-900">₹{freightCharges.toFixed(2)}</span>
        </div>
      )}
      
      <div className="border-t border-slate-200 dark:border-border-dark my-2"></div>
      
      <div className="flex justify-between text-lg font-bold">
        <span className="text-slate-900">Total Amount</span>
        <span className="text-blue-600">₹{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default InvoiceSummary;