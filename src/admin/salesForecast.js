const CATEGORIES = [
    {name: 'Dresses', basePrice: 60},
    {name: 'Shirts', basePrice: 30},
    {name: 'Shoes', basePrice: 80},
    {name: 'Accessories', basePrice: 20}
];

const PRODUCT_NAMES = {
    Dresses: ['Summer Dress', 'Evening Gown', 'Floral Dress'],
    Shirts: ['Cotton Shirt', 'Denim Shirt', 'Polo Shirt'],
    Shoes: ['Running Shoes', 'Leather Boots', 'Sandals'],
    Accessories: ['Leather Belt', 'Sunglasses', 'Handbag']
};

const monthKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const addMonthsToKey = (key, offset) => {
    const [year, month] = key.split('-').map(part => Number.parseInt(part, 10));
    const date = new Date(Date.UTC(year, (month - 1) + offset, 1));
    return monthKey(date);
};

const createSeededRandom = seed => {
    let state = seed;

    return () => {
        state = (state * 16807) % 2147483647;
        return (state - 1) / 2147483646;
    };
};

export const generateDummyOrders = (now = new Date(), months = 12) => {
    const random = createSeededRandom(42);
    const orders = [];
    const ordersPerMonth = 8;

    for (let monthOffset = months - 1; monthOffset >= 0; monthOffset -= 1) {
        const monthDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() - monthOffset, 1));
        const trend = 1 + ((months - 1 - monthOffset) * 0.04);

        for (let i = 0; i < ordersPerMonth; i += 1) {
            const day = 1 + Math.floor(random() * 27);
            const hour = Math.floor(random() * 24);
            const createdAt = new Date(Date.UTC(
                monthDate.getFullYear(), monthDate.getMonth(), day, hour
            )).toISOString();

            const productCount = 1 + Math.floor(random() * 3);
            const products = [];

            for (let p = 0; p < productCount; p += 1) {
                const category = CATEGORIES[Math.floor(random() * CATEGORIES.length)];
                const names = PRODUCT_NAMES[category.name];
                const name = names[Math.floor(random() * names.length)];
                const priceVariation = 1 + ((random() - 0.5) * 0.4);
                const price = Number((category.basePrice * priceVariation * trend).toFixed(2));
                const count = 1 + Math.floor(random() * 3);

                products.push({name, category: category.name, price, count});
            }

            const amount = Number(
                products.reduce((sum, product) => sum + (product.price * product.count), 0).toFixed(2)
            );

            const status = random() < 0.05 ? 'Cancelled' : 'Received';

            orders.push({
                _id: `dummy-${monthOffset}-${i}`,
                amount,
                createdAt,
                status,
                products
            });
        }
    }

    return orders;
};

export const groupRevenueByMonth = (orders = [], now = new Date(), months = 12) => {
    const monthMap = new Map();

    for (let monthOffset = months - 1; monthOffset >= 0; monthOffset -= 1) {
        const monthDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() - monthOffset, 1));
        monthMap.set(monthKey(monthDate), 0);
    }

    (orders || []).forEach(order => {
        if (!order || order.status === 'Cancelled') {
            return;
        }

        const createdAt = new Date(order.createdAt);
        if (Number.isNaN(createdAt.getTime())) {
            return;
        }

        const key = monthKey(createdAt);
        if (!monthMap.has(key)) {
            return;
        }

        const amount = Number.parseFloat(order.amount);
        if (Number.isNaN(amount)) {
            return;
        }

        monthMap.set(key, monthMap.get(key) + amount);
    });

    return Array.from(monthMap.entries()).map(([month, revenue]) => ({
        month,
        revenue: Number(revenue.toFixed(2))
    }));
};

export const forecastRevenue = (monthly = [], periods = 3) => {
    const points = monthly || [];
    const n = points.length;
    const lastMonth = n > 0 ? points[n - 1].month : monthKey(new Date());
    const lastValue = n > 0 ? points[n - 1].revenue : 0;

    if (n < 2) {
        return Array.from({length: periods}, (_, i) => ({
            month: addMonthsToKey(lastMonth, i + 1),
            revenue: n === 0 ? 0 : lastValue
        }));
    }

    const xs = points.map((_, i) => i);
    const ys = points.map(point => point.revenue);

    const sumX = xs.reduce((sum, x) => sum + x, 0);
    const sumY = ys.reduce((sum, y) => sum + y, 0);
    const sumXY = xs.reduce((sum, x, i) => sum + (x * ys[i]), 0);
    const sumXX = xs.reduce((sum, x) => sum + (x * x), 0);

    const denominator = (n * sumXX) - (sumX * sumX);
    const slope = denominator === 0 ? 0 : (((n * sumXY) - (sumX * sumY)) / denominator);
    const intercept = (sumY - (slope * sumX)) / n;

    return Array.from({length: periods}, (_, i) => {
        const x = n + i;
        const revenue = Math.max(0, (slope * x) + intercept);
        return {
            month: addMonthsToKey(lastMonth, i + 1),
            revenue: Number(revenue.toFixed(2))
        };
    });
};

export const revenueByCategory = (orders = []) => {
    const categoryMap = new Map();

    (orders || []).forEach(order => {
        if (!order || order.status === 'Cancelled' || !Array.isArray(order.products)) {
            return;
        }

        order.products.forEach(product => {
            const price = Number.parseFloat(product.price) || 0;
            const count = Number.parseInt(product.count, 10) || 0;
            const revenue = price * count;

            categoryMap.set(product.category, (categoryMap.get(product.category) || 0) + revenue);
        });
    });

    return Array.from(categoryMap.entries())
        .map(([category, revenue]) => ({category, revenue: Number(revenue.toFixed(2))}))
        .sort((a, b) => b.revenue - a.revenue);
};

export const growthPercent = (previous, current) => {
    const prev = Number.parseFloat(previous);
    const curr = Number.parseFloat(current);

    if (!prev) {
        return null;
    }

    return Number((((curr - prev) / prev) * 100).toFixed(2));
};
