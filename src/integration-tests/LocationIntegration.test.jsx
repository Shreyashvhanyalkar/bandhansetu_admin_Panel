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

const renderWithProviders = (ui, { preloadedState, initialEntries = ['/admin/locations'] } = {}) => {
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

const mockCountries = [
  { id: 'c1', country_name: 'India', status: 'active' },
  { id: 'c2', country_name: 'USA', status: 'active' }
];

describe('Location Management Integration', () => {
  beforeEach(() => {
    // Mock global fetch
    global.fetch = vi.fn((url) => {
      if (url.includes('/admin/country') || url.includes('country')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockCountries, countries: mockCountries })
        });
      }
      // Return empty for states/cities just in case
      if (url.includes('/state') || url.includes('/city')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.reject(new Error('Unknown URL: ' + url));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and displays countries on location management page', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    // Wait for data to load and be rendered
    await waitFor(() => {
      expect(screen.getByText(/India/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/USA/i)).toBeInTheDocument();
  });

  it('opens add country modal', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/India/i)).toBeInTheDocument();
    });

    // Find the Add Country button (it might just be a Plus icon, but it has a title "Add New Country")
    const addButton = screen.getByTitle(/add new country/i);
    fireEvent.click(addButton);

    // Modal should appear
    expect(screen.getByText(/add country/i)).toBeInTheDocument();
  });
});
