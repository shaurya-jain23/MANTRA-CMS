import React from 'react';
import { ToWords } from 'to-words';
import { bankDetailsConfig, termsAndConditions } from '../../assets/utils';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

const toWords = new ToWords({
  localeCode: 'en-IN', // For Indian numbering system
  converterOptions: {
    currency: true, // Converts to currency format (Rupees and Paise)
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
  },
});

const generateFullDescription = (item, type) => {
    const descriptionModel = (item.description?.model)?.replace(/_/g, ' ')?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const descriptionBattery = (item.description?.battery)?.replace(/_/g, ' ')?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const descriptionCharger = (item.description?.charger)?.replace(/_/g, ' ')?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    if (['BATTERY', 'CHARGER'].includes((item.model || '').toUpperCase())) {
        return descriptionModel;
    }

    const parts = [descriptionModel];
    if (item.with_battery) parts.push(`With ${descriptionBattery} Battery`); else parts.push('Without Battery');
    if (item.with_charger) parts.push(`With ${descriptionCharger} Charger`); else parts.push('Without Charger');

    if (type === 'container') {
        if (item.with_tyre) parts.push('With Tyre'); else parts.push('Without Tyre');
        if (item.with_assembling) parts.push('With Assembling'); else parts.push('In CKD');
    }
    
    return parts.join(', ');
};

