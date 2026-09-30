/**
 * Branch-coverage tests for SalesForecast.js.
 *
 * Uses jest.mock (hoisted before imports) to control generateDummyOrders so
 * the component can be exercised with data that is otherwise unreachable
 * through the default dummy-data path (null growth, negative growth, etc.).
 *
 * Also directly exercises the exported chart-helper functions.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Chart stub (same pattern as SalesForecast.test.js) ──────────────────────
jest.mock('react-chartjs-2', () => {
    const R = require('react');
    return {
        Line:     R.forwardRef((props, ref) => <div ref={ref} data-testid="sf-line-chart" />),
        Bar:      () => <div data-testid="sf-bar-chart" />,
        Doughnut: () => <div data-testid="sf-doughnut-chart" />,
    };
});

jest.mock('./useCountUp', () => target => target);

// ─── Controlled data source ───────────────────────────────────────────────────
// The factory is called once; we expose a jest.fn() so each test can set the
// return value without touching the module registry.
const mockGenerateDummyOrders = jest.fn();
jest.mock('./salesForecastData', () => ({
    generateDummyOrders: (...args) => mockGenerateDummyOrders(...args),
}));

beforeAll(() => {
    if (!global.requestAnimationFrame) {
        global.requestAnimationFrame = cb => setTimeout(cb, 0);
        global.cancelAnimationFrame  = id => clearTimeout(id);
    }
    if (!window.matchMedia) {
        window.matchMedia = jest.fn(() => ({
            matches: false,
            addListener: jest.fn(),
            removeListener: jest.fn(),
        }));
    }
});

// ─── Imports (resolved AFTER jest.mock hoisting) ──────────────────────────────
import SalesForecast, {
    formatYTick,
    formatSimpleTooltip,
    formatLineTooltip,
    legendFilter,
} from './SalesForecast';

const renderPage = () =>
    render(
        <MemoryRouter>
            <SalesForecast />
        </MemoryRouter>
    );

// ─── Chart helper functions ───────────────────────────────────────────────────
describe('formatYTick', () => {
    test('prefixes value with $', () => {
        expect(formatYTick(500)).toBe('$500');
        expect(formatYTick(0)).toBe('$0');
    });
});

describe('formatSimpleTooltip', () => {
    test('formats a numeric value with 2 decimal places', () => {
        expect(formatSimpleTooltip({ value: '123.456' })).toBe('$123.46');
    });

    test('treats missing/null value as 0', () => {
        expect(formatSimpleTooltip({ value: null })).toBe('$0.00');
        expect(formatSimpleTooltip({ value: undefined })).toBe('$0.00');
    });
});

describe('formatLineTooltip', () => {
    const makeCtx = (label, value) => ({
        item: { datasetIndex: 0, value },
        data: { datasets: [{ label }] },
    });

    test('returns null for datasets labelled _lower (internal)', () => {
        const { item, data } = makeCtx('_lower', '100');
        expect(formatLineTooltip(item, data)).toBeNull();
    });

    test('returns null for the confidence band dataset', () => {
        const { item, data } = makeCtx('Confidence band', '100');
        expect(formatLineTooltip(item, data)).toBeNull();
    });

    test('returns null for a NaN value (gap in line)', () => {
        const { item, data } = makeCtx('Actual Revenue', 'not-a-number');
        expect(formatLineTooltip(item, data)).toBeNull();
    });

    test('formats a visible dataset with a valid numeric value', () => {
        const { item, data } = makeCtx('Actual Revenue', '1234.5');
        expect(formatLineTooltip(item, data)).toBe('Actual Revenue: $1234.50');
    });

    test('handles empty string label (uses empty label)', () => {
        const { item, data } = makeCtx('', '50');
        // Empty label → not filtered, not NaN → ': $50.00'
        expect(formatLineTooltip(item, data)).toBe(': $50.00');
    });
});

describe('legendFilter', () => {
    test('shows items whose text does not start with _', () => {
        expect(legendFilter({ text: 'Actual Revenue' })).toBe(true);
    });

    test('hides items whose text starts with _', () => {
        expect(legendFilter({ text: '_lower' })).toBe(false);
    });

    test('hides items with empty or missing text (falsy short-circuit)', () => {
        // The && short-circuit returns the first falsy value, not boolean false.
        expect(legendFilter({ text: '' })).toBeFalsy();
        expect(legendFilter({})).toBeFalsy();
    });
});

// ─── Null growth: prevMonth revenue = 0 ──────────────────────────────────────
describe('null growth branch (prevMonth.revenue = 0)', () => {
    beforeEach(() => {
        // Empty order list → all monthly revenue buckets = 0
        // → prevMonth.revenue = 0 → growthPercent(0, 0) = null
        mockGenerateDummyOrders.mockReturnValue([]);
    });

    test('renders N/A chip (null branch on growth ternary)', () => {
        const { container } = renderPage();
        const chip = container.querySelector('.sf-growth-chip');
        expect(chip).toBeInTheDocument();
        expect(chip.textContent.trim()).toBe('N/A');
    });

    test('insight line still renders (trendPct fallback = 0)', () => {
        const { container } = renderPage();
        const insight = container.querySelector('.sf-hero-insight');
        expect(insight).toBeInTheDocument();
    });
});

// ─── Negative growth (current < previous month) ───────────────────────────────
describe('negative growth branch (growth < 0)', () => {
    beforeEach(() => {
        const now = new Date();
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString();
        const curr = new Date(now.getFullYear(), now.getMonth(), 15).toISOString();
        mockGenerateDummyOrders.mockReturnValue([
            {
                _id: 'o1', amount: 2000, createdAt: prev, status: 'Delivered',
                products: [{ _id: 'p1', name: 'A', category: 'Dresses', price: 2000, count: 1 }],
            },
            {
                _id: 'o2', amount: 400, createdAt: curr, status: 'Delivered',
                products: [{ _id: 'p1', name: 'A', category: 'Dresses', price: 400, count: 1 }],
            },
        ]);
    });

    test('shows ▼ with sf-growth-down class', () => {
        const { container } = renderPage();
        const chip = container.querySelector('.sf-growth-down');
        expect(chip).toBeInTheDocument();
        expect(chip.textContent).toContain('▼');
    });

    test('insight line says "down"', () => {
        const { container } = renderPage();
        const insight = container.querySelector('.sf-hero-insight');
        expect(insight.textContent).toContain('down');
    });
});
