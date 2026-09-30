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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeOrder = (overrides = {}) => ({
    _id: 'o1',
    amount: 100,
    createdAt: '2026-09-15T10:00:00.000Z',
    status: 'Delivered',
    products: [{ _id: 'p1', name: 'Widget', category: 'Gadgets', price: 50, count: 2 }],
    ...overrides,
});

const NOW = new Date('2026-09-30T12:00:00.000Z');

// ─── groupRevenueByMonth ──────────────────────────────────────────────────────

describe('groupRevenueByMonth', () => {
    test('returns 12 bucket entries, oldest first', () => {
        const result = groupRevenueByMonth([], NOW);
        expect(result).toHaveLength(12);
        expect(result[0].month).toBe('2025-10');
        expect(result[11].month).toBe('2026-09');
    });

    test('sums revenue for non-cancelled orders in the window', () => {
        const orders = [
            makeOrder({ amount: 200, createdAt: '2026-09-10T00:00:00.000Z' }),
            makeOrder({ amount: 150, createdAt: '2026-09-20T00:00:00.000Z' }),
        ];
        const result = groupRevenueByMonth(orders, NOW);
        const sep = result.find(m => m.month === '2026-09');
        expect(sep.revenue).toBe(350);
        expect(sep.orderCount).toBe(2);
    });

    test('skips Cancelled orders', () => {
        const orders = [
            makeOrder({ amount: 500, status: 'Cancelled', createdAt: '2026-09-05T00:00:00.000Z' }),
        ];
        const result = groupRevenueByMonth(orders, NOW);
        const sep = result.find(m => m.month === '2026-09');
        expect(sep.revenue).toBe(0);
        expect(sep.orderCount).toBe(0);
    });

    test('skips orders with invalid dates', () => {
        const orders = [makeOrder({ createdAt: 'not-a-date' })];
        const result = groupRevenueByMonth(orders, NOW);
        expect(result.every(m => m.revenue === 0)).toBe(true);
    });

    test('skips orders with zero or negative amount', () => {
        const orders = [
            makeOrder({ amount: 0 }),
            makeOrder({ amount: -10 }),
        ];
        const result = groupRevenueByMonth(orders, NOW);
        expect(result.every(m => m.revenue === 0)).toBe(true);
    });

    test('skips orders outside the 12-month window', () => {
        // 13 months ago — should be outside the window
        const orders = [makeOrder({ createdAt: '2024-08-01T00:00:00.000Z' })];
        const result = groupRevenueByMonth(orders, NOW);
        expect(result.every(m => m.revenue === 0)).toBe(true);
    });

    test('months with no orders show revenue = 0', () => {
        const orders = [makeOrder({ createdAt: '2026-09-15T00:00:00.000Z' })];
        const result = groupRevenueByMonth(orders, NOW);
        result.filter(m => m.month !== '2026-09').forEach(m => {
            expect(m.revenue).toBe(0);
        });
    });

    test('empty order list produces all-zero buckets', () => {
        const result = groupRevenueByMonth([], NOW);
        result.forEach(m => {
            expect(m.revenue).toBe(0);
            expect(m.orderCount).toBe(0);
        });
    });

    test('uses current date when now is not provided (default-parameter branch)', () => {
        // Covers the `now = new Date()` default parameter branch in groupRevenueByMonth.
        const result = groupRevenueByMonth([]);
        expect(result).toHaveLength(12);
    });

    test('handles Dec → Jan boundary', () => {
        const nowJan = new Date('2026-01-31T00:00:00.000Z');
        const result = groupRevenueByMonth([], nowJan);
        const months = result.map(m => m.month);
        expect(months).toContain('2025-12');
        expect(months).toContain('2026-01');
        expect(months).toHaveLength(12);
    });
});

// ─── forecastRevenue ──────────────────────────────────────────────────────────

describe('forecastRevenue', () => {
    test('returns 3 zeros for empty input', () => {
        expect(forecastRevenue([])).toEqual([0, 0, 0]);
    });

    test('returns 3 copies of the single value when n = 1', () => {
        const monthly = [{ month: '2026-09', revenue: 400, orderCount: 5 }];
        expect(forecastRevenue(monthly)).toEqual([400, 400, 400]);
    });

    test('projects a rising trend upward', () => {
        const monthly = [100, 200, 300, 400].map((v, i) => ({
            month: `2026-0${i + 1}`,
            revenue: v,
            orderCount: 1,
        }));
        const result = forecastRevenue(monthly);
        // Linear fit on [100,200,300,400] → slope 100, so forecasts ≈ 500, 600, 700
        expect(result[0]).toBeCloseTo(500, 0);
        expect(result[1]).toBeCloseTo(600, 0);
        expect(result[2]).toBeCloseTo(700, 0);
    });

    test('clamps negative forecasts to 0', () => {
        // Strongly declining trend
        const monthly = [1000, 500, 100].map((v, i) => ({
            month: `2026-0${i + 1}`,
            revenue: v,
            orderCount: 1,
        }));
        const result = forecastRevenue(monthly);
        result.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
    });

    test('flat series forecasts the same value', () => {
        const monthly = [300, 300, 300].map((v, i) => ({
            month: `2026-0${i + 1}`,
            revenue: v,
            orderCount: 1,
        }));
        const result = forecastRevenue(monthly);
        result.forEach(v => expect(v).toBeCloseTo(300, 1));
    });

    test('respects custom periods parameter', () => {
        const monthly = [100, 200].map((v, i) => ({
            month: `2026-0${i + 1}`,
            revenue: v,
            orderCount: 1,
        }));
        expect(forecastRevenue(monthly, 5)).toHaveLength(5);
    });
});

