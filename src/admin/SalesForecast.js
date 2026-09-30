import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Layout from '../core/Layout';
import Ftr from '../core/Ftr';
import { generateDummyOrders } from './salesForecastData';
import {
    groupRevenueByMonth,
    forecastRevenue,
    forecastBand,
    applyScenario,
    revenueByCategory,
    ordersByStatus,
    topProducts,
    growthPercent,
} from './salesForecast';
import { formatPrice } from '../core/pricing';
import useCountUp from './useCountUp';
import './SalesForecast.css';

// ─── Chart formatting helpers (exported for unit testing) ─────────────────────

/** Y-axis tick: prefix with $ symbol. */
export const formatYTick = v => `$${v}`;

/** Bar/simple tooltip: prefix value with $. */
export const formatSimpleTooltip = item =>
    `$${Number(item.value || 0).toFixed(2)}`;

/**
 * Line-chart tooltip label.
 * Suppresses internal datasets (name starts with '_') and the confidence-band
 * dataset; returns null for NaN values (they appear as gaps in the line).
 */
export const formatLineTooltip = (item, data) => {
    const label = (data.datasets[item.datasetIndex].label) || '';
    if (label.startsWith('_') || label === 'Confidence band') return null;
    const val = Number(item.value);
    return Number.isNaN(val) ? null : `${label}: $${val.toFixed(2)}`;
};

/** Legend filter: hide datasets whose label starts with '_'. */
export const legendFilter = item => item.text && !item.text.startsWith('_');

const BRAND = ['#ee7752', '#e73c7e', '#23a6d5', '#23d5ab'];

const MEDALS = ['🥇', '🥈', '🥉'];

const CAT_COLORS = {
    Dresses:     '#e73c7e',
    Shirts:      '#23a6d5',
    Shoes:       '#ee7752',
    Accessories: '#23d5ab',
};

const STATUS_COLORS = {
    Delivered:  '#23d5ab',
    Shipped:    '#23a6d5',
    Processing: '#ee7752',
    Cancelled:  '#e73c7e',
};

