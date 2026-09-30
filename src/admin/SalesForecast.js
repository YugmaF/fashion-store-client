import React, {useMemo, useState} from 'react';
import Layout from '../core/Layout';
import Ftr from '../core/Ftr';
import {Bar, Doughnut, Line} from 'react-chartjs-2';
import {generateDummyOrders} from './salesForecastData';
import {
    applyScenario,
    forecastBand,
    forecastRevenue,
    groupRevenueByMonth,
    growthPercent,
    ordersByStatus,
    revenueByCategory,
    topProducts
} from './salesForecast';
import {useCountUp} from './useCountUp';
import {formatPrice} from '../core/pricing';
import './SalesForecast.css';

const BRAND_COLORS = ['#ee7752', '#e73c7e', '#23a6d5', '#23d5ab'];
const MEDALS = ['🥇', '🥈', '🥉'];
const SCENARIO_MIN = -20;
const SCENARIO_MAX = 50;
const SCENARIO_STEP = 5;

const prefersReducedMotion = () => (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

const addMonthsToLabel = (monthLabel, offset) => {
    const [year, month] = monthLabel.split('-').map(part => Number.parseInt(part, 10));
    const date = new Date(year, month - 1 + offset, 1);
    return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
};

const brandGradient = (ctx, chartArea, fromAlpha = 0.35) => {
    if (!chartArea) {
        return 'rgba(231, 60, 126, 0.2)';
    }

    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, `rgba(231, 60, 126, ${fromAlpha})`);
    gradient.addColorStop(1, 'rgba(231, 60, 126, 0)');
    return gradient;
};

const Sparkline = ({data}) => {
    if (!data || data.length === 0) {
        return null;
    }

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const stepX = 100 / Math.max(data.length - 1, 1);
    const points = data
        .map((value, index) => `${(index * stepX).toFixed(2)},${(30 - ((value - min) / range) * 28).toFixed(2)}`)
        .join(' ');

    return (
        <svg className="sf-kpi-sparkline" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={points} fill="none" stroke="#e73c7e" strokeWidth="2" />
        </svg>
    );
};

const KpiCard = ({label, value, formatter, sparklineData, chip, durationMs = 1200}) => {
    const animated = useCountUp(value, durationMs);

    return (
        <div className="sf-card sf-kpi-card">
            <div className="sf-kpi-label">{label}</div>
            <div className="sf-kpi-value">{formatter(animated)}</div>
            {chip}
            <Sparkline data={sparklineData} />
        </div>
    );
};

