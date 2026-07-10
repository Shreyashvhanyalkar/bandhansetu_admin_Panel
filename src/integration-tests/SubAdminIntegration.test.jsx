import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

const renderWithProviders = (ui, { preloadedState, initialEntries = ['/admin/sub-admins'] } = {}) => {
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

// NOTE: SubAdminManagement.jsx currently renders from a hardcoded
// INITIAL_SUB_ADMINS array and does not call fetch. This mock data
// matches that hardcoded list so the test reflects real behavior.
const mockSubAdmins = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@bandhan.com' },
  { id: 2, name: 'Priya Verma', email: 'priya.verma@bandhan.com' },
];

describe('SubAdmin Management Integration', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/auth/admin/subadmin') || url.includes('/subadmins')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ subAdmins: mockSubAdmins, data: mockSubAdmins }),
        });
      }
      if (url.includes('/api/auth/admin/create-subadmin')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Sub-admin created', data: {} }),
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

  it('renders Sub Admin Management heading', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Sub Admin Management/i })).toBeInTheDocument();
    });
  });

  it('renders sub-admin list from mock data', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/rahul.sharma@bandhan.com/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/priya.verma@bandhan.com/i)).toBeInTheDocument();
  });

  it('shows add sub admin button', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Sub Admin Management/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add sub admin/i });
    expect(addButton).toBeInTheDocument();
  });

  it('opens add sub-admin modal on button click', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add sub admin/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /add sub admin/i }));

    await waitFor(() => {
      expect(screen.getByText(/add new sub admin/i)).toBeInTheDocument();
    });
  });
});