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
    { name: 'ALL' },
    { name: 'SINGLE LIGHT' },
    { name: 'DOUBLE LIGHT' },
    { name: 'OTHER MODELS' }
];

const bookingTabs = [
  { name: 'ALL' },
  { name: 'APPROVAL PENDING' },
  { name: 'APPROVED AND ACTIVE' },
  { name: 'COMPLETED' },
]

const salesColumns = [
    { header: 'Container No.', key: 'container_no' },
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

export const calculatePaymentStatus = (amountPaid, grandTotal) => {
  if (amountPaid === 0) return 'Not Received';
  if (amountPaid >= grandTotal) return 'Full Payment Received';
  if (amountPaid >= grandTotal * 0.3 && amountPaid < grandTotal) return 'Partial Received';
  if (amountPaid === grandTotal * 0.3) return 'Full Token Received';
  return 'Partial Token Received';
};

export const getPaymentStatusColor = (status) => {
  switch(status) {
    case 'Full Payment Received': return 'bg-emerald-100 text-emerald-800';
    case 'Partial Received': return 'bg-blue-100 text-blue-800';
    case 'Full Token Received': return 'bg-yellow-100 text-yello-800';
    case 'Partial Token Received': return 'bg-orange-100 text-orange-800';
    default: return 'bg-red-100 text-red-800';
  }
};

const modelOptions = {
    "single_light": [
          "BOTH 10 INCH 48/60V",
          "BOTH 10 INCH 48/60/72V",
          "FRONT 12 INCH 48/60V",
          "FRONT 12 INCH 60/72V",
          "FRONT 12 INCH 48/60/72V",
      ],
    "double_light": [
        "BOTH 10 INCH 48/60V",
        "BOTH 10 INCH 48/60/72V",
        "FRONT 12 INCH 48/60V",
        "FRONT 12 INCH 60/72V",
        "FRONT 12 INCH 48/60/72V",
        "BOTH 12 INCH DOUBLE DISC 60/72V",
    ],
    "activa": [
        "BOTH 12 INCH DOUBLE DISC 60/72",
      ],
    "round_light": [
        "BOTH 12 INCH DOUBLE DISC 60/72",
      ],
    "jali_vespa": [
        "BOTH 12 INCH DOUBLE DISC 60/72",
    ],
    "cs2": [
        "BOTH 12 INCH DOUBLE DISC 60/72",
    ],
    "cutie_super": [
        "BOTH 12 INCH DOUBLE DISC 60/72",
    ],
    "monarch_super": [
        "BOTH 12 INCH DOUBLE DISC 60/72",
    ],
    "bmw": [
        "BOTH 12 INCH DOUBLE DISC 60/72",
    ],
    "monarch_supreme": [
        "BOTH 12 INCH DOUBLE DISC 60/72",
    ],
    "jaguar_(jh)": [
        "BOTH 12 INCH DOUBLE DISC 60/72"
    ],
    "cutie_plus": [
        "BOTH 12 INCH DOUBLE DISC 60/72"
    ],
    "v8": [
        "BOTH 12 INCH DOUBLE DISC 60/72"
    ],
    "loader": [
        "2 WHEELER, BOTH 12 INCH DOUBLE DISC 60/72",
        "3 WHEELER, All 12 INCH DOUBLE DISC 60/72"
    ],
    "handicaped": [
        "BOTH 12 INCH DOUBLE DISC 60/72"
    ],
    "battery": [
        "TAINNENG LEAD ACID 7KG",
        "TAINNENG LEAD ACID 7.2KG",
        "TAINNENG LEAD ACID 6KG",
        "CHILWEE LEAD ACID 7KG",
        "CHILWEE LEAD ACID 7.2KG",
        "CHILWEE LEAD ACID 6.6KG",
    ],
    'charger':[ 
      "KY 72V",
      "KY 60V",
      "KY 48V",
      "Solar Power 48V",
      "Solar Power 60V",
      "Solar Power 72V",
    ]

}

const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      sales: 'bg-blue-100 text-blue-800',
      manager: 'bg-green-100 text-green-800',
      accounts: 'bg-purple-100 text-purple-800',
      store: 'bg-orange-100 text-orange-800',
      transporter: 'bg-indigo-100 text-indigo-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

export const accessoryOptions = {
  battery: {
    options: [
      "TAINNENG L.A. 7KG",
        "TAINNENG L.A. 7.2KG",
        "TAINNENG L.A. 6KG",
        "CHILWEE L.A. 7KG",
        "CHILWEE L.A. 7.2KG",
        "CHILWEE L.A. 6.6KG",
    ]
  },
  charger: {
    options: [
      "KY 72V",
      "KY 60V",
      "KY 48V",
      "Solar Power 48V",
      "Solar Power 60V",
      "Solar Power 72V",
    ]
  },
};
export const normalAccessoryOptions = {
  battery: {
    options: [
      "48V 32Ah L.A. S.P.",
      "60V 32Ah L.A. S.P.",
      "72V 32Ah L.A. S.P.",
      "72V 42Ah L.A. Chilwee",
      "60V 42Ah L.A. Chilwee",
      "48V 32Ah L.A. 7KG Chilwee",
      "60V 32Ah L.A. 7KG Chilwee",
      "72V 32Ah L.A. 7KG Chilwee",
      "48V 32Ah L.A. 7.2KG Chilwee",
      "60V 32Ah L.A. 7.2KG Chilwee",
      "72V 32Ah L.A. 7.2KG Chilwee",
      "48V 32Ah L.A. 6.7KG Chilwee",
      "60V 32Ah L.A. 6.7KG Chilwee",
      "72V 32Ah L.A. 6.7KG Chilwee",
      "52V 34Ah Lithium",
      "48V 32Ah Lithium",
      "60V 30Ah Lithium",
      "72V 20Ah Lithium",
      "60V 34Ah Lithium",
      "72V 42Ah Lithium",
      "72V 32Ah Lithium",
    ]
  },
  charger: {
    options: [
      "KY 72V",
      "KY 60V",
      "KY 48V",
      "Solar Power 48V",
      "Solar Power 60V",
      "Solar Power 72V",
    ]
  },
};

export const PI_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED_BY_SALES_MANAGER: 'approved_sm',
  APPROVED_BY_ADMIN: 'approved_admin',
  FINAL: 'final',
  REJECTED: 'rejected'
};

