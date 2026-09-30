import { generateDummyOrders } from './salesForecastData';

const FIXED_NOW = new Date('2026-09-30T12:00:00.000Z');

describe('generateDummyOrders', () => {
    test('is fully deterministic for the same arguments', () => {
        const a = generateDummyOrders(FIXED_NOW);
        const b = generateDummyOrders(FIXED_NOW);
        expect(a).toEqual(b);
    });

    test('produces approximately 150 orders over 12 months', () => {
        const orders = generateDummyOrders(FIXED_NOW);
        expect(orders.length).toBeGreaterThanOrEqual(140);
        expect(orders.length).toBeLessThanOrEqual(170);
    });

    test('each order has the required API-shaped fields', () => {
        const orders = generateDummyOrders(FIXED_NOW);
        orders.forEach(order => {
            expect(order).toHaveProperty('_id');
            expect(order).toHaveProperty('amount');
            expect(order).toHaveProperty('createdAt');
            expect(order).toHaveProperty('status');
            expect(Array.isArray(order.products)).toBe(true);
            expect(order.products.length).toBeGreaterThanOrEqual(1);
            expect(order.products.length).toBeLessThanOrEqual(3);

            order.products.forEach(p => {
                expect(p).toHaveProperty('_id');
                expect(p).toHaveProperty('name');
                expect(p).toHaveProperty('category');
                expect(p).toHaveProperty('price');
                expect(p).toHaveProperty('count');
                expect(p.count).toBeGreaterThanOrEqual(1);
            });
        });
    });

    test('amount equals sum of product price × count', () => {
        const orders = generateDummyOrders(FIXED_NOW);
        orders.forEach(order => {
            const computed = order.products.reduce(
                (s, p) => s + p.price * p.count,
                0
            );
            expect(order.amount).toBe(computed);
        });
    });

    test('order _id values are unique', () => {
        const orders = generateDummyOrders(FIXED_NOW);
        const ids = orders.map(o => o._id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    test('covers all four product categories', () => {
        const orders = generateDummyOrders(FIXED_NOW);
        const cats = new Set(orders.flatMap(o => o.products.map(p => p.category)));
        expect(cats.has('Dresses')).toBe(true);
        expect(cats.has('Shirts')).toBe(true);
        expect(cats.has('Shoes')).toBe(true);
        expect(cats.has('Accessories')).toBe(true);
    });

    test('statuses are from the allowed set', () => {
        const valid = new Set(['Delivered', 'Shipped', 'Processing', 'Cancelled']);
        const orders = generateDummyOrders(FIXED_NOW);
        orders.forEach(o => expect(valid.has(o.status)).toBe(true));
    });

    test('cancelled orders are a small minority (~5%)', () => {
        const orders = generateDummyOrders(FIXED_NOW);
        const cancelRate =
            orders.filter(o => o.status === 'Cancelled').length / orders.length;
        expect(cancelRate).toBeLessThan(0.20);
        expect(cancelRate).toBeGreaterThan(0);
    });

    test('createdAt values are valid ISO date strings', () => {
        const orders = generateDummyOrders(FIXED_NOW);
        orders.forEach(o => {
            expect(Number.isNaN(new Date(o.createdAt).getTime())).toBe(false);
        });
    });

    test('spans all 12 months up to the given `now`', () => {
        const orders = generateDummyOrders(FIXED_NOW);
        const monthSet = new Set(orders.map(o => o.createdAt.substring(0, 7)));
        // Most-recent month (Sep 2026)
        expect(monthSet.has('2026-09')).toBe(true);
        // 12 months back (Oct 2025)
        expect(monthSet.has('2025-10')).toBe(true);
    });

    test('December receives extra orders (December-peak feature)', () => {
        // With now = Jan 31 2026, Dec 2025 (month index 10) is in range.
        const nowJan = new Date('2026-01-31T12:00:00.000Z');
        const orders = generateDummyOrders(nowJan);
        const decOrders = orders.filter(o => o.createdAt.startsWith('2025-12'));
        const otherMonths = orders.filter(
            o => !o.createdAt.startsWith('2025-12') && !o.createdAt.startsWith('2026-01')
        );
        const avgOther = otherMonths.length / 10; // 10 non-Dec non-Jan months
        expect(decOrders.length).toBeGreaterThan(avgOther);
    });

    test('handles Dec → Jan boundary correctly', () => {
        const nowJan = new Date('2026-01-01T00:00:00.000Z');
        const orders = generateDummyOrders(nowJan);
        const months = new Set(orders.map(o => o.createdAt.substring(0, 7)));
        expect(months.has('2025-12')).toBe(true);
        expect(months.has('2026-01')).toBe(true);
    });

    test('different `now` values produce different order dates', () => {
        const orders1 = generateDummyOrders(new Date('2026-03-31'));
        const orders2 = generateDummyOrders(new Date('2026-09-30'));
        const dates1 = orders1.map(o => o.createdAt.substring(0, 7));
        const dates2 = orders2.map(o => o.createdAt.substring(0, 7));
        expect(dates1).not.toEqual(dates2);
    });

    test('products within an order are distinct (no duplicates)', () => {
        const orders = generateDummyOrders(FIXED_NOW);
        orders.forEach(order => {
            const ids = order.products.map(p => p._id);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });
});
