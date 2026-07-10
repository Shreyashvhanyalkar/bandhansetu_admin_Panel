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

const renderWithProviders = (ui, { preloadedState, initialEntries = ['/admin/requests'] } = {}) => {
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

const mockUsers = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', mobile: '1234567890', status: 0 },
  { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', mobile: '0987654321', status: 0 }
];

describe('User Management Integration', () => {
  beforeEach(() => {
    // Mock global fetch
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/auth/admin/users?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockUsers })
        });
      }
      if (url.includes('/api/auth/admin/users/status/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Status updated' })
        });
      }
      return Promise.reject(new Error('Unknown URL: ' + url));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches pending users and displays them', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    // It should load and display "John Doe" (using email to avoid text splitting issues)
    await waitFor(() => {
      expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/jane@example.com/i)).toBeInTheDocument();
  });

  it('approves a user and updates UI', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    });

    // Click the row to open the user drawer (clicking the email works since it's in the row)
    fireEvent.click(screen.getByText(/john@example.com/i));

    // Wait for drawer to open and "Activate" button to appear
    let activateBtn;
    await waitFor(() => {
      activateBtn = screen.getByRole('button', { name: /activate/i });
      expect(activateBtn).toBeInTheDocument();
    });
    
    fireEvent.click(activateBtn);

    // Verify fetch was called for activate (status patch)
    await waitFor(() => {
      const patchCalls = global.fetch.mock.calls.filter(call => call[0].includes('/status/1'));
      expect(patchCalls.length).toBe(1);
    });
  });
});
