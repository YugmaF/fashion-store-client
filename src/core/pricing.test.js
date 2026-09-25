import {getDiscountedPrice, getPromotionStatus, isPromotionActive} from './pricing';

const now = new Date('2026-09-25T12:00:00.000Z');

test('applies a promotion inside its schedule', () => {
    const product = {
        price: 100,
        discount: 25,
        promotionStart: '2026-09-24T00:00:00.000Z',
        promotionEnd: '2026-09-26T00:00:00.000Z'
    };

    expect(isPromotionActive(product, now)).toBe(true);
    expect(getDiscountedPrice(product, now)).toBe(75);
});

test('does not apply scheduled or expired promotions', () => {
    expect(getPromotionStatus({
        discount: 10,
        promotionStart: '2026-09-26T00:00:00.000Z'
    }, now)).toBe('scheduled');

    expect(getPromotionStatus({
        discount: 10,
        promotionEnd: '2026-09-24T00:00:00.000Z'
    }, now)).toBe('expired');
});

test('keeps legacy discounts without dates active', () => {
    expect(getDiscountedPrice({price: 80, discount: 10}, now)).toBe(72);
});