// ─── forecastBand ─────────────────────────────────────────────────────────────

describe('forecastBand', () => {
    const makeForecast = vals => vals;

    test('upper ≥ lower for every point', () => {
        const monthly = [100, 150, 120, 180, 200, 170].map((v, i) => ({
            month: `2026-0${i + 1}`,
            revenue: v,
            orderCount: 1,
        }));
        const fc = forecastRevenue(monthly);
        const band = forecastBand(monthly, fc);
        band.forEach(({ upper, lower }) => {
            expect(upper).toBeGreaterThanOrEqual(lower);
        });
    });

    test('lower is always ≥ 0', () => {
        const monthly = [10, 5, 1].map((v, i) => ({
            month: `2026-0${i + 1}`,
            revenue: v,
            orderCount: 1,
        }));
        const fc = forecastRevenue(monthly);
        const band = forecastBand(monthly, fc);
        band.forEach(({ lower }) => expect(lower).toBeGreaterThanOrEqual(0));
    });

    test('band has the same length as forecast', () => {
        const monthly = [100, 200, 300].map((v, i) => ({
            month: `2026-0${i + 1}`,
            revenue: v,
            orderCount: 1,
        }));
        const fc = forecastRevenue(monthly, 4);
        const band = forecastBand(monthly, fc);
        expect(band).toHaveLength(4);
    });

    test('returns zero-width band when n < 2', () => {
        const monthly = [{ month: '2026-09', revenue: 500, orderCount: 5 }];
        const fc = [500, 500, 500];
        const band = forecastBand(monthly, fc);
        band.forEach(({ upper, lower }) => {
            expect(upper).toBe(lower);
        });
    });

    test('perfect-fit series produces a zero-width band', () => {
        // y = 100x gives 0 residuals
        const monthly = [0, 100, 200, 300].map((v, i) => ({
            month: `2026-0${i + 1}`,
            revenue: v,
            orderCount: 1,
        }));
        const fc = forecastRevenue(monthly);
        const band = forecastBand(monthly, fc);
        band.forEach(({ upper, lower }) => {
            expect(upper - lower).toBeCloseTo(0, 5);
        });
    });
});

// ─── applyScenario ────────────────────────────────────────────────────────────

describe('applyScenario', () => {
    test('percent = 0 returns identical values', () => {
        const fc = [100, 200, 300];
        expect(applyScenario(fc, 0)).toEqual([100, 200, 300]);
    });

    test('percent = 50 scales values by 1.5', () => {
        expect(applyScenario([200, 400], 50)).toEqual([300, 600]);
    });

    test('percent = -20 scales values by 0.8', () => {
        const result = applyScenario([500], -20);
        expect(result[0]).toBeCloseTo(400, 5);
    });

    test('clamps results to 0 (no negative revenue)', () => {
        expect(applyScenario([100], -200)).toEqual([0]);
    });

    test('handles empty array', () => {
        expect(applyScenario([], 50)).toEqual([]);
    });
});

// ─── revenueByCategory ────────────────────────────────────────────────────────

describe('revenueByCategory', () => {
    test('sums revenue correctly per category', () => {
        const orders = [
            makeOrder({
                status: 'Delivered',
                products: [{ _id: 'p1', name: 'A', category: 'Dresses', price: 50, count: 2 }],
            }),
            makeOrder({
                status: 'Delivered',
                products: [{ _id: 'p2', name: 'B', category: 'Shoes', price: 80, count: 1 }],
            }),
        ];
        const result = revenueByCategory(orders);
        const dresses = result.find(r => r.category === 'Dresses');
        const shoes   = result.find(r => r.category === 'Shoes');
        expect(dresses.revenue).toBe(100);
        expect(shoes.revenue).toBe(80);
    });

    test('excludes cancelled orders', () => {
        const orders = [
            makeOrder({
                status: 'Cancelled',
                products: [{ _id: 'p1', name: 'A', category: 'Dresses', price: 200, count: 1 }],
            }),
        ];
        expect(revenueByCategory(orders)).toHaveLength(0);
    });

    test('returns results sorted by revenue descending', () => {
        const orders = [
            makeOrder({
                products: [{ _id: 'p1', name: 'A', category: 'Low', price: 10, count: 1 }],
            }),
            makeOrder({
                products: [{ _id: 'p2', name: 'B', category: 'High', price: 500, count: 1 }],
            }),
        ];
        const result = revenueByCategory(orders);
        expect(result[0].category).toBe('High');
    });

    test('returns empty array for empty orders', () => {
        expect(revenueByCategory([])).toEqual([]);
    });

    test('treats NaN price or count as 0 (defensive || 0 branch)', () => {
        const orders = [
            makeOrder({
                products: [
                    { _id: 'p1', name: 'A', category: 'X', price: NaN, count: 1 },
                    { _id: 'p2', name: 'B', category: 'X', price: 10, count: NaN },
                ],
            }),
        ];
        const result = revenueByCategory(orders);
        const cat = result.find(r => r.category === 'X');
        expect(cat.revenue).toBe(0);
    });

    test('uses "Unknown" for products without a category (|| branch)', () => {
        const orders = [
            makeOrder({
                products: [{ _id: 'p1', name: 'A', category: undefined, price: 20, count: 1 }],
            }),
        ];
        const result = revenueByCategory(orders);
        const unknown = result.find(r => r.category === 'Unknown');
        expect(unknown).toBeDefined();
        expect(unknown.revenue).toBe(20);
    });
});

