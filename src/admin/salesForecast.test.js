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

const NOW = new Date('2026-09-30T00:00:00.000Z');

const order = (overrides = {}) => ({
    _id: 'o1',
    amount: 100,
    createdAt: '2026-09-15T00:00:00.000Z',
    status: 'Delivered',
    products: [{_id: 'p1', name: 'Widget', category: 'Dresses', price: 100, count: 1}],
    ...overrides
});

describe('groupRevenueByMonth', () => {
    test('returns 0-filled months for empty input', () => {
        const result = groupRevenueByMonth([], NOW, 3);

        expect(result).toEqual([
            {month: '2026-07', revenue: 0, orderCount: 0},
            {month: '2026-08', revenue: 0, orderCount: 0},
            {month: '2026-09', revenue: 0, orderCount: 0}
        ]);
    });

    test('sums revenue per month and fills gaps with 0', () => {
        const orders = [
            order({amount: 100, createdAt: '2026-09-01T00:00:00.000Z'}),
            order({amount: 50, createdAt: '2026-09-20T00:00:00.000Z'}),
            order({amount: 30, createdAt: '2026-07-01T00:00:00.000Z'})
        ];

        const result = groupRevenueByMonth(orders, NOW, 3);

        expect(result).toEqual([
            {month: '2026-07', revenue: 30, orderCount: 1},
            {month: '2026-08', revenue: 0, orderCount: 0},
            {month: '2026-09', revenue: 150, orderCount: 2}
        ]);
    });

    test('skips cancelled orders', () => {
        const orders = [order({status: 'Cancelled', amount: 999})];
        const result = groupRevenueByMonth(orders, NOW, 1);

        expect(result).toEqual([{month: '2026-09', revenue: 0, orderCount: 0}]);
    });

    test('skips orders with invalid dates or amounts', () => {
        const orders = [
            order({createdAt: 'not-a-date'}),
            order({amount: 'not-a-number'}),
            order({amount: undefined})
        ];

        const result = groupRevenueByMonth(orders, NOW, 1);

        expect(result).toEqual([{month: '2026-09', revenue: 0, orderCount: 0}]);
    });

    test('handles the december to january year boundary', () => {
        const january = new Date('2026-01-15T00:00:00.000Z');
        const orders = [order({amount: 40, createdAt: '2025-12-15T00:00:00.000Z'})];

        const result = groupRevenueByMonth(orders, january, 2);

        expect(result).toEqual([
            {month: '2025-12', revenue: 40, orderCount: 1},
            {month: '2026-01', revenue: 0, orderCount: 0}
        ]);
    });
});

describe('forecastRevenue', () => {
    test('returns zeros for empty input', () => {
        expect(forecastRevenue([], 3)).toEqual([0, 0, 0]);
    });

    test('repeats the last value when fewer than 2 points', () => {
        const monthly = [{month: '2026-09', revenue: 200, orderCount: 1}];
        expect(forecastRevenue(monthly, 2)).toEqual([200, 200]);
    });

    test('projects a positive linear trend forward', () => {
        const monthly = [100, 200, 300].map((revenue, i) => ({month: `m${i}`, revenue, orderCount: 1}));
        const forecast = forecastRevenue(monthly, 2);

        expect(forecast[0]).toBeCloseTo(400);
        expect(forecast[1]).toBeCloseTo(500);
    });

    test('clamps a negative trend at 0', () => {
        const monthly = [300, 200, 100].map((revenue, i) => ({month: `m${i}`, revenue, orderCount: 1}));
        const forecast = forecastRevenue(monthly, 5);

        forecast.forEach(value => expect(value).toBeGreaterThanOrEqual(0));
        expect(forecast[4]).toBe(0);
    });
});

describe('forecastBand', () => {
    test('band collapses to the forecast value when there is no variance', () => {
        const monthly = [100, 100, 100].map((revenue, i) => ({month: `m${i}`, revenue, orderCount: 1}));
        const forecast = forecastRevenue(monthly, 1);
        const [band] = forecastBand(monthly, forecast);

        expect(band.upper).toBeCloseTo(band.forecast);
        expect(band.lower).toBeCloseTo(band.forecast);
    });

    test('band widens around residual noise', () => {
        const monthly = [100, 180, 90, 210].map((revenue, i) => ({month: `m${i}`, revenue, orderCount: 1}));
        const forecast = forecastRevenue(monthly, 1);
        const [band] = forecastBand(monthly, forecast);

        expect(band.upper).toBeGreaterThan(band.forecast);
        expect(band.lower).toBeLessThan(band.forecast);
    });

    test('lower bound never goes negative', () => {
        const monthly = [5, 400, 5, 400].map((revenue, i) => ({month: `m${i}`, revenue, orderCount: 1}));
        const forecast = forecastRevenue(monthly, 1);
        const [band] = forecastBand(monthly, forecast);

        expect(band.lower).toBeGreaterThanOrEqual(0);
    });
});

