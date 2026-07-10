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

const authState = {
  auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
};

describe('Layout Integration', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  // ─── Sidebar ────────────────────────────────────────────────────────────────
  describe('Sidebar', () => {
    it('renders BandhanSetu brand in sidebar', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /BandhanSetu/i, level: 1 })).toBeInTheDocument();
      });
    });

    it('renders Main Navigation label', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        expect(screen.getByText(/Main Navigation/i)).toBeInTheDocument();
      });
    });

    it('renders Dashboard nav link', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        const links = screen.getAllByText(/Dashboard/i);
        expect(links.length).toBeGreaterThan(0);
      });
    });

    it('renders User Management nav link', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        expect(screen.getByText(/User Management/i)).toBeInTheDocument();
      });
    });

    it('renders Reports nav link', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        expect(screen.getByText(/Reports & Moderation/i)).toBeInTheDocument();
      });
    });

    it('renders Notifications nav link', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
      });
    });

    it('renders Religion Management nav link', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        expect(screen.getByText(/Religion & Community/i)).toBeInTheDocument();
      });
    });

    it('renders Locations nav link', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        expect(screen.getByText(/Location Management/i)).toBeInTheDocument();
      });
    });

    it('renders Sub Admins nav link', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        expect(screen.getByText(/Sub Admin/i)).toBeInTheDocument();
      });
    });

    it('renders Logout button in sidebar', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();
      });
    });
  });

  // ─── Navbar ────────────────────────────────────────────────────────────────
  describe('Navbar', () => {
    it('renders Matrimony Admin label in navbar', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        expect(screen.getByText(/Matrimony Admin/i)).toBeInTheDocument();
      });
    });

    it('renders admin user name in navbar', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });
      await waitFor(() => {
        const userEls = screen.getAllByText(/Admin/i);
        expect(userEls.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── Routing via Sidebar ────────────────────────────────────────────────────
  describe('Sidebar Navigation Routing', () => {
    it('navigates to Religion page when Religion link is clicked', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });

      await waitFor(() => {
        expect(screen.getByText(/Religion & Community/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Religion & Community/i));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Religion & Community/i })).toBeInTheDocument();
      });
    });

    it('navigates to Notifications page when Notifications link is clicked', async () => {
      renderWithProviders(<AppRoutes />, { preloadedState: authState });

      await waitFor(() => {
        expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByText(/Notifications/i)[0]);

      await waitFor(() => {
        expect(screen.getByText(/Send Push/i)).toBeInTheDocument();
      });
    });
  });
});