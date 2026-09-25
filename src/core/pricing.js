export const getPromotionStatus = (product, now = new Date()) => {
    if (!product || Number(product.discount) <= 0) {
        return 'none';
    }

    const currentTime = now.getTime();
    const startTime = product.promotionStart ? new Date(product.promotionStart).getTime() : null;
    const endTime = product.promotionEnd ? new Date(product.promotionEnd).getTime() : null;

    if ((startTime !== null && Number.isNaN(startTime))
        || (endTime !== null && Number.isNaN(endTime))) {
        return 'none';
    }

    if (startTime !== null && startTime > currentTime) {
        return 'scheduled';
    }

    if (endTime !== null && endTime < currentTime) {
        return 'expired';
    }

    return 'active';
};

export const isPromotionActive = (product, now = new Date()) => (
    getPromotionStatus(product, now) === 'active'
);

export const getDiscountedPrice = (product, now = new Date()) => {
    const price = Number(product && product.price) || 0;

    if (!isPromotionActive(product, now)) {
        return price;
    }

    return price * (1 - Number(product.discount) / 100);
};

export const formatPrice = value => Number(value || 0).toFixed(2);
