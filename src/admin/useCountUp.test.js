import React from 'react';
import {act, render} from '@testing-library/react';
import {useCountUp} from './useCountUp';

const Probe = ({target, duration}) => {
    const value = useCountUp(target, duration);
    return <span data-testid="value">{Math.round(value)}</span>;
};

const getValue = container => Number.parseInt(container.querySelector('[data-testid="value"]').textContent, 10);

describe('useCountUp', () => {
    let matchMediaSpy;

    beforeEach(() => {
        jest.useFakeTimers();
        window.matchMedia = jest.fn().mockReturnValue({matches: false});
        matchMediaSpy = window.matchMedia;
        // jsdom's requestAnimationFrame is not driven by jest's fake timers,
        // so route it through setTimeout for deterministic tests.
        window.requestAnimationFrame = cb => setTimeout(cb, 16);
        window.cancelAnimationFrame = id => clearTimeout(id);
    });

    afterEach(() => {
        jest.useRealTimers();
        delete window.matchMedia;
        delete window.requestAnimationFrame;
        delete window.cancelAnimationFrame;
    });

    test('starts at 0 and animates up to the target over time', () => {
        const {container} = render(<Probe target={1000} duration={160} />);

        expect(getValue(container)).toBe(0);

        act(() => {
            jest.advanceTimersByTime(80);
        });
        const midway = getValue(container);
        expect(midway).toBeGreaterThan(0);
        expect(midway).toBeLessThan(1000);

        act(() => {
            jest.advanceTimersByTime(200);
        });
        expect(getValue(container)).toBe(1000);
    });

    test('jumps straight to the target when reduced motion is preferred', () => {
        matchMediaSpy.mockReturnValue({matches: true});

        const {container} = render(<Probe target={500} duration={1000} />);

        expect(getValue(container)).toBe(500);

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(getValue(container)).toBe(500);
    });

    test('treats a missing/NaN target as 0', () => {
        const {container} = render(<Probe target={undefined} duration={100} />);

        act(() => {
            jest.advanceTimersByTime(200);
        });
        expect(getValue(container)).toBe(0);
    });

    test('jumps to target immediately when duration is 0', () => {
        const {container} = render(<Probe target={42} duration={0} />);

        expect(getValue(container)).toBe(42);
    });
});
