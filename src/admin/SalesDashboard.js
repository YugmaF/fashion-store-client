import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDollarSign, faShoppingCart, faReceipt,
    faTrophy, faUsers, faChartLine,
    faArrowUp, faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from './AdminLayout';
import {
    MONTHLY_LABELS, MONTHLY_REVENUE, MONTHLY_ORDERS,
    CATEGORY_LABELS, CATEGORY_REVENUE, CATEGORY_COLORS,
    ORDER_STATUS_LABELS, ORDER_STATUS_DATA, ORDER_STATUS_COLORS,
    CUSTOMER_ACQUISITION,
    TOP_PRODUCTS, RECENT_ORDERS, KPI
} from './salesDashboardData';
import './SalesDashboard.css';

/* ─── Static chart datasets ────────────────────────────────────────── */

const revenueChartData = {
    labels: MONTHLY_LABELS,
    datasets: [{
        label: 'Revenue',
        data: MONTHLY_REVENUE,
        borderColor: '#e73c7e',
        backgroundColor: 'rgba(231, 60, 126, 0.1)',
        fill: true,
        lineTension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#e73c7e',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
    }]
};

const revenueChartOptions = {
    responsive: true,
    legend: { display: false },
    scales: {
        xAxes: [{ gridLines: { display: false }, ticks: { fontSize: 11 } }],
        yAxes: [{
            gridLines: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
                fontSize: 11,
                callback: val => `$${(val / 1000).toFixed(0)}k`
            }
        }]
    },
    tooltips: {
        callbacks: {
            label: item => `Revenue: $${Number(item.yLabel).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        }
    }
};

const ordersChartData = {
    labels: MONTHLY_LABELS,
    datasets: [{
        label: 'Orders',
        data: MONTHLY_ORDERS,
        backgroundColor: 'rgba(35, 166, 213, 0.75)',
        borderColor: '#23a6d5',
        borderWidth: 1,
    }]
};

const ordersChartOptions = {
    responsive: true,
    legend: { display: false },
    scales: {
        xAxes: [{ gridLines: { display: false }, ticks: { fontSize: 11 } }],
        yAxes: [{
            gridLines: { color: 'rgba(0,0,0,0.04)' },
            ticks: { fontSize: 11, beginAtZero: true }
        }]
    },
    tooltips: {
        callbacks: { label: item => `${item.yLabel} orders` }
    }
};

const categoryChartData = {
    labels: CATEGORY_LABELS,
    datasets: [{
        data: CATEGORY_REVENUE,
        backgroundColor: CATEGORY_COLORS,
        hoverBorderWidth: 2,
        hoverBorderColor: '#fff',
    }]
};

const categoryChartOptions = {
    responsive: true,
    legend: { position: 'bottom', labels: { fontSize: 11, padding: 10 } },
    cutoutPercentage: 62,
    tooltips: {
        callbacks: {
            label: (item, data) => {
                const label = data.labels[item.index];
                const val   = data.datasets[0].data[item.index];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const pct   = ((val / total) * 100).toFixed(1);
                return `${label}: $${val.toLocaleString()} (${pct}%)`;
            }
        }
    }
};

const statusChartData = {
    labels: ORDER_STATUS_LABELS,
    datasets: [{
        data: ORDER_STATUS_DATA,
        backgroundColor: ORDER_STATUS_COLORS,
        hoverBorderWidth: 2,
        hoverBorderColor: '#fff',
    }]
};

const statusChartOptions = {
    responsive: true,
    legend: { position: 'bottom', labels: { fontSize: 11, padding: 10 } },
    cutoutPercentage: 62,
    tooltips: {
        callbacks: {
            label: (item, data) => {
                const label = data.labels[item.index];
                const val   = data.datasets[0].data[item.index];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const pct   = ((val / total) * 100).toFixed(1);
                return `${label}: ${val} (${pct}%)`;
            }
        }
    }
};

const customerChartData = {
    labels: MONTHLY_LABELS,
    datasets: [{
        label: 'New Customers',
        data: CUSTOMER_ACQUISITION,
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
        borderColor: '#a855f7',
        borderWidth: 1,
    }]
};

const customerChartOptions = {
    responsive: true,
    legend: { display: false },
    scales: {
        xAxes: [{ gridLines: { display: false }, ticks: { fontSize: 11 } }],
        yAxes: [{
            gridLines: { color: 'rgba(0,0,0,0.04)' },
            ticks: { fontSize: 11, beginAtZero: true }
        }]
    },
    tooltips: {
        callbacks: { label: item => `${item.yLabel} new customers` }
    }
};

/* ─── KPI card config ───────────────────────────────────────────────── */

const KPI_CARDS = [
    { icon: faDollarSign,   kpi: KPI.totalRevenue,   colors: ['#e73c7e', '#ff6b6b'] },
    { icon: faShoppingCart, kpi: KPI.totalOrders,    colors: ['#23a6d5', '#23d5ab'] },
    { icon: faReceipt,      kpi: KPI.avgOrderValue,  colors: ['#f59e0b', '#ee7752'] },
    { icon: faTrophy,       kpi: KPI.topCategory,    colors: ['#a855f7', '#e73c7e'] },
    { icon: faUsers,        kpi: KPI.newCustomers,   colors: ['#2ecc71', '#23d5ab'] },
    { icon: faChartLine,    kpi: KPI.conversionRate, colors: ['#0f3460', '#533483'] },
];

/* ─── Status badge class lookup ─────────────────────────────────────── */

const STATUS_CLASS = {
    Delivered:  'sd-status sd-status-delivered',
    Processing: 'sd-status sd-status-processing',
    Shipped:    'sd-status sd-status-shipped',
    Received:   'sd-status sd-status-received',
    Cancelled:  'sd-status sd-status-cancelled',
};

/* ─── Sub-components ────────────────────────────────────────────────── */

const KpiCard = ({ icon, kpi, colors }) => {
    const [c1, c2] = colors;
    const isUp = kpi.growth > 0;

    return (
        <div className="sd-kpi-card">
            <div className="sd-kpi-bar" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
            <div className="sd-kpi-icon-wrap" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                <FontAwesomeIcon icon={icon} />
            </div>
            <p className="sd-kpi-label">{kpi.label}</p>
            <h3 className="sd-kpi-value">{kpi.value}</h3>
            {kpi.growth !== undefined && (
                <span className={`sd-kpi-growth ${isUp ? 'sd-up' : 'sd-down'}`}>
                    <FontAwesomeIcon icon={isUp ? faArrowUp : faArrowDown} size="xs" />
                    &nbsp;{Math.abs(kpi.growth)}% vs last year
                </span>
            )}
            {kpi.share !== undefined && (
                <span className="sd-kpi-share">{kpi.share}% of total revenue</span>
            )}
        </div>
    );
};

const TopProductsTable = () => (
    <div className="sd-table-card">
        <p className="sd-table-title">🏆 Top Selling Products</p>
        <table className="sd-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Units</th>
                    <th>Revenue</th>
                    <th>Growth</th>
                </tr>
            </thead>
            <tbody>
                {TOP_PRODUCTS.map(p => (
                    <tr key={p.rank}>
                        <td><span className="sd-rank">{p.rank}</span></td>
                        <td><strong>{p.name}</strong></td>
                        <td><span className="sd-cat-pill">{p.category}</span></td>
                        <td>{p.units.toLocaleString()}</td>
                        <td>${p.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className={p.growth >= 0 ? 'sd-up' : 'sd-down'}>
                            <FontAwesomeIcon icon={p.growth >= 0 ? faArrowUp : faArrowDown} size="xs" />
                            &nbsp;{Math.abs(p.growth)}%
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const RecentOrdersTable = () => (
    <div className="sd-table-card">
        <p className="sd-table-title">🕐 Recent Orders</p>
        <table className="sd-table">
            <thead>
                <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {RECENT_ORDERS.map(o => (
                    <tr key={o.id}>
                        <td><code style={{ fontSize: '0.75rem' }}>{o.id}</code></td>
                        <td>{o.customer}</td>
                        <td style={{ whiteSpace: 'nowrap', color: '#8a8a9a' }}>{o.date}</td>
                        <td>{o.items}</td>
                        <td><strong>${o.total.toFixed(2)}</strong></td>
                        <td><span className={STATUS_CLASS[o.status]}>{o.status}</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/* ─── Main component ────────────────────────────────────────────────── */

const SalesDashboard = () => (
    <AdminLayout
        back
        backText="Back to dashboard"
        to="/admin/dashboard"
        title="Sales Dashboard"
        description="Fashion Store · Year-to-date overview"
        actions={<span className="ad-pill ad-pill-neutral">Mock data · Oct 2026</span>}
    >
            {/* KPI cards */}
            <p className="sd-section-title">Key Performance Indicators</p>
            <div className="sd-kpi-grid">
                {KPI_CARDS.map((card, i) => (
                    <KpiCard key={i} icon={card.icon} kpi={card.kpi} colors={card.colors} />
                ))}
            </div>

            {/* Charts row 1 — Revenue trend + Category breakdown */}
            <p className="sd-section-title">Revenue Overview</p>
            <div className="sd-charts-row sd-charts-row-main">
                <div className="sd-chart-card">
                    <p className="sd-chart-title">Monthly Revenue — last 12 months</p>
                    <Line data={revenueChartData} options={revenueChartOptions} />
                </div>
                <div className="sd-chart-card">
                    <p className="sd-chart-title">Revenue by Category</p>
                    <div className="sd-chart-body-doughnut">
                        <Doughnut data={categoryChartData} options={categoryChartOptions} />
                    </div>
                </div>
            </div>

            {/* Charts row 2 — Order status + Customer acquisition */}
            <p className="sd-section-title">Orders &amp; Customers</p>
            <div className="sd-charts-row sd-charts-row-sub">
                <div className="sd-chart-card">
                    <p className="sd-chart-title">Orders by Status</p>
                    <div className="sd-chart-body-doughnut">
                        <Doughnut data={statusChartData} options={statusChartOptions} />
                    </div>
                </div>
                <div className="sd-chart-card">
                    <p className="sd-chart-title">Monthly Orders Volume</p>
                    <Bar data={ordersChartData} options={ordersChartOptions} />
                </div>
            </div>

            {/* Charts row 3 — Customer acquisition */}
            <p className="sd-section-title">Customer Acquisition</p>
            <div className="sd-charts-row" style={{ gridTemplateColumns: '1fr' }}>
                <div className="sd-chart-card">
                    <p className="sd-chart-title">New Customers per Month</p>
                    <Bar data={customerChartData} options={customerChartOptions} />
                </div>
            </div>

            {/* Tables */}
            <p className="sd-section-title">Detailed Breakdown</p>
            <div className="sd-tables-row">
                <TopProductsTable />
                <RecentOrdersTable />
            </div>
    </AdminLayout>
);

export default SalesDashboard;