const SalesForecast = () => {
    const now = useMemo(() => new Date(), []);
    const orders = useMemo(() => generateDummyOrders(now), [now]);
    const monthly = useMemo(() => groupRevenueByMonth(orders, now, 12), [orders, now]);
    const forecast = useMemo(() => forecastRevenue(monthly, 3), [monthly]);
    const band = useMemo(() => forecastBand(monthly, forecast), [monthly, forecast]);
    const categoryData = useMemo(() => revenueByCategory(orders), [orders]);
    const statusData = useMemo(() => ordersByStatus(orders), [orders]);
    const products = useMemo(() => topProducts(orders, 5), [orders]);

    const [scenarioPercent, setScenarioPercent] = useState(0);

    const scenarioForecast = useMemo(() => applyScenario(forecast, scenarioPercent), [forecast, scenarioPercent]);
    const scenarioBand = useMemo(() => applyScenario(band, scenarioPercent), [band, scenarioPercent]);

    const reducedMotion = prefersReducedMotion();

    const revenueThisMonth = monthly.length > 0 ? monthly[monthly.length - 1].revenue : 0;
    const previousMonthRevenue = monthly.length > 1 ? monthly[monthly.length - 2].revenue : 0;
    const growth = growthPercent(previousMonthRevenue, revenueThisMonth);
    const totalOrders = monthly.reduce((sum, entry) => sum + entry.orderCount, 0);
    const forecastNextMonth = scenarioForecast.length > 0 ? scenarioForecast[0] : 0;

    const growthIsUp = growth === null || growth >= 0;
    const growthLabel = growth === null ? 'stable' : (growthIsUp ? 'up' : 'down');
    const growthAbs = growth === null ? 0 : Math.abs(growth);

    const insight = `Revenue is trending ${growthLabel} ${growthAbs.toFixed(0)}%`
        + ` — next month forecast $${formatPrice(forecastNextMonth)}`;

    const recentRevenue = monthly.slice(-6).map(entry => entry.revenue);
    const recentOrderCounts = monthly.slice(-6).map(entry => entry.orderCount);
    const forecastSparkline = [revenueThisMonth, ...scenarioForecast];

    const handleScenarioChange = event => {
        setScenarioPercent(Number.parseInt(event.target.value, 10));
    };

    const lastActualMonth = monthly.length > 0 ? monthly[monthly.length - 1].month : null;
    const forecastLabels = lastActualMonth
        ? scenarioForecast.map((_, index) => addMonthsToLabel(lastActualMonth, index + 1))
        : [];
    const lineLabels = [...monthly.map(entry => entry.month), ...forecastLabels];

    const actualSeries = [...monthly.map(entry => entry.revenue), ...new Array(scenarioForecast.length).fill(null)];
    const bridgeCount = Math.max(monthly.length - 1, 0);
    const forecastSeries = [
        ...new Array(bridgeCount).fill(null),
        revenueThisMonth,
        ...scenarioForecast
    ];
    const upperSeries = [
        ...new Array(bridgeCount).fill(null),
        revenueThisMonth,
        ...scenarioBand.map(entry => entry.upper)
    ];
    const lowerSeries = [
        ...new Array(bridgeCount).fill(null),
        revenueThisMonth,
        ...scenarioBand.map(entry => entry.lower)
    ];

    const lineData = {
        labels: lineLabels,
        datasets: [
            {
                label: 'Confidence (upper)',
                data: upperSeries,
                borderWidth: 0,
                pointRadius: 0,
                fill: '+1',
                backgroundColor: 'rgba(35, 166, 213, 0.15)'
            },
            {
                label: 'Confidence (lower)',
                data: lowerSeries,
                borderWidth: 0,
                pointRadius: 0,
                fill: false,
                backgroundColor: 'rgba(35, 166, 213, 0.15)'
            },
            {
                label: 'Actual revenue',
                data: actualSeries,
                borderColor: '#e73c7e',
                backgroundColor: context => {
                    const {chart} = context;
                    return brandGradient(chart.ctx, chart.chartArea);
                },
                fill: true,
                lineTension: 0.35,
                pointRadius: 3,
                pointBackgroundColor: '#e73c7e'
            },
            {
                label: 'Forecast',
                data: forecastSeries,
                borderColor: '#23a6d5',
                borderDash: [6, 4],
                fill: false,
                lineTension: 0.35,
                pointRadius: 3,
                pointBackgroundColor: '#23a6d5'
            }
        ]
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: reducedMotion ? false : {duration: 900, easing: 'easeOutQuart'},
        legend: {display: false},
        tooltips: {
            callbacks: {
                label: tooltipItem => `$${formatPrice(tooltipItem.yLabel)}`
            }
        },
        scales: {
            xAxes: [{gridLines: {display: false}}],
            yAxes: [{gridLines: {color: 'rgba(0, 0, 0, 0.06)'}, ticks: {beginAtZero: true}}]
        }
    };

    const barData = {
        labels: categoryData.map(entry => entry.category),
        datasets: [
            {
                label: 'Revenue by category',
                data: categoryData.map(entry => entry.revenue),
                backgroundColor: BRAND_COLORS
            }
        ]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: reducedMotion ? false : {duration: 900, easing: 'easeOutQuart'},
        legend: {display: false},
        tooltips: {
            callbacks: {
                label: tooltipItem => `$${formatPrice(tooltipItem.yLabel)}`
            }
        },
        scales: {
            xAxes: [{gridLines: {display: false}}],
            yAxes: [{gridLines: {color: 'rgba(0, 0, 0, 0.06)'}, ticks: {beginAtZero: true}}]
        }
    };

    const doughnutData = {
        labels: statusData.map(entry => entry.status),
        datasets: [
            {
                data: statusData.map(entry => entry.count),
                backgroundColor: BRAND_COLORS
            }
        ]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutoutPercentage: 70,
        animation: reducedMotion ? false : {duration: 900, easing: 'easeOutQuart'},
        legend: {position: 'bottom'},
        tooltips: {
            callbacks: {
                label: (tooltipItem, data) => {
                    const label = data.labels[tooltipItem.index];
                    const value = data.datasets[0].data[tooltipItem.index];
                    return `${label}: ${value}`;
                }
            }
        }
    };

    const topProductsRevenue = products.reduce((sum, product) => sum + product.revenue, 0) || 1;

    return (
        <div>
            <Layout
                back={true}
                backText="Back to dashboard"
                to="/admin/dashboard"
                title="Sales Forecast"
                description="A sample-data preview of sales trends and a 3-month revenue forecast."
                className="container-fluid"
            >
                <div className="sf-hero">
                    <span className="sf-hero-badge">Sample data</span>
                    <h3 className="sf-hero-title">Sales Forecast</h3>
                    <p className="sf-hero-insight">{insight}</p>
                </div>

                <div className="sf-kpi-row">
                    <KpiCard
                        label="Revenue this month"
                        value={revenueThisMonth}
                        formatter={value => `$${formatPrice(value)}`}
                        sparklineData={recentRevenue}
                    />
                    <KpiCard
                        label="Forecast next month"
                        value={forecastNextMonth}
                        formatter={value => `$${formatPrice(value)}`}
                        sparklineData={forecastSparkline}
                    />
                    <KpiCard
                        label="Growth vs last month"
                        value={growthAbs}
                        formatter={value => `${value.toFixed(1)}%`}
                        sparklineData={recentRevenue}
                        chip={(
                            <span className={`sf-chip ${growthIsUp ? 'sf-chip-up' : 'sf-chip-down'}`}>
                                {growthIsUp ? '▲' : '▼'} {growthAbs.toFixed(1)}%
                            </span>
                        )}
                    />
                    <KpiCard
                        label="Total orders (12 months)"
                        value={totalOrders}
                        formatter={value => `${Math.round(value)}`}
                        sparklineData={recentOrderCounts}
                    />
                </div>

                <div className="sf-charts-row">
                    <div className="sf-card sf-chart-card">
                        <h5>Revenue trend &amp; 3-month forecast</h5>
                        <div style={{height: 280}}>
                            <Line data={lineData} options={lineOptions} />
                        </div>
                    </div>
                    <div className="sf-card sf-chart-card">
                        <h5>Revenue by category</h5>
                        <div style={{height: 280}}>
                            <Bar data={barData} options={barOptions} />
                        </div>
                    </div>
                    <div className="sf-card sf-chart-card sf-doughnut-wrap">
                        <h5>Orders by status</h5>
                        <div style={{height: 280}}>
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        </div>
                        <div className="sf-doughnut-total">
                            <div className="sf-doughnut-total-number">{totalOrders}</div>
                            <div className="sf-doughnut-total-label">orders</div>
                        </div>
                    </div>
                </div>

                <div className="sf-card sf-whatif">
                    <h5>What-if: Marketing boost</h5>
                    <p>
                        Marketing boost:{' '}
                        <span className="sf-whatif-value">
                            {scenarioPercent >= 0 ? '+' : ''}{scenarioPercent}%
                        </span>
                    </p>
                    <input
                        type="range"
                        min={SCENARIO_MIN}
                        max={SCENARIO_MAX}
                        step={SCENARIO_STEP}
                        value={scenarioPercent}
                        onChange={handleScenarioChange}
                        aria-label="Marketing boost percentage"
                    />
                </div>

                <div className="sf-card">
                    <h5>Top 5 products</h5>
                    <table className="sf-products-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product</th>
                                <th>Units sold</th>
                                <th>Revenue</th>
                                <th>Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => {
                                const share = (product.revenue / topProductsRevenue) * 100;
                                return (
                                    <tr key={product.id}>
                                        <td>{MEDALS[index] || index + 1}</td>
                                        <td>{product.name}</td>
                                        <td>{product.unitsSold}</td>
                                        <td>${formatPrice(product.revenue)}</td>
                                        <td>
                                            <div className="sf-share-bar">
                                                <div className="sf-share-bar-fill" style={{width: `${share}%`}} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Layout>
            <Ftr />
        </div>
    );
};

export default SalesForecast;
