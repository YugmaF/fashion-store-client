import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import SalesForecast from './SalesForecast';

jest.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="line-chart" />,
    Bar: () => <div data-testid="bar-chart" />,
    Doughnut: () => <div data-testid="doughnut-chart" />
}));

const renderPage = () => render(
    <MemoryRouter>
        <SalesForecast />
    </MemoryRouter>
);

describe('SalesForecast', () => {
    beforeEach(() => {
        // Reduced motion makes count-up land on its target synchronously,
        // so KPI assertions do not depend on requestAnimationFrame timing.
        window.matchMedia = jest.fn().mockReturnValue({matches: true});
    });

    afterEach(() => {
        delete window.matchMedia;
    });

    test('shows the sample data badge', () => {
        renderPage();
        expect(screen.getByText('Sample data')).toBeInTheDocument();
    });

    test('renders the 4 KPI cards', () => {
        renderPage();
        expect(screen.getByText('Revenue this month')).toBeInTheDocument();
        expect(screen.getByText('Forecast next month')).toBeInTheDocument();
        expect(screen.getByText('Growth vs last month')).toBeInTheDocument();
        expect(screen.getByText('Total orders (12 months)')).toBeInTheDocument();
    });

    test('renders the 3 charts', () => {
        renderPage();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    test('renders 5 top product rows', () => {
        renderPage();
        const rows = screen.getAllByRole('row');
        // 1 header row + 5 product rows
        expect(rows).toHaveLength(6);
    });

    test('moving the what-if slider updates the forecast card', () => {
        renderPage();
        const slider = screen.getByLabelText('Marketing boost percentage');
        const forecastCard = screen.getByText('Forecast next month').closest('.sf-kpi-card');
        const before = forecastCard.querySelector('.sf-kpi-value').textContent;

        fireEvent.change(slider, {target: {value: '50'}});

        const after = forecastCard.querySelector('.sf-kpi-value').textContent;
        expect(after).not.toBe(before);
    });

    test('shows the insight line in the hero', () => {
        renderPage();
        expect(screen.getByText(/next month forecast/i)).toBeInTheDocument();
    });
});
