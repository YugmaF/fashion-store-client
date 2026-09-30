import React from 'react';
import { render, act } from '@testing-library/react';
import useCountUp from './useCountUp';

// ─── Minimal wrapper component ────────────────────────────────────────────────
const Counter = ({ target, duration = 1000 }) => {
    const value = useCountUp(target, duration);
    return <span data-testid="val">{value}</span>;
};

// ─── RAF / matchMedia mocks ───────────────────────────────────────────────────
let pendingRaf = [];
let rafId = 0;
let origRaf;
let origCaf;
let origMatchMedia;
let origPerfNow;

beforeEach(() => {
    pendingRaf = [];
    rafId = 0;

    origRaf = global.requestAnimationFrame;
    origCaf = global.cancelAnimationFrame;
    origMatchMedia = window.matchMedia;
    origPerfNow = performance.now;

    global.requestAnimationFrame = jest.fn(cb => {
        const id = ++rafId;
        pendingRaf.push({ id, cb });
        return id;
    });
    global.cancelAnimationFrame = jest.fn(id => {
        pendingRaf = pendingRaf.filter(r => r.id !== id);
    });

    window.matchMedia = jest.fn(() => ({ matches: false }));
    // Fix the animation start time at 0 ms.
    jest.spyOn(performance, 'now').mockReturnValue(0);
});

afterEach(() => {
    global.requestAnimationFrame = origRaf;
    global.cancelAnimationFrame = origCaf;
    window.matchMedia = origMatchMedia;
    performance.now = origPerfNow;
    jest.restoreAllMocks();
});

// Fire all currently pending RAF callbacks with `timestamp`.
function flushRaf(timestamp) {
    const toFire = [...pendingRaf];
    pendingRaf = [];
    act(() => {
        toFire.forEach(({ cb }) => cb(timestamp));
    });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('starts at 0', () => {
    const { getByTestId } = render(<Counter target={100} />);
    expect(Number(getByTestId('val').textContent)).toBeCloseTo(0, 5);
});

test('reaches the exact target after the full duration', () => {
    const { getByTestId } = render(<Counter target={100} duration={1000} />);

    flushRaf(500);  // 50 % through → intermediate value
    const mid = Number(getByTestId('val').textContent);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(100);

    flushRaf(1000); // 100 % → final value
    expect(Number(getByTestId('val').textContent)).toBe(100);
});

test('ease-out: value at 50 % elapsed is greater than 50 % of target', () => {
    // ease-out cubic: eased(0.5) = 1 - (0.5)^3 = 0.875 → value ≈ 87.5
    const { getByTestId } = render(<Counter target={100} duration={1000} />);
    flushRaf(500);
    expect(Number(getByTestId('val').textContent)).toBeGreaterThan(50);
});

test('returns target immediately under prefers-reduced-motion', () => {
    window.matchMedia = jest.fn(() => ({ matches: true }));
    const { getByTestId } = render(<Counter target={250} duration={1000} />);
    // No RAF needed — setValue(target) is called synchronously.
    expect(Number(getByTestId('val').textContent)).toBe(250);
});

test('cancels animation on unmount', () => {
    const { unmount } = render(<Counter target={100} />);
    unmount();
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
});

test('re-animates when target changes', () => {
    const { getByTestId, rerender } = render(<Counter target={100} />);
    flushRaf(1000); // Complete first animation
    expect(Number(getByTestId('val').textContent)).toBe(100);

    rerender(<Counter target={200} />);
    // A new RAF has been scheduled; before it fires value is still at prior end.
    flushRaf(1000);
    expect(Number(getByTestId('val').textContent)).toBe(200);
});

test('handles target = 0', () => {
    const { getByTestId } = render(<Counter target={0} />);
    flushRaf(1000);
    expect(Number(getByTestId('val').textContent)).toBe(0);
});
