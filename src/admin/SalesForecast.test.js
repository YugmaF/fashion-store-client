import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Stub chart components ────────────────────────────────────────────────────
// Line uses React.forwardRef so that the `ref` in SalesForecast.js is accepted
// without a console warning (react-chartjs-2 v2 exposes a class component in
// production, but the factory here is a plain function).
jest.mock('react-chartjs-2', () => {
    const React = require('react');
    return {
        Line:     React.forwardRef((props, ref) => <div ref={ref} data-testid="sf-line-chart" />),
        Bar:      () => <div data-testid="sf-bar-chart" />,
        Doughnut: () => <div data-testid="sf-doughnut-chart" />,
    };
});

// Return the target immediately so KPI values are stable numbers in DOM.
jest.mock('./useCountUp', () => target => target);

// ─── RAF / matchMedia stubs needed by Layout / MUI Tooltip internals ──────────
beforeAll(() => {
    if (!global.requestAnimationFrame) {
        global.requestAnimationFrame = cb => setTimeout(cb, 0);
        global.cancelAnimationFrame = id => clearTimeout(id);
    }
    if (!window.matchMedia) {
        window.matchMedia = jest.fn(() => ({
            matches: false,
            addListener: jest.fn(),
            removeListener: jest.fn(),
        }));
    }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
import SalesForecast from './SalesForecast';
import AdminRoute from '../auth/AdminRoute';

const renderPage = () =>
    render(
        <MemoryRouter initialEntries={['/admin/sales-forecast']}>
            <SalesForecast />
        </MemoryRouter>
    );

// ─── AC-2: non-admin redirect ─────────────────────────────────────────────────
describe('AdminRoute protection', () => {
    const { isAuthenticate } = require('../auth');
    beforeEach(() => jest.resetModules());

    test('redirects anonymous user to /signin', () => {
        jest.mock('../auth', () => ({
            ...jest.requireActual('../auth'),
            isAuthenticate: () => false,
        }));
        const { isAuthenticate: mockAuth } = require('../auth');
        const { container } = render(
            <MemoryRouter initialEntries={['/admin/sales-forecast']}>
                <AdminRoute path="/admin/sales-forecast" component={SalesForecast} />
            </MemoryRouter>
        );
        // AdminRoute renders a Redirect; the page itself should not be present.
        expect(container.querySelector('[data-testid="sf-line-chart"]')).toBeNull();
    });

    test('redirects store manager (role 2) to /signin', () => {
        jest.mock('../auth', () => ({
            ...jest.requireActual('../auth'),
            isAuthenticate: () => ({ user: { role: '2' }, token: 'tok' }),
        }));
        const { container } = render(
            <MemoryRouter initialEntries={['/admin/sales-forecast']}>
                <AdminRoute path="/admin/sales-forecast" component={SalesForecast} />
            </MemoryRouter>
        );
        expect(container.querySelector('[data-testid="sf-line-chart"]')).toBeNull();
    });
});

// ─── Page content ─────────────────────────────────────────────────────────────
describe('SalesForecast page', () => {
    test('shows the "Sample data" badge', () => {
        const { getByText } = renderPage();
        expect(getByText(/sample data/i)).toBeInTheDocument();
    });

    test('renders 4 KPI cards', () => {
        const { container } = renderPage();
        expect(container.querySelectorAll('.sf-kpi-card')).toHaveLength(4);
    });

    test('renders all 3 charts (Line, Bar, Doughnut)', () => {
        const { getByTestId } = renderPage();
        expect(getByTestId('sf-line-chart')).toBeInTheDocument();
        expect(getByTestId('sf-bar-chart')).toBeInTheDocument();
        expect(getByTestId('sf-doughnut-chart')).toBeInTheDocument();
    });

    test('renders exactly 5 product rows', () => {
        const { container } = renderPage();
        expect(container.querySelectorAll('.sf-product-row')).toHaveLength(5);
    });

    test('shows 🥇 🥈 🥉 for top 3 products', () => {
        const { getByText } = renderPage();
        expect(getByText('🥇')).toBeInTheDocument();
        expect(getByText('🥈')).toBeInTheDocument();
        expect(getByText('🥉')).toBeInTheDocument();
    });

    test('displays the total orders count in the doughnut centre', () => {
        const { container } = renderPage();
        expect(container.querySelector('.sf-doughnut-total')).toBeInTheDocument();
        const total = Number(container.querySelector('.sf-doughnut-total').textContent);
        expect(total).toBeGreaterThan(0);
    });

    test('shows a growth chip (▲ or ▼) in the growth KPI card', () => {
        const { container } = renderPage();
        const chip = container.querySelector('.sf-growth-chip');
        expect(chip).toBeInTheDocument();
    });

    test('renders the marketing-boost slider with correct range', () => {
        const { container } = renderPage();
        const slider = container.querySelector('input[type="range"]');
        expect(slider).toBeInTheDocument();
        expect(slider.min).toBe('-20');
        expect(slider.max).toBe('50');
    });

    test('moving the slider increases the forecast card value at +50%', () => {
        const { container } = renderPage();
        const slider = container.querySelector('input[type="range"]');
        const forecastEl = container.querySelector('[data-testid="sf-forecast-val"]');

        // Parse initial numeric value from "$1234.56" format.
        const before = Number.parseFloat(
            (forecastEl.textContent || '').replace(/[^0-9.]/g, '')
        );

        fireEvent.change(slider, { target: { value: '50' } });

        const after = Number.parseFloat(
            (forecastEl.textContent || '').replace(/[^0-9.]/g, '')
        );

        expect(after).toBeGreaterThan(before);
    });

    test('moving the slider decreases the forecast card value at -20%', () => {
        const { container } = renderPage();
        const slider = container.querySelector('input[type="range"]');
        const forecastEl = container.querySelector('[data-testid="sf-forecast-val"]');

        const before = Number.parseFloat(
            (forecastEl.textContent || '').replace(/[^0-9.]/g, '')
        );

        fireEvent.change(slider, { target: { value: '-20' } });

        const after = Number.parseFloat(
            (forecastEl.textContent || '').replace(/[^0-9.]/g, '')
        );

        expect(after).toBeLessThan(before);
    });

    test('contains revenue-share progress bars for each product row', () => {
        const { container } = renderPage();
        const bars = container.querySelectorAll('.sf-progress-bar');
        expect(bars.length).toBe(5);
    });

    test('hero insight line mentions a forecast amount', () => {
        const { container } = renderPage();
        const insight = container.querySelector('.sf-hero-insight');
        expect(insight).toBeInTheDocument();
        expect(insight.textContent).toMatch(/forecast/i);
    });
});


