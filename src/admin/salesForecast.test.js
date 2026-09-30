import {
    generateDummyOrders,
    groupRevenueByMonth,
    forecastRevenue,
    revenueByCategory,
    growthPercent
} from './salesForecast';

const now = new Date('2026-09-25T12:00:00.000Z');

describe('generateDummyOrders', () => {
    test('is deterministic for the same inputs', () => {
        expect(generateDummyOrders(now, 12)).toEqual(generateDummyOrders(now, 12));
    });

    test('generates around 100 orders shaped like the real order API', () => {
        const orders = generateDummyOrders(now, 12);

        expect(orders.length).toBeGreaterThanOrEqual(90);
        expect(orders.length).toBeLessThanOrEqual(110);

        orders.forEach(order => {
            expect(order).toHaveProperty('_id');
            expect(typeof order.amount).toBe('number');
            expect(Number.isNaN(new Date(order.createdAt).getTime())).toBe(false);
            expect(['Received', 'Cancelled']).toContain(order.status);
            expect(Array.isArray(order.products)).toBe(true);

            order.products.forEach(product => {
                expect(product).toHaveProperty('name');
                expect(['Dresses', 'Shirts', 'Shoes', 'Accessories']).toContain(product.category);
                expect(typeof product.price).toBe('number');
                expect(typeof product.count).toBe('number');
            });
        });
    });

    test('has a small share of cancelled orders', () => {
        const orders = generateDummyOrders(now, 12);
        const cancelled = orders.filter(order => order.status === 'Cancelled');

        expect(cancelled.length).toBeGreaterThan(0);
        expect(cancelled.length / orders.length).toBeLessThan(0.2);
    });

    test('keeps every generated order inside the requested month window', () => {
        const orders = generateDummyOrders(now, 3);
        const earliest = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 2, 1));

        orders.forEach(order => {
            expect(new Date(order.createdAt).getTime()).toBeGreaterThanOrEqual(earliest.getTime());
        });
    });
});

describe('groupRevenueByMonth', () => {
    test('returns 0 revenue per month for empty input', () => {
        const result = groupRevenueByMonth([], now, 3);

        expect(result).toEqual([
            {month: '2026-07', revenue: 0},
            {month: '2026-08', revenue: 0},
            {month: '2026-09', revenue: 0}
        ]);
    });

    test('sums revenue for orders within range and skips gaps', () => {
        const orders = [
            {amount: 100, createdAt: '2026-09-01T00:00:00.000Z', status: 'Received'},
            {amount: 50, createdAt: '2026-09-15T00:00:00.000Z', status: 'Received'}
        ];

        const result = groupRevenueByMonth(orders, now, 3);

        expect(result).toEqual([
            {month: '2026-07', revenue: 0},
            {month: '2026-08', revenue: 0},
            {month: '2026-09', revenue: 150}
        ]);
    });

    test('skips cancelled and invalid orders', () => {
        const orders = [
            {amount: 100, createdAt: '2026-09-01T00:00:00.000Z', status: 'Cancelled'},
            {amount: 100, createdAt: 'not-a-date', status: 'Received'},
            {amount: 'oops', createdAt: '2026-09-05T00:00:00.000Z', status: 'Received'},
            null
        ];

        const result = groupRevenueByMonth(orders, now, 1);

        expect(result).toEqual([{month: '2026-09', revenue: 0}]);
    });

    test('ignores orders outside the requested window', () => {
        const orders = [
            {amount: 999, createdAt: '2020-01-01T00:00:00.000Z', status: 'Received'}
        ];

        const result = groupRevenueByMonth(orders, now, 1);

        expect(result).toEqual([{month: '2026-09', revenue: 0}]);
    });
});

describe('forecastRevenue', () => {
    test('returns 0 for every period when there is no history', () => {
        expect(forecastRevenue([], 3)).toEqual([
            {month: expect.any(String), revenue: 0},
            {month: expect.any(String), revenue: 0},
            {month: expect.any(String), revenue: 0}
        ]);
    });

    test('repeats the last known value when there is a single point', () => {
        const result = forecastRevenue([{month: '2026-09', revenue: 200}], 2);

        expect(result).toEqual([
            {month: '2026-10', revenue: 200},
            {month: '2026-11', revenue: 200}
        ]);
    });

    test('projects an upward linear trend and wraps December into January', () => {
        const monthly = [
            {month: '2026-10', revenue: 100},
            {month: '2026-11', revenue: 200},
            {month: '2026-12', revenue: 300}
        ];

        const result = forecastRevenue(monthly, 3);

        expect(result).toEqual([
            {month: '2027-01', revenue: 400},
            {month: '2027-02', revenue: 500},
            {month: '2027-03', revenue: 600}
        ]);
    });

    test('clamps a negative trend to zero instead of going negative', () => {
        const monthly = [
            {month: '2026-07', revenue: 300},
            {month: '2026-08', revenue: 150},
            {month: '2026-09', revenue: 0}
        ];

        const result = forecastRevenue(monthly, 2);

        result.forEach(point => {
            expect(point.revenue).toBeGreaterThanOrEqual(0);
        });
        expect(result[0].revenue).toBe(0);
        expect(result[1].revenue).toBe(0);
    });
});

describe('revenueByCategory', () => {
    test('returns an empty list for no orders', () => {
        expect(revenueByCategory([])).toEqual([]);
    });

    test('aggregates and sorts categories by revenue descending', () => {
        const orders = [
            {
                status: 'Received',
                products: [
                    {category: 'Shirts', price: 10, count: 2},
                    {category: 'Shoes', price: 100, count: 1}
                ]
            },
            {
                status: 'Received',
                products: [
                    {category: 'Shirts', price: 10, count: 1}
                ]
            },
            {
                status: 'Cancelled',
                products: [
                    {category: 'Shoes', price: 500, count: 5}
                ]
            }
        ];

        expect(revenueByCategory(orders)).toEqual([
            {category: 'Shoes', revenue: 100},
            {category: 'Shirts', revenue: 30}
        ]);
    });
});

describe('growthPercent', () => {
    test('returns null when the previous value is 0', () => {
        expect(growthPercent(0, 100)).toBeNull();
    });

    test('computes positive growth', () => {
        expect(growthPercent(100, 150)).toBe(50);
    });

    test('computes negative growth', () => {
        expect(growthPercent(200, 100)).toBe(-50);
    });
});
