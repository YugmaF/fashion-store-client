// Pure helpers for the Sales Forecast page. No React, no fetch - all
// functions take plain data in and return plain data out, so they can be
// unit tested in isolation and reused once the data layer switches from
// `generateDummyOrders()` to the real `listOrders` API.

const KNOWN_CATEGORIES = ['Dresses', 'Shirts', 'Shoes', 'Accessories'];
const KNOWN_STATUSES = ['Delivered', 'Shipped', 'Processing', 'Cancelled'];

const monthKey = date => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
};

const isCancelled = order => `${order && order.status}`.toLowerCase() === 'cancelled';

const isValidOrder = order => {
    if (!order) {
        return false;
    }

    const amount = Number.parseFloat(order.amount);
    if (Number.isNaN(amount)) {
        return false;
    }

    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) {
        return false;
    }

    return !isCancelled(order);
};

// Groups revenue and order counts into the trailing `months` calendar
// months ending in `now`. Months with no orders show up with 0 revenue.
export const groupRevenueByMonth = (orders = [], now = new Date(), months = 12) => {
    const buckets = [];
    const index = {};

    for (let i = months - 1; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = monthKey(date);
        const bucket = {month: key, revenue: 0, orderCount: 0};
        buckets.push(bucket);
        index[key] = bucket;
    }

    (orders || []).forEach(order => {
        if (!isValidOrder(order)) {
            return;
        }

        const date = new Date(order.createdAt);
        const key = monthKey(date);
        const bucket = index[key];
        if (!bucket) {
            return;
        }

        bucket.revenue += Number.parseFloat(order.amount);
        bucket.orderCount += 1;
    });

    return buckets;
};

const linearRegression = series => {
    const n = series.length;
    const sumX = series.reduce((sum, _, x) => sum + x, 0);
    const sumY = series.reduce((sum, y) => sum + y, 0);
    const sumXY = series.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = series.reduce((sum, _, x) => sum + x * x, 0);

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) {
        return {slope: 0, intercept: sumY / n};
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    return {slope, intercept};
};

const extractRevenueSeries = monthly => (monthly || []).map(
    entry => (typeof entry === 'number' ? entry : Number(entry && entry.revenue) || 0)
);

// Least-squares linear trend forecast, clamped to non-negative revenue.
// Fewer than 2 data points simply repeats the last known value (0 when
// there is no data at all).
export const forecastRevenue = (monthly = [], periods = 3) => {
    const series = extractRevenueSeries(monthly);
    const n = series.length;

    if (n === 0) {
        return new Array(periods).fill(0);
    }

    if (n < 2) {
        return new Array(periods).fill(Math.max(0, series[n - 1]));
    }

    const {slope, intercept} = linearRegression(series);

    return new Array(periods).fill(0).map((_, offset) => {
        const x = n + offset;
        return Math.max(0, slope * x + intercept);
    });
};

// Upper/lower confidence band around each forecast point, using +/- 1
// standard deviation of the residuals from the historical trend line.
export const forecastBand = (monthly = [], forecast = []) => {
    const series = extractRevenueSeries(monthly);
    const n = series.length;

    let stdDev = 0;
    if (n >= 2) {
        const {slope, intercept} = linearRegression(series);
        const residuals = series.map((y, x) => y - (slope * x + intercept));
        const meanSquare = residuals.reduce((sum, r) => sum + r * r, 0) / n;
        stdDev = Math.sqrt(meanSquare);
    }

    return forecast.map(value => ({
        forecast: value,
        upper: value + stdDev,
        lower: Math.max(0, value - stdDev)
    }));
};

// Applies a what-if percentage adjustment (e.g. a marketing boost) to a
// forecast series or band. Numbers are scaled and clamped at 0; band
// objects have their forecast/upper/lower scaled together.
export const applyScenario = (forecast = [], percent = 0) => {
    const multiplier = 1 + Number(percent || 0) / 100;

    return forecast.map(value => {
        if (typeof value === 'number') {
            return Math.max(0, value * multiplier);
        }

        return {
            forecast: Math.max(0, value.forecast * multiplier),
            upper: Math.max(0, value.upper * multiplier),
            lower: Math.max(0, value.lower * multiplier)
        };
    });
};

// Total revenue per known category, in a fixed display order.
export const revenueByCategory = (orders = []) => {
    const totals = KNOWN_CATEGORIES.reduce((acc, category) => {
        acc[category] = 0;
        return acc;
    }, {});

    (orders || []).forEach(order => {
        if (!order || isCancelled(order) || !Array.isArray(order.products)) {
            return;
        }

        order.products.forEach(product => {
            if (!product || !(product.category in totals)) {
                return;
            }

            const price = Number.parseFloat(product.price);
            const count = Number.parseFloat(product.count);
            if (Number.isNaN(price) || Number.isNaN(count)) {
                return;
            }

            totals[product.category] += price * count;
        });
    });

    return KNOWN_CATEGORIES.map(category => ({category, revenue: totals[category]}));
};

// Order counts grouped by status, known statuses first in a fixed order,
// followed by any unrecognised statuses in the order encountered.
export const ordersByStatus = (orders = []) => {
    const counts = KNOWN_STATUSES.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
    }, {});
    const extra = [];

    (orders || []).forEach(order => {
        const status = order && order.status;
        if (!status) {
            return;
        }

        if (status in counts) {
            counts[status] += 1;
            return;
        }

        if (!extra.includes(status)) {
            extra.push(status);
            counts[status] = 0;
        }
        counts[status] += 1;
    });

    return [...KNOWN_STATUSES, ...extra].map(status => ({status, count: counts[status]}));
};

// Top `limit` products by revenue across all non-cancelled orders.
export const topProducts = (orders = [], limit = 5) => {
    const totals = {};

    (orders || []).forEach(order => {
        if (!order || isCancelled(order) || !Array.isArray(order.products)) {
            return;
        }

        order.products.forEach(product => {
            if (!product || !product._id) {
                return;
            }

            const price = Number.parseFloat(product.price);
            const count = Number.parseFloat(product.count);
            if (Number.isNaN(price) || Number.isNaN(count)) {
                return;
            }

            if (!totals[product._id]) {
                totals[product._id] = {id: product._id, name: product.name, revenue: 0, unitsSold: 0};
            }

            totals[product._id].revenue += price * count;
            totals[product._id].unitsSold += count;
        });
    });

    return Object.values(totals)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
};

// Percentage growth between two revenue figures. Returns null when
// `previous` is 0 (or falsy), since the percentage would be undefined.
export const growthPercent = (previous, current) => {
    const prev = Number(previous) || 0;
    if (prev === 0) {
        return null;
    }

    return ((Number(current) || 0) - prev) / prev * 100;
};
