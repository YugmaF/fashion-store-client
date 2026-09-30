// Pure analytics functions — no React, no fetch.
// Inject `now` so callers (and tests) control the reference date.
// Style mirrors src/core/pricing.js: named exports, no side-effects.

const toYYYYMM = d =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

// Shared OLS helper — returns slope (b) and intercept (a) for a numeric series.
function ols(values) {
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((acc, v) => acc + v, 0) / n;
    const ssXX = values.reduce((acc, _, i) => acc + (i - xMean) ** 2, 0);
    const ssXY = values.reduce((acc, v, i) => acc + (i - xMean) * (v - yMean), 0);
    const b = ssXX === 0 ? 0 : ssXY / ssXX;
    return { a: yMean - b * xMean, b };
}

/**
 * Groups non-cancelled orders with valid dates and positive amounts into
 * monthly revenue buckets for the `months` calendar months ending at `now`.
 * Months with no matching orders are included with revenue = 0, orderCount = 0.
 *
 * @returns {Array<{month: string, revenue: number, orderCount: number}>}
 */
export const groupRevenueByMonth = (orders, now = new Date(), months = 12) => {
    const buckets = {};
    for (let m = 0; m < months; m++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - m), 1);
        const key = toYYYYMM(d);
        buckets[key] = { month: key, revenue: 0, orderCount: 0 };
    }

    for (const order of orders) {
        if (order.status === 'Cancelled') continue;

        const ts = new Date(order.createdAt).getTime();
        if (Number.isNaN(ts)) continue;

        const amt = Number(order.amount);
        if (Number.isNaN(amt) || amt <= 0) continue;

        const key = toYYYYMM(new Date(order.createdAt));
        if (buckets[key]) {
            buckets[key].revenue += amt;
            buckets[key].orderCount += 1;
        }
    }

    return Object.values(buckets).sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Projects `periods` future months using an OLS linear trend fitted to the
 * monthly revenue series.  Results are clamped to ≥ 0.
 * Edge cases: 0 points → all zeros; 1 point → repeat that value.
 */
export const forecastRevenue = (monthly, periods = 3) => {
    if (monthly.length === 0) return Array(periods).fill(0);
    if (monthly.length === 1) return Array(periods).fill(monthly[0].revenue);

    const revenues = monthly.map(m => m.revenue);
    const { a, b } = ols(revenues);
    const n = revenues.length;
    return Array.from({ length: periods }, (_, i) =>
        Math.max(0, a + b * (n + i))
    );
};

/**
 * Confidence band: forecast ± 1 standard deviation of in-sample residuals.
 * Lower bound clamped to ≥ 0.
 *
 * @returns {Array<{upper: number, lower: number}>}
 */
export const forecastBand = (monthly, forecast) => {
    if (monthly.length < 2) {
        return forecast.map(v => ({ upper: v, lower: Math.max(0, v) }));
    }

    const revenues = monthly.map(m => m.revenue);
    const { a, b } = ols(revenues);
    const residuals = revenues.map((v, i) => v - (a + b * i));
    const meanR = residuals.reduce((acc, r) => acc + r, 0) / residuals.length;
    const variance =
        residuals.reduce((acc, r) => acc + (r - meanR) ** 2, 0) / residuals.length;
    const stdDev = Math.sqrt(variance);

    return forecast.map(v => ({
        upper: v + stdDev,
        lower: Math.max(0, v - stdDev),
    }));
};

/**
 * Scales every forecast point by (1 + percent/100).  Result clamped to ≥ 0.
 * `percent` is the slider value, e.g. -20 or +50.
 */
export const applyScenario = (forecast, percent) =>
    forecast.map(v => Math.max(0, v * (1 + percent / 100)));

/**
 * Aggregates revenue per product category, excluding cancelled orders.
 * @returns {Array<{category: string, revenue: number}>}  sorted desc by revenue
 */
export const revenueByCategory = orders => {
    const acc = {};
    for (const order of orders) {
        if (order.status === 'Cancelled') continue;
        for (const p of order.products) {
            const cat = p.category || 'Unknown';
            if (!acc[cat]) acc[cat] = { category: cat, revenue: 0 };
            acc[cat].revenue += (Number(p.price) || 0) * (Number(p.count) || 0);
        }
    }
    return Object.values(acc).sort((a, b) => b.revenue - a.revenue);
};

/**
 * Counts orders per status (all statuses, not filtered).
 * @returns {Array<{status: string, count: number}>}  sorted desc by count
 */
export const ordersByStatus = orders => {
    const acc = {};
    for (const order of orders) {
        const s = order.status || 'Unknown';
        if (!acc[s]) acc[s] = { status: s, count: 0 };
        acc[s].count += 1;
    }
    return Object.values(acc).sort((a, b) => b.count - a.count);
};

/**
 * Aggregates the top `limit` products by revenue, excluding cancelled orders.
 * @returns {Array<{id, name, revenue, unitsSold}>}
 */
export const topProducts = (orders, limit = 5) => {
    const agg = {};
    for (const order of orders) {
        if (order.status === 'Cancelled') continue;
        for (const p of order.products) {
            const id = p._id;
            if (!agg[id]) agg[id] = { id, name: p.name, revenue: 0, unitsSold: 0 };
            agg[id].revenue   += (Number(p.price) || 0) * (Number(p.count) || 0);
            agg[id].unitsSold += Number(p.count) || 0;
        }
    }
    return Object.values(agg)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
};

/**
 * Month-over-month growth percentage.
 * Returns null when `previous` is 0 (avoids division by zero).
 */
export const growthPercent = (previous, current) => {
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
};