// ─── ordersByStatus ───────────────────────────────────────────────────────────

describe('ordersByStatus', () => {
    test('counts every order by status', () => {
        const orders = [
            makeOrder({ status: 'Delivered' }),
            makeOrder({ status: 'Delivered' }),
            makeOrder({ status: 'Cancelled' }),
        ];
        const result = ordersByStatus(orders);
        const delivered = result.find(r => r.status === 'Delivered');
        const cancelled = result.find(r => r.status === 'Cancelled');
        expect(delivered.count).toBe(2);
        expect(cancelled.count).toBe(1);
    });

    test('returns empty array for empty orders', () => {
        expect(ordersByStatus([])).toEqual([]);
    });

    test('uses "Unknown" for orders with no status (|| branch)', () => {
        const orders = [{ _id: 'o1', amount: 10, createdAt: '', status: undefined, products: [] }];
        const result = ordersByStatus(orders);
        expect(result.find(r => r.status === 'Unknown').count).toBe(1);
    });

    test('sorts by count descending', () => {
        const orders = [
            makeOrder({ status: 'Cancelled' }),
            makeOrder({ status: 'Delivered' }),
            makeOrder({ status: 'Delivered' }),
        ];
        const result = ordersByStatus(orders);
        expect(result[0].status).toBe('Delivered');
    });
});

// ─── topProducts ──────────────────────────────────────────────────────────────

describe('topProducts', () => {
    test('aggregates revenue and units across orders', () => {
        const orders = [
            makeOrder({
                products: [{ _id: 'p1', name: 'A', category: 'X', price: 100, count: 2 }],
            }),
            makeOrder({
                products: [{ _id: 'p1', name: 'A', category: 'X', price: 100, count: 3 }],
            }),
        ];
        const result = topProducts(orders);
        expect(result[0].id).toBe('p1');
        expect(result[0].revenue).toBe(500);
        expect(result[0].unitsSold).toBe(5);
    });

    test('excludes cancelled orders', () => {
        const orders = [
            makeOrder({
                status: 'Cancelled',
                products: [{ _id: 'p99', name: 'Z', category: 'X', price: 999, count: 1 }],
            }),
        ];
        expect(topProducts(orders)).toHaveLength(0);
    });

    test('returns at most `limit` products sorted by revenue', () => {
        const orders = Array.from({ length: 10 }, (_, i) => ({
            _id: `o${i}`,
            amount: 10,
            createdAt: '2026-09-01T00:00:00.000Z',
            status: 'Delivered',
            products: [{ _id: `p${i}`, name: `P${i}`, category: 'X', price: i + 1, count: 1 }],
        }));
        const result = topProducts(orders, 5);
        expect(result).toHaveLength(5);
        // Revenue descending: p9 ($10) first
        expect(result[0].revenue).toBeGreaterThan(result[1].revenue);
    });

    test('returns empty array for empty orders', () => {
        expect(topProducts([])).toEqual([]);
    });

    test('treats NaN price/count as 0 in revenue and unitsSold (|| 0 branch)', () => {
        // NaN price AND NaN count → both || 0 branches taken on lines 144 & 145.
        const orders = [
            makeOrder({
                products: [
                    { _id: 'p1', name: 'A', category: 'X', price: NaN, count: NaN },
                ],
            }),
        ];
        const result = topProducts(orders);
        expect(result[0].revenue).toBe(0);
        expect(result[0].unitsSold).toBe(0);
    });
});

// ─── growthPercent ────────────────────────────────────────────────────────────

describe('growthPercent', () => {
    test('returns null when previous is 0', () => {
        expect(growthPercent(0, 100)).toBeNull();
        expect(growthPercent(0, 0)).toBeNull();
    });

    test('computes positive growth correctly', () => {
        expect(growthPercent(100, 112)).toBeCloseTo(12, 5);
    });

    test('computes negative growth correctly', () => {
        expect(growthPercent(200, 150)).toBeCloseTo(-25, 5);
    });

    test('returns 0 when current equals previous', () => {
        expect(growthPercent(300, 300)).toBe(0);
    });

    test('returns -100 when current drops to 0', () => {
        expect(growthPercent(500, 0)).toBeCloseTo(-100, 5);
    });
});
