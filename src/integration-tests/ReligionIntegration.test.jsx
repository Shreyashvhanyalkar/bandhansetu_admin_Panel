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

const renderWithProviders = (ui, { preloadedState, initialEntries = ['/admin/religion'] } = {}) => {
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

const mockReligions = [
  { id: 'r1', religion_name: 'Hindu' },
  { id: 'r2', religion_name: 'Muslim' }
];

describe('Religion Management Integration', () => {
  beforeEach(() => {
    // Mock global fetch
    global.fetch = vi.fn((url) => {
      if (url.includes('/admin/religion') || url.includes('religion')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockReligions, religions: mockReligions })
        });
      }
      if (url.includes('/caste') || url.includes('/subcaste')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.reject(new Error('Unknown URL: ' + url));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and displays religions', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Hindu/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Muslim/i)).toBeInTheDocument();
  });

  it('opens add religion modal', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Hindu/i)).toBeInTheDocument();
    });

    const addButton = screen.getByTitle(/add new religion/i);
    fireEvent.click(addButton);

    expect(screen.getByText(/add religion/i)).toBeInTheDocument();
  });
});
