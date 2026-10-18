export const MONTHLY_LABELS = [
    "Nov '25", "Dec '25", "Jan '26", "Feb '26", "Mar '26", "Apr '26",
    "May '26", "Jun '26", "Jul '26", "Aug '26", "Sep '26", "Oct '26"
];

export const MONTHLY_REVENUE = [
    8420, 14300, 7890, 9150, 10200, 11400,
    12800, 13500, 11900, 14200, 13800, 15890
];

export const MONTHLY_ORDERS = [
    82, 138, 76, 89, 98, 111,
    124, 131, 115, 138, 134, 151
];

export const CATEGORY_LABELS = ['Dresses', 'Shoes', 'Shirts', 'Outerwear', 'Accessories'];
export const CATEGORY_REVENUE = [48200, 32100, 24500, 20300, 16400];
export const CATEGORY_COLORS = ['#e73c7e', '#23a6d5', '#ee7752', '#a855f7', '#23d5ab'];

export const ORDER_STATUS_LABELS = ['Delivered', 'Processing', 'Shipped', 'Received', 'Cancelled'];
export const ORDER_STATUS_DATA   = [784, 142, 98, 187, 36];
export const ORDER_STATUS_COLORS = ['#2ecc71', '#f59e0b', '#a855f7', '#23a6d5', '#e74c3c'];

export const CUSTOMER_ACQUISITION = [28, 45, 31, 38, 42, 51, 58, 64, 49, 67, 62, 73];

export const TOP_PRODUCTS = [
    { rank: 1, name: 'Evening Gown',  category: 'Dresses',     units: 312, revenue: 18720.00, growth:  14.2 },
    { rank: 2, name: 'Running Shoes', category: 'Shoes',        units: 287, revenue: 22960.00, growth:   9.8 },
    { rank: 3, name: 'Leather Belt',  category: 'Accessories',  units: 265, revenue:  7950.00, growth:  -3.1 },
    { rank: 4, name: 'Summer Dress',  category: 'Dresses',      units: 241, revenue: 14460.00, growth:  21.5 },
    { rank: 5, name: 'Polo Shirt',    category: 'Shirts',       units: 234, revenue:  7020.00, growth:   6.7 },
    { rank: 6, name: 'Leather Boots', category: 'Shoes',        units: 198, revenue: 17820.00, growth:  11.3 },
    { rank: 7, name: 'Handbag',       category: 'Accessories',  units: 175, revenue: 13125.00, growth:  -1.4 },
    { rank: 8, name: 'Cotton Shirt',  category: 'Shirts',       units: 168, revenue:  5040.00, growth:   4.2 },
];

export const RECENT_ORDERS = [
    { id: 'ORD-4821', customer: 'Sophie Martin',  date: 'Oct 18, 2026', items: 3, total: 214.50, status: 'Processing' },
    { id: 'ORD-4820', customer: 'Liam Chen',       date: 'Oct 17, 2026', items: 1, total:  89.99, status: 'Shipped'    },
    { id: 'ORD-4819', customer: 'Aisha Patel',     date: 'Oct 17, 2026', items: 2, total: 157.00, status: 'Received'   },
    { id: 'ORD-4818', customer: 'Marco Silva',     date: 'Oct 16, 2026', items: 4, total: 338.75, status: 'Delivered'  },
    { id: 'ORD-4817', customer: 'Emma Johnson',    date: 'Oct 16, 2026', items: 2, total: 128.00, status: 'Delivered'  },
    { id: 'ORD-4816', customer: 'Noah Williams',   date: 'Oct 15, 2026', items: 1, total:  65.00, status: 'Cancelled'  },
    { id: 'ORD-4815', customer: 'Isabella Brown',  date: 'Oct 15, 2026', items: 3, total: 245.80, status: 'Delivered'  },
    { id: 'ORD-4814', customer: 'James Davis',     date: 'Oct 14, 2026', items: 2, total: 189.50, status: 'Delivered'  },
];

export const KPI = {
    totalRevenue:   { value: '$141,450', growth: 12.4,  label: 'Total Revenue (YTD)'  },
    totalOrders:    { value: '1,247',    growth: 8.2,   label: 'Total Orders (YTD)'   },
    avgOrderValue:  { value: '$113.43',  growth: 3.8,   label: 'Avg Order Value'       },
    topCategory:    { value: 'Dresses',  share:  34.1,  label: 'Top Category'          },
    newCustomers:   { value: '608',      growth: 15.6,  label: 'New Customers (YTD)'   },
    conversionRate: { value: '3.2%',     growth: 0.4,   label: 'Conversion Rate'       },
};
