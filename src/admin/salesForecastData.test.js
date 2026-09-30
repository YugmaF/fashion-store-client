import {generateDummyOrders} from './salesForecastData';

const NOW = new Date('2026-09-30T00:00:00.000Z');

test('generates roughly 150 orders shaped like the real order API', () => {
    const orders = generateDummyOrders(NOW, 12);

    expect(orders.length).toBeGreaterThan(100);
    expect(orders.length).toBeLessThan(200);

    const sample = orders[0];
    expect(sample).toHaveProperty('_id');
    expect(sample).toHaveProperty('amount');
    expect(sample).toHaveProperty('createdAt');
    expect(sample).toHaveProperty('status');
    expect(Array.isArray(sample.products)).toBe(true);
    expect(sample.products[0]).toHaveProperty('_id');
    expect(sample.products[0]).toHaveProperty('name');
    expect(sample.products[0]).toHaveProperty('category');
    expect(sample.products[0]).toHaveProperty('price');
    expect(sample.products[0]).toHaveProperty('count');
});

test('is deterministic for the same now/months arguments', () => {
    const first = generateDummyOrders(NOW, 12);
    const second = generateDummyOrders(NOW, 12);

    expect(second).toEqual(first);
});

test('spans exactly the requested number of trailing months', () => {
    const orders = generateDummyOrders(NOW, 12);
    const months = new Set(orders.map(order => order.createdAt.slice(0, 7)));

    expect(months.size).toBeLessThanOrEqual(12);
    expect(months.has('2026-09')).toBe(true);
    expect(months.has('2025-10')).toBe(true);
});

test('produces a december peak in order volume', () => {
    const orders = generateDummyOrders(NOW, 12);
    const counts = {};
    orders.forEach(order => {
        const key = order.createdAt.slice(0, 7);
        counts[key] = (counts[key] || 0) + 1;
    });

    expect(counts['2025-12']).toBeGreaterThan(counts['2025-11']);
});

test('mostly delivered, with a small share cancelled', () => {
    const orders = generateDummyOrders(NOW, 12);
    const delivered = orders.filter(order => order.status === 'Delivered').length;
    const cancelled = orders.filter(order => order.status === 'Cancelled').length;

    expect(delivered / orders.length).toBeGreaterThan(0.5);
    expect(cancelled / orders.length).toBeLessThan(0.15);
    expect(cancelled).toBeGreaterThan(0);
});

test('only uses the 4 known categories and prices between 15 and 120', () => {
    const orders = generateDummyOrders(NOW, 12);
    const categories = new Set();

    orders.forEach(order => {
        order.products.forEach(product => {
            categories.add(product.category);
            expect(product.price).toBeGreaterThanOrEqual(15);
            expect(product.price).toBeLessThanOrEqual(120);
        });
    });

    expect(categories).toEqual(new Set(['Dresses', 'Shirts', 'Shoes', 'Accessories']));
});

test('respects a custom months window', () => {
    const orders = generateDummyOrders(NOW, 3);
    const months = new Set(orders.map(order => order.createdAt.slice(0, 7)));

    expect(months.size).toBeLessThanOrEqual(3);
});
