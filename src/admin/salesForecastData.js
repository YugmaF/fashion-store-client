// Mulberry32 — fast, deterministic PRNG with a fixed seed.
function mulberry32(seed) {
    return function () {
        let s = (seed += 0x6d2b79f5) | 0;
        s = Math.imul(s ^ (s >>> 15), 1 | s);
        s ^= s + Math.imul(s ^ (s >>> 7), 61 | s);
        return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
    };
}

const SEED = 0xdeadbeef;

const PRODUCTS = [
    { _id: 'p1', name: 'Summer Dress',  category: 'Dresses',     price: 45 },
    { _id: 'p2', name: 'Evening Gown',  category: 'Dresses',     price: 120 },
    { _id: 'p3', name: 'Floral Midi',   category: 'Dresses',     price: 75 },
    { _id: 'p4', name: 'Classic Shirt', category: 'Shirts',      price: 35 },
    { _id: 'p5', name: 'Polo Shirt',    category: 'Shirts',      price: 50 },
    { _id: 'p6', name: 'Sneakers',      category: 'Shoes',       price: 80 },
    { _id: 'p7', name: 'Leather Belt',  category: 'Accessories', price: 15 },
    { _id: 'p8', name: 'Canvas Tote',   category: 'Accessories', price: 60 },
];

// 20-slot status wheel: 70 % Delivered, 15 % Shipped, 10 % Processing, 5 % Cancelled.
const STATUSES = [
    ...Array(14).fill('Delivered'),
    ...Array(3).fill('Shipped'),
    ...Array(2).fill('Processing'),
    'Cancelled',
];

/**
 * Returns ~150 orders spread across `months` calendar months ending at `now`.
 * Output shape matches the real listOrders API:
 *   { _id, amount, createdAt, status, products: [{_id, name, category, price, count}] }
 *
 * The generator is fully deterministic (fixed seed) so the same arguments always
 * produce identical output, enabling reliable snapshot / regression tests.
 */
export const generateDummyOrders = (now = new Date(), months = 12) => {
    const prng = mulberry32(SEED);
    const orders = [];
    let orderId = 1;

    for (let m = 0; m < months; m++) {
        // monthDate is the first day of the calendar month for index m.
        const monthDate = new Date(
            now.getFullYear(),
            now.getMonth() - (months - 1 - m),
            1
        );
        const isDecember = monthDate.getMonth() === 11;

        // Linear ramp from 9 orders (oldest) to 15 (newest); December ~×1.7.
        const baseCount = Math.round(9 + (m / (months - 1)) * 6);
        const orderCount = isDecember ? Math.round(baseCount * 1.7) : baseCount;

        const daysInMonth = new Date(
            monthDate.getFullYear(),
            monthDate.getMonth() + 1,
            0
        ).getDate();

        for (let o = 0; o < orderCount; o++) {
            const day    = 1 + Math.floor(prng() * daysInMonth);
            const hour   = Math.floor(prng() * 24);
            const minute = Math.floor(prng() * 60);
            const createdAt = new Date(
                monthDate.getFullYear(),
                monthDate.getMonth(),
                day,
                hour,
                minute
            ).toISOString();

            // Pick 1–3 distinct products via partial Fisher-Yates shuffle.
            const numProducts = 1 + Math.floor(prng() * 3);
            const indices = [0, 1, 2, 3, 4, 5, 6, 7];
            for (let i = 0; i < numProducts; i++) {
                const j = i + Math.floor(prng() * (indices.length - i));
                const tmp = indices[i];
                indices[i] = indices[j];
                indices[j] = tmp;
            }
            const products = indices.slice(0, numProducts).map(idx => {
                const qty = 1 + Math.floor(prng() * 3);
                return { ...PRODUCTS[idx], count: qty };
            });

            const amount = products.reduce((sum, p) => sum + p.price * p.count, 0);
            const status = STATUSES[Math.floor(prng() * STATUSES.length)];

            orders.push({
                _id: `order-${orderId++}`,
                amount,
                createdAt,
                status,
                products,
            });
        }
    }

    return orders;
};
