const sortOptions = [
    { key: 'eta_asc', label: 'ETA: Soonest First' },
    { key: 'eta_desc', label: 'ETA: Latest First' },
  { key: 'model_asc', label: 'Model (A-Z)' },
  { key: 'model_desc', label: 'Model (Z-A)' },
  { key: 'company_asc', label: 'Company (A-Z)' },
  { key: 'company_desc', label: 'Company (Z-A)' },
  { key: 'color_bright', label: 'More Bright Colors' },
  { key: 'color_dark', label: 'More Dark Colors' },
];
const salesSortOptions = [
  { key: 'eta_asc', label: 'ETA: Soonest First' },
  { key: 'eta_desc', label: 'ETA: Latest First' },
  { key: 'model_asc', label: 'Model: A-Z' },
  { key: 'model_desc', label: 'Model: Z-A' },
  { key: 'color_bright', label: 'More Bright Colors' },
  { key: 'color_dark', label: 'More Dark Colors' },

];
const TABS = [
    { name: 'All' },
    { name: 'SINGLE LIGHT' },
    { name: 'DOUBLE LIGHT' },
    { name: 'OTHER MODELS' }
];

const salesColumns = [
    { header: 'Model', key: 'model' },
    { header: 'Specifications', key: 'specifications' },
    { header: 'Qty', key: 'qty' },
    { header: 'Battery', key: 'battery' },
    { header: 'Charger', key: 'charger' },
    { header: 'Colours', key: 'colours' },
    { header: 'ETA', key: 'eta' },
  ];

const etaOptions = [
    { key: 'all', label: 'All' },
    { key: '5', label: 'Next 5 days' },
    { key: '10', label: 'Next 10 days' },
  { key: '15', label: 'Next 15 days' },
  { key: '20', label: 'Next 20 days' },
];
const monthOptions = [
    { key: 'all', label: 'All' },
  { key: '0', label: 'January' },
  { key: '1', label: 'February' },
  { key: '2', label: 'March' },
  { key: '3', label: 'April' },
  { key: '4', label: 'May' },
  { key: '5', label: 'June' },
  { key: '6', label: 'July' },
  { key: '7', label: 'August' },
  { key: '8', label: 'September' },
  { key: '9', label: 'October' },
  { key: '10', label: 'November' },
  { key: '11', label: 'December' },
];

const ALL_AVAILABLE_COLUMNS = [
  { key: 'company_name', header: 'Company' },
  { key: 'model', header: 'Model' },
  { key: 'party_name', header: 'Party Name' },
  { key: 'container_no', header: 'Container No.' },
  { key: 'destination', header: 'Destination' },
  { key: 'status', header: 'Container Status' },
  { key: 'sales_status', header: 'Sales Status' },
  { key: 'eta', header: 'ETA' },
  { key: 'port', header: 'Port' },
  { key: 'battery', header: 'Battery' },
  { key: 'charger', header: 'Charger' },
  { key: 'colours', header: 'Colours' },
];

const salesStatusMap = [
  {status: 'Available for sale', colour: 'bg-green-100 text-green-800'},
  {status: 'Blocked', colour: 'bg-gray-300 text-gray-800'},
  {status: 'Sold', colour: 'bg-yellow-100 text-yellow-800'},
  {status: 'Booked for Adampur', colour: 'bg-blue-100 text-blue-800'},
  {status: 'Booked for Noida', colour: 'bg-orange-100 text-orange-800'},
  {status: 'Pending Approval', colour: 'bg-fuchsia-100 text-fuchsia-800'}
]
const containerStatusMap = [
  {status: 'At Sea', colour: 'bg-sky-100 text-sky-800'},
  {status: 'Reached Port', colour: 'bg-emerald-100 text-emerald-800'},
  {status: 'Clearance Pending', colour: 'bg-fuchsia-100 text-fuchsia-800'},
  {status: 'CFS Pending', colour: 'bg-lime-100 text-lime-800'},
  {status: 'DO Pending', colour: 'bg-yellow-100 text-yellow-800'},
  {status: 'At CFS', colour: 'bg-violet-100 text-violet-800'},
  {status: 'Tpt In Process', colour: 'bg-red-100 text-red-800'},
  {status: 'On the way', colour: 'bg-slate-300 text-slate-800'},
  {status: 'Rail Out', colour: 'bg-stone-600 text-stone-200'},
  {status: 'Reached Destination', colour: 'bg-neutral-300 text-neutral-800'},
]

const containerDetailsOrder = {
  job_no: 1,
  company_name: 2,
  model: 3,
  specifications: 4,
  container_no: 5,
  qty: 6,
  destination: 7,
  status: 8,
  battery: 9,
  charger: 10,
  extra_parts: 11,
  colours: 12,
  etd: 13,
  eta: 14,
  port: 15,
  sales_status: 16,
  bl_number: 17,
  stock_at_transporter: 18,
  transfers: 19,
  shipping_line: 20,
  shipping_rent: 21,
}

export {sortOptions, etaOptions, ALL_AVAILABLE_COLUMNS, monthOptions, salesStatusMap, containerStatusMap, containerDetailsOrder, salesColumns, TABS, salesSortOptions}