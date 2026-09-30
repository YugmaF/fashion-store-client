// Deterministic sample order generator for the Sales Forecast page.
// Swap `generateDummyOrders()` for `listOrders(userId, token)` when the
// real backend endpoint is ready; the shape of the returned orders matches
// the API response consumed by `src/admin/Orders.js`.

const PRODUCT_CATALOG = [
    {_id: 'prod-1', name: 'Summer Dress', category: 'Dresses', price: 45},
    {_id: 'prod-2', name: 'Evening Gown', category: 'Dresses', price: 120},
    {_id: 'prod-3', name: 'Classic Shirt', category: 'Shirts', price: 25},
    {_id: 'prod-4', name: 'Flannel Shirt', category: 'Shirts', price: 35},
    {_id: 'prod-5', name: 'Sneakers', category: 'Shoes', price: 60},
    {_id: 'prod-6', name: 'Ankle Boots', category: 'Shoes', price: 90},
    {_id: 'prod-7', name: 'Leather Belt', category: 'Accessories', price: 15},
    {_id: 'prod-8', name: 'Silk Scarf', category: 'Accessories', price: 30}
];

const STATUS_TABLE = [
    {status: 'Delivered', weight: 0.75},
    {status: 'Shipped', weight: 0.12},
    {status: 'Processing', weight: 0.08},
    {status: 'Cancelled', weight: 0.05}
];

const SEED = 42;

// mulberry32: small, fast, deterministic PRNG (no Math.random).
const mulberry32 = seed => {
    let state = seed;

    return () => {
        state = (state + 0x6D2B79F5) | 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const pickStatus = random => {
    const roll = random();
    let cumulative = 0;

    for (const entry of STATUS_TABLE) {
        cumulative += entry.weight;
        if (roll < cumulative) {
            return entry.status;
        }
    }

    return STATUS_TABLE[0].status;
};

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const buildOrderProducts = (random, trendFactor) => {
    const productCount = 1 + Math.floor(random() * 3);
    const usedIndexes = new Set();
    const products = [];

    while (products.length < productCount && usedIndexes.size < PRODUCT_CATALOG.length) {
        const index = Math.floor(random() * PRODUCT_CATALOG.length);
        if (usedIndexes.has(index)) {
            continue;
        }
        usedIndexes.add(index);

        const catalogItem = PRODUCT_CATALOG[index];
        const count = 1 + Math.floor(random() * (2 + trendFactor * 2));

        products.push({
            _id: catalogItem._id,
            name: catalogItem.name,
            category: catalogItem.category,
            price: catalogItem.price,
            count
        });
    }

    return products;
};

// Generates ~150 sample orders spread across the trailing `months` months
// ending in `now`. Deterministic: the same `now`/`months` always produce
// the same orders.
export const generateDummyOrders = (now = new Date(), months = 12) => {
    const random = mulberry32(SEED);
    const orders = [];
    let orderIndex = 0;

    for (let i = months - 1; i >= 0; i -= 1) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const trendFactor = (months - i) / months;
        const isDecember = monthDate.getMonth() === 11;
        const seasonalBoost = isDecember ? 1.5 : 1;
        const baseOrders = 9 + trendFactor * 6;
        const ordersThisMonth = Math.max(1, Math.round(baseOrders * seasonalBoost));

        for (let j = 0; j < ordersThisMonth; j += 1) {
            const day = 1 + Math.floor(random() * daysInMonth(monthDate.getFullYear(), monthDate.getMonth()));
            const hour = Math.floor(random() * 24);
            const minute = Math.floor(random() * 60);
            const createdAt = new Date(
                monthDate.getFullYear(),
                monthDate.getMonth(),
                day,
                hour,
                minute
            ).toISOString();

            const products = buildOrderProducts(random, trendFactor);
            const amount = products.reduce((sum, product) => sum + product.price * product.count, 0);

            orders.push({
                _id: `order-${orderIndex}`,
                amount,
                createdAt,
                status: pickStatus(random),
                products
            });

            orderIndex += 1;
        }
    }

    return orders;
};

export default generateDummyOrders;
