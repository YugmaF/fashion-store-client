import React from 'react';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import SalesForecast from './SalesForecast';

jest.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="sf-line-chart"/>,
    Doughnut: () => <div data-testid="sf-doughnut-chart"/>
}));

const renderPage = () => render(
    <MemoryRouter>
        <SalesForecast/>
    </MemoryRouter>
);

test('renders the sample data badge, the three KPI cards and both charts', () => {
    renderPage();

    expect(screen.getByText('Sample data')).toBeInTheDocument();
    expect(screen.getByText('Revenue this month')).toBeInTheDocument();
    expect(screen.getByText('Forecast next month')).toBeInTheDocument();
    expect(screen.getByText('Growth vs last month')).toBeInTheDocument();
    expect(screen.getByTestId('sf-line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('sf-doughnut-chart')).toBeInTheDocument();
});

test('renders the page title inside the layout', () => {
    renderPage();

    expect(screen.getAllByText('Sales Forecast').length).toBeGreaterThan(0);
});
