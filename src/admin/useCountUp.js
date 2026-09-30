import {useEffect, useState} from 'react';

const FRAME_MS = 16;

const prefersReducedMotion = () => (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

const scheduleFrame = callback => (
    typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame(callback)
        : setTimeout(() => callback(), FRAME_MS)
);

const cancelFrame = id => {
    if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(id);
        return;
    }
    clearTimeout(id);
};

// Animates from 0 up to `target` over `durationMs`, using an ease-out
// cubic curve. Skips the animation entirely (jumps straight to the
// target) when the user prefers reduced motion.
export const useCountUp = (target, durationMs = 1000) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const safeTarget = Number(target) || 0;

        if (prefersReducedMotion() || durationMs <= 0) {
            setValue(safeTarget);
            return undefined;
        }

        let cancelled = false;
        let frameId;
        let elapsed = 0;

        const tick = () => {
            if (cancelled) {
                return;
            }

            elapsed += FRAME_MS;
            const progress = Math.min(1, elapsed / durationMs);
            const eased = 1 - (1 - progress) ** 3;
            setValue(safeTarget * eased);

            if (progress < 1) {
                frameId = scheduleFrame(tick);
            }
        };

        frameId = scheduleFrame(tick);

        return () => {
            cancelled = true;
            cancelFrame(frameId);
        };
    }, [target, durationMs]);

    return value;
};

export default useCountUp;
