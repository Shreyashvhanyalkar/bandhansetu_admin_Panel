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

const renderWithProviders = (ui, { preloadedState, initialEntries = ['/admin/admin-profile'] } = {}) => {
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

describe('Admin Profile Integration', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  it('renders admin profile page', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Super Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Super Admin/i).length).toBeGreaterThan(0);
    });
  });

  it('renders administrator role badge', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Super Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Administrator/i).length).toBeGreaterThan(0);
    });
  });

  it('renders full name field on profile', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Super Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Full Name/i)).toBeInTheDocument();
    });
  });

  it('renders back to dashboard link', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Super Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
    });
  });

  it('renders email field on profile', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Super Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/admin@bandhan\.com/i)).toBeInTheDocument();
    });
  });
});