describe('applyScenario', () => {
    test('scales numeric forecast values up and down', () => {
        expect(applyScenario([100, 200], 50)).toEqual([150, 300]);
        expect(applyScenario([100, 200], -20)).toEqual([80, 160]);
    });

    test('scales band objects together', () => {
        const bands = [{forecast: 100, upper: 120, lower: 80}];
        const [scaled] = applyScenario(bands, 10);

        expect(scaled.forecast).toBeCloseTo(110);
        expect(scaled.upper).toBeCloseTo(132);
        expect(scaled.lower).toBeCloseTo(88);
    });

    test('clamps scaled values at 0', () => {
        expect(applyScenario([50], -100)).toEqual([0]);
    });
});

describe('revenueByCategory', () => {
    test('sums revenue for each known category', () => {
        const orders = [
            order({products: [{_id: 'p1', category: 'Dresses', price: 50, count: 2}]}),
            order({products: [{_id: 'p2', category: 'Shoes', price: 60, count: 1}]})
        ];

        expect(revenueByCategory(orders)).toEqual([
            {category: 'Dresses', revenue: 100},
            {category: 'Shirts', revenue: 0},
            {category: 'Shoes', revenue: 60},
            {category: 'Accessories', revenue: 0}
        ]);
    });

    test('ignores cancelled orders and returns 0s for empty input', () => {
        const orders = [order({status: 'Cancelled', products: [{_id: 'p1', category: 'Dresses', price: 50, count: 2}]})];

        expect(revenueByCategory(orders)).toEqual([
            {category: 'Dresses', revenue: 0},
            {category: 'Shirts', revenue: 0},
            {category: 'Shoes', revenue: 0},
            {category: 'Accessories', revenue: 0}
        ]);
        expect(revenueByCategory([])).toEqual([
            {category: 'Dresses', revenue: 0},
            {category: 'Shirts', revenue: 0},
            {category: 'Shoes', revenue: 0},
            {category: 'Accessories', revenue: 0}
        ]);
    });
});

describe('ordersByStatus', () => {
    test('counts known statuses in a fixed order', () => {
        const orders = [
            order({status: 'Delivered'}),
            order({status: 'Delivered'}),
            order({status: 'Shipped'}),
            order({status: 'Cancelled'})
        ];

        expect(ordersByStatus(orders)).toEqual([
            {status: 'Delivered', count: 2},
            {status: 'Shipped', count: 1},
            {status: 'Processing', count: 0},
            {status: 'Cancelled', count: 1}
        ]);
    });

    test('returns 0 counts for empty input', () => {
        expect(ordersByStatus([])).toEqual([
            {status: 'Delivered', count: 0},
            {status: 'Shipped', count: 0},
            {status: 'Processing', count: 0},
            {status: 'Cancelled', count: 0}
        ]);
    });
});

describe('topProducts', () => {
    test('ranks products by revenue, limited to 5', () => {
        const orders = [1, 2, 3, 4, 5, 6].map(i => order({
            products: [{_id: `p${i}`, name: `Product ${i}`, price: 10 * i, count: 1}]
        }));

        const result = topProducts(orders, 5);

        expect(result).toHaveLength(5);
        expect(result[0]).toEqual({id: 'p6', name: 'Product 6', revenue: 60, unitsSold: 1});
        expect(result.map(p => p.id)).not.toContain('p1');
    });

    test('ignores cancelled orders and returns empty array for empty input', () => {
        const orders = [order({status: 'Cancelled', products: [{_id: 'p1', name: 'X', price: 10, count: 1}]})];

        expect(topProducts(orders)).toEqual([]);
        expect(topProducts([])).toEqual([]);
    });

    test('aggregates units sold and revenue across multiple orders', () => {
        const orders = [
            order({products: [{_id: 'p1', name: 'X', price: 10, count: 2}]}),
            order({products: [{_id: 'p1', name: 'X', price: 10, count: 3}]})
        ];

        expect(topProducts(orders)).toEqual([{id: 'p1', name: 'X', revenue: 50, unitsSold: 5}]);
    });
});

describe('growthPercent', () => {
    test('returns null when previous is 0', () => {
        expect(growthPercent(0, 100)).toBeNull();
    });

    test('computes a positive and negative percentage change', () => {
        expect(growthPercent(100, 120)).toBeCloseTo(20);
        expect(growthPercent(100, 80)).toBeCloseTo(-20);
    });
});
