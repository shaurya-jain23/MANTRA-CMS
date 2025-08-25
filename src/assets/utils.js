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
  { key: 'container_no', header: 'Container No.' },
  { key: 'destination', header: 'Destination' },
  { key: 'status', header: 'Container Status' },
  { key: 'sales_status', header: 'Sales Status' },
  { key: 'eta', header: 'ETA' },
  { key: 'port', header: 'Port' },
  { key: 'colours', header: 'Colours' },
];

export {sortOptions, etaOptions, ALL_AVAILABLE_COLUMNS, monthOptions}