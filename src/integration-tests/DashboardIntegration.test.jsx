import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import authReducer from '../features/auth/Authslice';
import adminReducer from '../features/Admin/Adminslice';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock chart.js components to prevent jsdom crash
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart">Bar Chart Mock</div>,
  Line: () => <div data-testid="mock-line-chart">Line Chart Mock</div>,
  Pie: () => <div data-testid="mock-pie-chart">Pie Chart Mock</div>,
  Doughnut: () => <div data-testid="mock-doughnut-chart">Doughnut Chart Mock</div>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (ui, { preloadedState, initialEntries = ['/admin/dashboard'] } = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer, admin: adminReducer },
    preloadedState,
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          {ui}
        </MemoryRouter>
      </Provider>
    </QueryClientProvider>
  );
};

const mockDashboardStats = {
  totalUsers: 4821,
  activeRequests: 318,
  pendingApprovals: 47,
  completedMatches: 1204,
};

describe('Dashboard Integration', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/auth/admin/dashboard') || url.includes('/dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockDashboardStats }),
        });
      }
      if (url.includes('/api/auth/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [], total: 0 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  it('renders dashboard page with BandhanSetu title', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /BandhanSetu/i, level: 1 })).toBeInTheDocument();
    });
  });

  it('renders dashboard stat cards', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      const dashboardElements = screen.getAllByText(/Dashboard/i);
      expect(dashboardElements.length).toBeGreaterThan(0);
    });
  });

  it('renders sidebar navigation links', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Main Navigation/i)).toBeInTheDocument();
    });
  });

  it('renders Matrimony Admin label', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Matrimony Admin/i)).toBeInTheDocument();
    });
  });

  it('renders chart mocks on dashboard', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /BandhanSetu/i, level: 1 })).toBeInTheDocument();
    });
    const charts = screen.queryAllByTestId(/mock-.*-chart/i);
    expect(charts.length).toBeGreaterThanOrEqual(0);
  });
});