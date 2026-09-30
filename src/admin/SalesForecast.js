import React, {useMemo} from "react";
import {Line, Doughnut} from "react-chartjs-2";
import Layout from "../core/Layout";
import Ftr from "../core/Ftr";
import {
    generateDummyOrders,
    groupRevenueByMonth,
    forecastRevenue,
    revenueByCategory,
    growthPercent
} from "./salesForecast";
import {formatPrice} from "../core/pricing";
import "./SalesForecast.css";

const CATEGORY_COLORS = ['#ee7752', '#e73c7e', '#23a6d5', '#23d5ab'];

const buildLineData = (monthly, forecast) => {
    const actualPoints = monthly.map(point => point.revenue);
    const bridgeCount = Math.max(0, monthly.length - 1);
    const lastActual = monthly.length > 0 ? monthly[monthly.length - 1].revenue : null;
    const forecastPoints = [...Array(bridgeCount).fill(null), lastActual, ...forecast.map(point => point.revenue)];

    return {
        labels: [...monthly.map(point => point.month), ...forecast.map(point => point.month)],
        datasets: [
            {
                label: 'Actual revenue',
                data: [...actualPoints, ...Array(forecast.length).fill(null)],
                borderColor: '#e73c7e',
                backgroundColor: 'rgba(231, 60, 126, 0.15)',
                fill: true,
                tension: 0.3
            },
            {
                label: 'Forecast',
                data: forecastPoints,
                borderColor: '#23a6d5',
                borderDash: [6, 6],
                fill: false,
                tension: 0.3
            }
        ]
    };
};

const buildDoughnutData = categories => ({
    labels: categories.map(item => item.category),
    datasets: [{
        data: categories.map(item => item.revenue),
        backgroundColor: CATEGORY_COLORS
    }]
});

const SalesForecast = () => {
    const {monthly, forecast, categories, revenueThisMonth, forecastNextMonth, growth} = useMemo(() => {
        const now = new Date();
        const orders = generateDummyOrders(now, 12);
        const monthlyRevenue = groupRevenueByMonth(orders, now, 12);
        const forecastMonths = forecastRevenue(monthlyRevenue, 3);
        const categoryRevenue = revenueByCategory(orders);

        const currentMonthRevenue = monthlyRevenue.length > 0
            ? monthlyRevenue[monthlyRevenue.length - 1].revenue : 0;
        const previousMonthRevenue = monthlyRevenue.length > 1
            ? monthlyRevenue[monthlyRevenue.length - 2].revenue : 0;
        const nextMonthForecast = forecastMonths.length > 0 ? forecastMonths[0].revenue : 0;

        return {
            monthly: monthlyRevenue,
            forecast: forecastMonths,
            categories: categoryRevenue,
            revenueThisMonth: currentMonthRevenue,
            forecastNextMonth: nextMonthForecast,
            growth: growthPercent(previousMonthRevenue, currentMonthRevenue)
        };
    }, []);

    const lineData = useMemo(() => buildLineData(monthly, forecast), [monthly, forecast]);
    const doughnutData = useMemo(() => buildDoughnutData(categories), [categories]);

    const growthKnown = growth !== null;
    const growthIsUp = growthKnown && growth >= 0;
    const growthLabel = growthKnown ? `${growthIsUp ? '▲' : '▼'} ${Math.abs(growth)}%` : 'N/A';
    const growthClass = growthKnown ? (growthIsUp ? 'sf-growth-up' : 'sf-growth-down') : '';

    return (
        <div>
            <Layout back={true} backText="Back to dashboard" to="/admin/dashboard" title="Sales Forecast"
                    className="container-fluid">
                <div className="sf-hero">
                    <h1 className="sf-hero-title">Sales Forecast</h1>
                    <span className="sf-badge">Sample data</span>
                </div>

                <div className="sf-cards">
                    <div className="sf-card">
                        <h6 className="sf-card-label">Revenue this month</h6>
                        <p className="sf-card-value">${formatPrice(revenueThisMonth)}</p>
                    </div>
                    <div className="sf-card">
                        <h6 className="sf-card-label">Forecast next month</h6>
                        <p className="sf-card-value">${formatPrice(forecastNextMonth)}</p>
                    </div>
                    <div className="sf-card">
                        <h6 className="sf-card-label">Growth vs last month</h6>
                        <p className={`sf-card-value ${growthClass}`}>{growthLabel}</p>
                    </div>
                </div>

                <div className="sf-charts">
                    <div className="sf-chart-card">
                        <h5 className="sf-chart-title">Revenue trend &amp; forecast</h5>
                        <Line data={lineData}/>
                    </div>
                    <div className="sf-chart-card">
                        <h5 className="sf-chart-title">Revenue by category</h5>
                        <Doughnut data={doughnutData}/>
                    </div>
                </div>
            </Layout>
            <Ftr/>
        </div>
    );
};

export default SalesForecast;