export const PI_TYPES = {
  CONTAINER: 'container',
  NORMAL: 'normal'
};

export const ROLES = [
  { value: 'superuser', label: 'Super User', level: 100 },
  { value: 'admin', label: 'Administrator', level: 90 },
  { value: 'manager', label: 'Manager', level: 80 },
  { value: 'sales', label: 'Sales', level: 50 },
  { value: 'accounts', label: 'Accounts', level: 50 },
  { value: 'transporter', label: 'Transporter', level: 40 },
  { value: 'cha', label: 'CHA', level: 40 },
  { value: 'store', label: 'Store', level: 30 }
];

export const STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'pending', label: 'Pending Approval', color: 'orange' },
  { value: 'disabled', label: 'Disabled', color: 'red' }
];
export const PLACES = [
  { value: 'hisar', label: 'Hisar Branch', color: 'bg-teal-100 text-teal-800' },
  { value: 'noida', label: 'Noida Branch', color: 'bg-violet-100 text-violet-800' },
  { value: 'all', label: 'Multiple Branches', color: 'bg-amber-100 text-amber-800' },
];

const piStatusOptions = [{name: 'Mark Paid', value: 'paid'},{ name: 'Mark Token paid', value: 'token'}, { name: 'Mark Partially paid', value: 'partially'},{name: 'Mark Unpaid', value: 'unpaid'}]

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

export {sortOptions, etaOptions, ALL_AVAILABLE_COLUMNS, monthOptions, salesStatusMap, containerStatusMap, containerDetailsOrder, salesColumns, TABS, salesSortOptions, bookingTabs, modelOptions, piStatusOptions, getRoleBadgeColor}