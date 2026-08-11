import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import authReducer from '../features/auth/Authslice';
import adminReducer from '../features/Admin/Adminslice';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart">Bar Chart Mock</div>,
  Line: () => <div data-testid="mock-line-chart">Line Chart Mock</div>,
  Pie: () => <div data-testid="mock-pie-chart">Pie Chart Mock</div>,
  Doughnut: () => <div data-testid="mock-doughnut-chart">Doughnut Chart Mock</div>,
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui, { preloadedState, initialEntries = ['/login'] } = {}) => {
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

describe('Login Integration', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'fake-token', user: { name: 'Admin' } }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  it('renders login page heading', () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } },
    });
    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument();
    expect(screen.getByAltText(/Bandhan Setu Logo/i)).toBeInTheDocument();
  });

  it('renders email input field', () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } },
    });
    expect(screen.getByPlaceholderText(/Email Address \*/i)).toBeInTheDocument();
  });

  it('renders password input field', () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } },
    });
    expect(screen.getByPlaceholderText(/Password \*/i)).toBeInTheDocument();
  });

  it('renders Sign In button', () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } },
    });
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows typing in email and password fields', () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } },
    });

    const emailInput = screen.getByPlaceholderText(/Email Address \*/i);
    const passwordInput = screen.getByPlaceholderText(/Password \*/i);

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('admin@test.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('redirects authenticated user away from login to dashboard', () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: { auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' } },
      initialEntries: ['/login'],
    });

    const dashboardElements = screen.getAllByText(/Dashboard/i);
    expect(dashboardElements.length).toBeGreaterThan(0);
  });

  it('shows validation when form submitted empty', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } },
    });

    const signInBtn = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInBtn);

    const emailInput = screen.getByPlaceholderText(/Email Address \*/i);
    expect(emailInput).toBeRequired();
  });
});