function InvoiceDetail({ piData }, ref) {
  if (!piData) {
    return <div className="p-8 text-center text-gray-500">No invoice data to display.</div>;
  }

  const {
    pi_number,
    pi_date,
    placeOfDelivery=null,
    generated_by_name,
    billing,
    shipping,
    delivery_terms,
    items = [],
    transport = {},
    billing_remarks,
    totals = {},
    type= 'normal',
    warranty_terms, 
    pi_location='hisar'
  } = piData;

  const isShippingSame = shipping === 'same_as_billing';
  const shippingInfo = isShippingSame ? billing : shipping;
  const bankInfo = (pi_location === 'noida' && type === 'normal') ? bankDetailsConfig.noida : bankDetailsConfig.hisar;

  return (
    <div className="bg-white border-2 border-gray-500 text-xs sm:text-sm md:text-base" ref={ref}>
      {/* --- Header --- */}
      <div className="flex justify-start gap-5 items-start border-b-2 border-gray-500 flex-col sm:flex-row">
        <div className="bg-slate-100 w-full sm:w-fit h-full px-8 py-4 sm:py-8 flex justify-center">
          <img className='h-29' src="/images/Mantra_logo2.png" alt="logo" />
        </div>
        <div className='p-2 mb-4 sm:mb-0'>
          <h1 className="text-2xl font-semibold text-slate-900">MANTRA E-BIKES</h1>
          <p className="text-gray-600 max-w-sm">MANTRA E-BIKES</p>
          <p className="text-gray-600 max-w-sm">Kharampur Road, Opposite to Shagun Marriage Place, Mandi Adampur, Hisar, Haryana, 125052</p>
          <p className="text-gray-600 max-w-sm">Hisar, Haryana, 125052</p>
          <p className="text-gray-600 max-w-sm">GSTIN: 06ABJFM7393Q1ZA</p>
        </div>
      </div>
      <div className="border-b-2 border-gray-500 py-0.5 px-2 text-center flex justify-center items-center">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">PROFORMA INVOICE</h2>
      </div>
    
      {/* --- Invoice Details --- */}
      <div className="border-b-2 border-gray-500 grid grid-cols-1 sm:grid-cols-2 text-left justify-between items-center">
        <div className="py-0.5 px-2 sm:sm:border-r-2 border-gray-500">
          <p className="text-md"><strong>PI #:</strong> {pi_number}</p>
          <p className="text-md"><strong>PI Date:</strong> {pi_date ? pi_date : 'N/A'}</p>
        </div>
        <div className="py-0.5 px-2 ">
          <p className="text-md"><strong>Place of Supply:</strong> {placeOfDelivery || shippingInfo.state}</p>
          <p className="text-md"><strong>Sales Person:</strong> {generated_by_name}</p>
        </div>
      </div>

      {/* --- Billing and Shipping Details --- */}
      <div className="border-b-2 border-gray-500 grid grid-cols-1 sm:grid-cols-2 text-md text-left justify-between items-center">
        <div className="sm:border-r-2 py-0.5 px-2 border-gray-500 bg-slate-100">
            <h3 className="font-semibold text-slate-800 uppercase">Bill To:</h3>
        </div>
        <div className="bg-slate-100 py-0.5 px-2">
            <h3 className="font-semibold text-slate-800 uppercase">Ship To:</h3>
        </div>
      </div>
      
      <div className="border-b-2 border-gray-500 grid grid-cols-1 sm:grid-cols-2 text-left justify-between items-start">
        <div className="text-md py-0.5 px-2 sm:border-r-2 border-gray-500">
          <h4 className="font-semibold text-slate-900">{billing?.firm}</h4>
          <p className="text-gray-600">{billing?.address}</p>
          <p className="text-gray-600">{billing?.district}, {billing?.state}</p>
          <p className="mt-1"><span className='font-medium'>GSTIN:</span> {billing?.gst_no}</p>
        </div>
        <div className="text-md py-0.5 px-2">
          <p className="text-gray-800">{shippingInfo?.firm}</p>
          <p className="text-gray-600">{shippingInfo?.address}</p>
          <p className="text-gray-600">{shippingInfo?.district}, {shippingInfo?.state}</p>
        </div>
      </div>

      {/* --- Items Table --- */}
      <div className="overflow-x-auto">
        <table className="w-full h-full table-fixed border-collapse text-sm lg:text-md">
          <thead className="bg-gray-100 w-full">
            <tr className="text-center border-b-2 border-gray-300 text-sm lg:text-md md:text-xs font-bold text-gray-600 uppercase w-full">
              <th className="p-2 border-r-2 border-gray-300 w-1/24">#</th>
              <th className="p-2 text-left border-r-2 border-gray-300 w-6/12">Product Name & Description</th>
              <th className="p-2 border-r-2 border-gray-300 w-1/12">Qty</th>
              <th className="p-2 border-r-2 border-gray-300 w-3/24">Unit Price (With GST)</th>
              <th className="p-2 border-r-2 border-gray-300 w-3/24">Unit Price (Without GST)</th>
              <th className="p-2 border-r-2 border-gray-300 w-1/12">GST %</th>
              <th className="p-2 w-2/12">Amount</th>
            </tr>
          </thead>
          <tbody className='h-80'>
            {items.map((item, index) => {
              const amount = (item.qty || 0) * ((item.unit_price)*(100/105) || 0);
              const model = (item.model).replace(/_/g, ' ').toUpperCase();
              const fullDescription = generateFullDescription(item, type);
              return (
                <tr key={index} className="border-b-2 border-gray-300 align-top">
                  <td className="p-2 border-r-2 border-gray-300 text-center">{index + 1}</td>
                  <td className="p-2 border-r-2 border-gray-300">
                    <p className="font-semibold">{model} {item.with_accessories ? '(With Accessories)' : null}</p>
                    <p className="text-sm text-gray-500">{fullDescription}</p>
                  </td>
                  <td className="p-2 border-r-2 border-gray-300 text-center">{item.qty}</td>
                  <td className="p-2 border-r-2 border-gray-300 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="p-2 border-r-2 border-gray-300 text-right">{formatCurrency(item.unit_price*(100/105))}</td>
                  <td className="p-2 border-r-2 border-gray-300 text-right">5 %</td>
                  <td className="p-2 text-right font-medium">{formatCurrency(amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-y-2 w-full bg-slate-100 border-gray-500 grid grid-cols-3 text-left justify-between items-center">
        <div className="py-0.5 px-2 border-r-2 h-full border-gray-500 flex items-center col-span-2">
          <p className="text-md flex gap-2"><strong> Freight:</strong> <span>{(transport.included === 'true' || transport.included === true ) ? 'Included' : 'Extra'}</span></p>
        </div>
        <div className="py-0.5 px-2 flex items-center col-span-1">
          <p className="text-md flex flex-grow justify-between"><span className='font-semibold'>Sub Total:</span> <span>{formatCurrency(totals.subTotal)}</span></p>
        </div>
      </div>
      {/* --- Totals & Remarks --- */}
      <div className="border-b-2 w-full border-gray-500 grid grid-cols-3 text-left justify-between items-center">
        <div className=" pt-4 pb-0.5 px-2 border-r-2 h-full border-gray-500 flex flex-col justify-between gap-2 col-span-2">
          {type=== 'container' ? (<p className="text-md"><strong>Note:</strong> The container will be dispatched <b>{delivery_terms.replace(/_/g, ' ').toLowerCase()}</b> of receiving 30% advance payment.</p>) : null}
          <p className="text-md"><strong>Grand Total In Words:</strong> <span className='italic'>{toWords.convert(totals.grandTotal)}</span> </p>
        </div>
        <div className="pt-4 pb-0.5 px-2 flex flex-col gap-1 col-span-1">
          <p className="text-md flex flex-grow justify-between"><span className='font-semibold'>Taxable Amount:</span> <span>{formatCurrency(totals.subTotal)}</span></p>
          <p className="text-md flex flex-grow justify-between"><span className='font-semibold'>Tax Amount:</span> <span>{formatCurrency(totals.subTotal * 5/100)}</span></p>
          {(['false', false].includes(transport.included)) && <p className="text-md flex flex-grow justify-between"><span className='font-semibold'>Freight Charges:</span> <span>{formatCurrency(transport.charges)}</span></p>}
          <p className="sm:text-lg flex flex-grow font-bold justify-between"><span>Grand Total:</span> <span>{formatCurrency(totals.grandTotal)}</span></p>
        </div>
      </div>
      <div className="border-b-2 w-full border-gray-500 grid grid-cols-2 text-left justify-between items-center">
        <div className="py-0.5 px-2 flex border-r-2 border-gray-500  flex-col gap-0.5 text-md">
          <p>Bank Name:- {bankInfo.name}</p>
          <p>A/C Name:- {bankInfo.branch}</p>
          <p>A/C No. :- {bankInfo.acNo}</p>
          <p>IFSC Code:- {bankInfo.ifsc}</p>
        </div>
        <div className="py-0.5 px-2 h-full flex flex-col justify-around gap-2">
          <p className="text-md"><strong>Remarks:</strong> {billing_remarks || 'N/A'}</p>
           {!warranty_terms && 
              <p className='text-md font-bold'>NO GUARANTEE NO WARRANTY</p>
            }
        </div>
      </div>
      
      {/* --- Footer --- */}
      <div className="w-full py-0.5 px-2 text-center flex flex-col justify-center items-start">
        <p className="font-bold">Terms & Conditions</p>
        <div className="text-start italic">
          {termsAndConditions.map((term, index) => (
            <p key={index}>{`${index + 1}. ${term}`}</p>
          ))}
          <p className="mt-4">This is a computer-generated document and does not require a signature.</p>
        </div>
        <p className="w-full text-right">For, MANTRA E-BIKES</p>
      </div>
    </div>
  );
}

export default React.forwardRef(InvoiceDetail);