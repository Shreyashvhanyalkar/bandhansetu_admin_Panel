import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import authReducer from '../features/auth/Authslice';
import adminReducer from '../features/Admin/Adminslice';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart">Bar Chart Mock</div>,
  Line: () => <div data-testid="mock-line-chart">Line Chart Mock</div>,
  Pie: () => <div data-testid="mock-pie-chart">Pie Chart Mock</div>,
  Doughnut: () => <div data-testid="mock-doughnut-chart">Doughnut Chart Mock</div>,
}));

// Create a client for react-query which is likely used in components
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui, { preloadedState, initialEntries = ['/'] } = {}) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      admin: adminReducer,
    },
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

describe('App Integration Tests', () => {
  describe('Routing & Authentication Flow', () => {
    it('redirects an unauthenticated user to the login page', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: false, user: null, token: null },
        },
        initialEntries: ['/admin/dashboard'],
      });

      // The real Login component should render
      // Depending on the exact text in your Login component, you might need to adjust this
      // Usually there is a "Sign in" or "Login" heading or button
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders the admin layout and dashboard when authenticated', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/dashboard'],
      });

      // Assuming Dashboard or Layout has some recognizable text like 'Dashboard'
      const dashboardElements = screen.getAllByText(/Dashboard/i);
      expect(dashboardElements.length).toBeGreaterThan(0);
    });
  });
});
