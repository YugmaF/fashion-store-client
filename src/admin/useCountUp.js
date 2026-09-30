import { useState, useEffect } from 'react';

/**
 * Animates a numeric value from 0 to `target` over `durationMs` milliseconds
 * using an ease-out cubic curve driven by requestAnimationFrame.
 *
 * Immediately returns `target` (no animation) when:
 *  - `prefers-reduced-motion: reduce` is active, or
 *  - requestAnimationFrame is not available (e.g. some test environments).
 */
const useCountUp = (target, durationMs = 1200) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const prefersReduced =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReduced || typeof requestAnimationFrame === 'undefined') {
            setValue(target);
            return;
        }

        let rafId;
        const startTime = performance.now();

        const tick = now => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // ease-out cubic: decelerates as it approaches the target
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(target * eased);
            if (progress < 1) {
                rafId = requestAnimationFrame(tick);
            } else {
                setValue(target);
            }
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [target, durationMs]);

    return value;
};

export default useCountUp;