// ─── Inline SVG sparkline ─────────────────────────────────────────────────────
const Sparkline = ({ data, color }) => {
    const filled = (data || []).filter(v => v != null);
    if (filled.length < 2) return <svg className="sf-sparkline" />;
    const max = Math.max(...filled, 1);
    const w = 100;
    const h = 36;
    const pts = filled
        .map((v, i) => {
            const x = (i / (filled.length - 1)) * w;
            const y = h - (v / max) * (h - 4);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    return (
        <svg
            viewBox={`0 0 ${w} ${h}`}
            className="sf-sparkline"
            aria-hidden="true"
        >
            <polyline fill="none" stroke={color || BRAND[1]} strokeWidth="2" points={pts} />
        </svg>
    );
};

// ─── Page component ───────────────────────────────────────────────────────────
const SalesForecast = () => {
    const [boost, setBoost] = useState(0);
    const lineRef = useRef(null);

    // ── Data ────────────────────────────────────────────────────────────────
    const now           = useMemo(() => new Date(), []);
    const orders        = useMemo(() => generateDummyOrders(), []);
    const monthly       = useMemo(() => groupRevenueByMonth(orders, now), [orders, now]);
    const baseForecast  = useMemo(() => forecastRevenue(monthly), [monthly]);
    const forecast      = useMemo(() => applyScenario(baseForecast, boost), [baseForecast, boost]);
    const band          = useMemo(() => forecastBand(monthly, forecast), [monthly, forecast]);
    const catData       = useMemo(() => revenueByCategory(orders), [orders]);
    const statusData    = useMemo(() => ordersByStatus(orders), [orders]);
    const top5          = useMemo(() => topProducts(orders, 5), [orders]);

    // ── KPI scalars ─────────────────────────────────────────────────────────
    const currentMonth      = monthly[monthly.length - 1] || { revenue: 0, orderCount: 0 };
    const prevMonth         = monthly[monthly.length - 2] || { revenue: 0 };
    const nextMonthForecast = forecast[0] || 0;
    const growth            = growthPercent(prevMonth.revenue, currentMonth.revenue);
    const totalOrders       = monthly.reduce((s, m) => s + m.orderCount, 0);

    // ── Count-up animated values ─────────────────────────────────────────────
    const revThisMonth = useCountUp(currentMonth.revenue, 1200);
    const revForecast  = useCountUp(nextMonthForecast, 1200);
    const ordersAnim   = useCountUp(totalOrders, 1200);

    // ── Hero insight line ────────────────────────────────────────────────────
    const trendPct = growth !== null ? Math.abs(growth).toFixed(0) : 0;
    const trendDir = growth !== null && growth >= 0 ? 'up' : 'down';
    const insightLine = `Revenue is trending ${trendDir} ${trendPct}% — next month forecast $${Number(nextMonthForecast).toFixed(0)}`;

    // ── Canvas gradient for the actual-revenue line ──────────────────────────
    const [gradientFill, setGradientFill] = useState('rgba(231,60,126,0.3)');
    useEffect(() => {
        const chart =
            lineRef.current && lineRef.current.chartInstance;
        if (!chart) return;
        const grad = chart.ctx.createLinearGradient(0, 0, 0, chart.height);
        grad.addColorStop(0, 'rgba(231,60,126,0.55)');
        grad.addColorStop(1, 'rgba(231,60,126,0.02)');
        setGradientFill(grad);
    }, []); // once after mount

    // ── Forecast month labels ────────────────────────────────────────────────
    const forecastLabels = useMemo(
        () =>
            Array.from({ length: 3 }, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }),
        [now]
    );

    // ── Line chart ───────────────────────────────────────────────────────────
    const lastActual = monthly.length > 0 ? monthly[monthly.length - 1].revenue : 0;
    const allLabels  = [...monthly.map(m => m.month), ...forecastLabels];

    const lineData = {
        labels: allLabels,
        datasets: [
            {
                label: 'Actual Revenue',
                data: [...monthly.map(m => m.revenue), null, null, null],
                fill: true,
                backgroundColor: gradientFill,
                borderColor: '#e73c7e',
                borderWidth: 2,
                lineTension: 0.35,
                pointRadius: 3,
                pointBackgroundColor: '#e73c7e',
            },
            {
                label: 'Forecast',
                // Start the dashed line from the last actual point for continuity.
                data: [
                    ...monthly.slice(0, -1).map(() => null),
                    lastActual,
                    ...forecast,
                ],
                fill: false,
                borderColor: '#23a6d5',
                borderWidth: 2,
                borderDash: [6, 4],
                lineTension: 0.35,
                pointRadius: 3,
                pointBackgroundColor: '#23a6d5',
            },
            {
                label: 'Confidence band',
                data: [...monthly.map(() => null), ...band.map(b => b.upper)],
                fill: '+1',
                borderColor: 'transparent',
                backgroundColor: 'rgba(35,166,213,0.12)',
                pointRadius: 0,
                lineTension: 0.35,
            },
            {
                label: '_lower',
                data: [...monthly.map(() => null), ...band.map(b => b.lower)],
                fill: false,
                borderColor: 'transparent',
                pointRadius: 0,
                lineTension: 0.35,
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        animation: { duration: 900 },
        legend: { labels: { filter: legendFilter } },
        scales: {
            xAxes: [{ gridLines: { display: false } }],
            yAxes: [{ ticks: { beginAtZero: true, callback: formatYTick } }],
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            callbacks: { label: formatLineTooltip },
        },
    };

    // ── Bar chart ────────────────────────────────────────────────────────────
    const barData = {
        labels: catData.map(c => c.category),
        datasets: [{
            label: 'Revenue',
            data: catData.map(c => c.revenue),
            backgroundColor: catData.map(c => CAT_COLORS[c.category] || BRAND[0]),
            borderWidth: 0,
        }],
    };

    const barOptions = {
        responsive: true,
        legend: { display: false },
        scales: {
            xAxes: [{ gridLines: { display: false } }],
            yAxes: [{ ticks: { beginAtZero: true, callback: formatYTick } }],
        },
        tooltips: { callbacks: { label: formatSimpleTooltip } },
    };

    // ── Doughnut chart ───────────────────────────────────────────────────────
    const doughnutData = {
        labels: statusData.map(s => s.status),
        datasets: [{
            data: statusData.map(s => s.count),
            backgroundColor: statusData.map(s => STATUS_COLORS[s.status] || BRAND[0]),
            borderWidth: 2,
            borderColor: '#fff',
        }],
    };

    const doughnutOptions = {
        responsive: true,
        cutoutPercentage: 70,
        legend: { position: 'bottom' },
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div>
            <Layout
                back
                backText="Back to dashboard"
                to="/admin/dashboard"
                title="Sales Forecast"
                description=""
            >
                {/* Hero */}
                <div className="sf-hero">
                    <span className="sf-hero-badge">Sample data</span>
                    <p className="sf-hero-insight">{insightLine}</p>
                </div>

                {/* KPI Cards */}
                <div className="sf-kpi-grid">
                    <div className="sf-kpi-card">
                        <div className="sf-kpi-label">Revenue This Month</div>
                        <div className="sf-kpi-value">${formatPrice(revThisMonth)}</div>
                        <Sparkline data={monthly.map(m => m.revenue)} color={BRAND[1]} />
                    </div>

                    <div className="sf-kpi-card">
                        <div className="sf-kpi-label">Forecast Next Month</div>
                        <div
                            className="sf-kpi-value"
                            data-testid="sf-forecast-val"
                        >
                            ${formatPrice(revForecast)}
                        </div>
                        <Sparkline data={forecast} color={BRAND[2]} />
                    </div>

                    <div className="sf-kpi-card">
                        <div className="sf-kpi-label">Growth vs Last Month</div>
                        <div className="sf-kpi-value">
                            {growth !== null ? (
                                <span
                                    className={`sf-growth-chip ${growth >= 0 ? 'sf-growth-up' : 'sf-growth-down'}`}
                                >
                                    {growth >= 0 ? '▲' : '▼'}&nbsp;
                                    {Math.abs(growth).toFixed(1)}%
                                </span>
                            ) : (
                                <span className="sf-growth-chip">N/A</span>
                            )}
                        </div>
                        <Sparkline data={monthly.map(m => m.revenue)} color={BRAND[3]} />
                    </div>

                    <div className="sf-kpi-card">
                        <div className="sf-kpi-label">Total Orders (12 mo)</div>
                        <div className="sf-kpi-value">{Math.round(ordersAnim)}</div>
                        <Sparkline data={monthly.map(m => m.orderCount)} color={BRAND[0]} />
                    </div>
                </div>

                {/* Line chart: 12-month actual + 3-month forecast + band */}
                <div className="sf-chart-card">
                    <h5>Revenue Trend &amp; 3-Month Forecast</h5>
                    <Line ref={lineRef} data={lineData} options={lineOptions} />
                </div>

                {/* Bar chart: revenue by category */}
                <div className="sf-chart-card">
                    <h5>Revenue by Category</h5>
                    <Bar data={barData} options={barOptions} />
                </div>

                {/* Doughnut chart: orders by status */}
                <div className="sf-chart-card">
                    <h5>Orders by Status</h5>
                    <div className="sf-doughnut-wrapper">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                        <div className="sf-doughnut-center">
                            <span className="sf-doughnut-total">{totalOrders}</span>
                            <span className="sf-doughnut-label">orders</span>
                        </div>
                    </div>
                </div>

                {/* What-if marketing-boost slider */}
                <div className="sf-slider-section">
                    <label className="sf-slider-label" htmlFor="sf-boost-slider">
                        Marketing boost:&nbsp;
                        <strong>{boost > 0 ? `+${boost}` : boost}%</strong>
                    </label>
                    <input
                        id="sf-boost-slider"
                        type="range"
                        min="-20"
                        max="50"
                        step="1"
                        value={boost}
                        onChange={e => setBoost(Number.parseInt(e.target.value, 10))}
                    />
                    <div className="sf-slider-hint">
                        <span>−20%</span>
                        <span>+50%</span>
                    </div>
                </div>

                {/* Top-5 products table */}
                <div className="sf-table-card">
                    <h5>Top Products</h5>
                    <table className="sf-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product</th>
                                <th>Revenue</th>
                                <th>Units</th>
                                <th>Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top5.map((prod, i) => (
                                <tr key={prod.id} className="sf-product-row">
                                    <td>{MEDALS[i] !== undefined ? MEDALS[i] : i + 1}</td>
                                    <td>{prod.name}</td>
                                    <td>${formatPrice(prod.revenue)}</td>
                                    <td>{prod.unitsSold}</td>
                                    <td>
                                        <div className="sf-progress-bar-wrap">
                                            <div
                                                className="sf-progress-bar"
                                                style={{
                                                    width: top5[0].revenue > 0
                                                        ? `${(prod.revenue / top5[0].revenue) * 100}%`
                                                        : '0%',
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Layout>
            <Ftr />
        </div>
    );
};

export default SalesForecast;
