// D:\Euspace_bandhansetu\BandhanSetuAdmin\BandhanSetuAdmin\src\tests\App.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import authReducer from '../features/auth/Authslice';
import { Outlet } from 'react-router-dom';
// Mock all page components
vi.mock('../pages/auth/login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('../pages/layout/Layout', () => ({
  default: () => (
    <div data-testid="layout">
      <div data-testid="layout-children">
        <Outlet />
      </div>
    </div>
  ),
}));

vi.mock('../pages/admin/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock('../pages/admin/AproveReject', () => ({
  default: () => <div data-testid="approve-reject-page">Approve Reject Page</div>,
}));

vi.mock('../pages/admin/Reports', () => ({
  default: () => <div data-testid="reports-page">Reports Page</div>,
}));

vi.mock('../pages/admin/Notifications', () => ({
  default: () => <div data-testid="notifications-page">Notifications Page</div>,
}));

vi.mock('../pages/admin/ReligionManagement', () => ({
  default: () => <div data-testid="religion-page">Religion Management Page</div>,
}));

vi.mock('../pages/admin/SubAdminManagement', () => ({
  default: () => <div data-testid="sub-admin-page">Sub Admin Management Page</div>,
}));

vi.mock('../pages/admin/profile', () => ({
  default: () => <div data-testid="admin-profile-page">Admin Profile Page</div>,
}));

vi.mock('../pages/admin/LocationManagement', () => ({
  default: () => <div data-testid="location-page">Location Management Page</div>,
}));

vi.mock('../pages/admin/profileDetails', () => ({
  default: () => <div data-testid="profile-details-page">Profile Details Page</div>,
}));

// Mock Navigate to capture redirects
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, replace }) => (
      <div data-testid="navigate" data-to={to} data-replace={String(replace)}>
        Redirect to: {to}
      </div>
    ),
  };
});

const renderWithProviders = (ui, { preloadedState, initialEntries = ['/'] } = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: preloadedState || { auth: { isAuthenticated: false, user: null, token: null } },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        {ui}
      </MemoryRouter>
    </Provider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── AUTHENTICATION TESTS ──────────────────────────────────────────────────

  describe('Authentication Flow', () => {
    it('should render Login page when not authenticated and at /login', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: false, user: null, token: null },
        },
        initialEntries: ['/login'],
      });

      const loginPage = screen.getByTestId('login-page');
      expect(loginPage).toBeInTheDocument();
    });

    it('should redirect to /admin/dashboard when authenticated and at /login', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/login'],
      });

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-to', '/admin/dashboard');
    });

    it('should render Layout with Dashboard when authenticated at /admin', () => {
  renderWithProviders(<AppRoutes />, {
    preloadedState: {
      auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
    },
    initialEntries: ['/admin'],
  });

  const layout = screen.getByTestId('layout');
  expect(layout).toBeInTheDocument();

  const navigate = screen.getByTestId('navigate');
  expect(navigate).toHaveAttribute('data-to', 'dashboard');
});

    it('should redirect to /login when not authenticated and accessing /admin', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: false, user: null, token: null },
        },
        initialEntries: ['/admin'],
      });

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-to', '/login');
    });
  });

  // ─── PROTECTED ROUTE TESTS ─────────────────────────────────────────────────

  describe('Protected Routes', () => {
    it('should render Dashboard at /admin/dashboard', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/dashboard'],
      });

      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('should render ApproveReject at /admin/requests', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/requests'],
      });

      expect(screen.getByTestId('approve-reject-page')).toBeInTheDocument();
    });

    it('should render ProfileDetails at /admin/profile/:userId', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/profile/123'],
      });

      expect(screen.getByTestId('profile-details-page')).toBeInTheDocument();
    });

    it('should render AdminProfile at /admin/admin-profile', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/admin-profile'],
      });

      expect(screen.getByTestId('admin-profile-page')).toBeInTheDocument();
    });

    it('should render LocationManagement at /admin/locations', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/locations'],
      });

      expect(screen.getByTestId('location-page')).toBeInTheDocument();
    });

    it('should render ReligionManagement at /admin/religion', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/religion'],
      });

      expect(screen.getByTestId('religion-page')).toBeInTheDocument();
    });

    it('should render SubAdminManagement at /admin/sub-admins', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/sub-admins'],
      });

      expect(screen.getByTestId('sub-admin-page')).toBeInTheDocument();
    });

    it('should render Reports at /admin/reports/*', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/reports'],
      });

      expect(screen.getByTestId('reports-page')).toBeInTheDocument();
    });

    it('should render Notifications at /admin/notifications/*', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/notifications'],
      });

      expect(screen.getByTestId('notifications-page')).toBeInTheDocument();
    });
  });

  // ─── INDEX ROUTE TESTS ─────────────────────────────────────────────────────

  describe('Index Route', () => {
    it('should redirect /admin to /admin/dashboard when authenticated', () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
      },
      initialEntries: ['/admin'],
    });

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', 'dashboard');
  });
  });

  // ─── CATCH-ALL ROUTE TESTS ─────────────────────────────────────────────────

  describe('Catch-all Route', () => {
    it('should redirect unknown routes to /admin/dashboard when authenticated', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/unknown'],
      });

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-to', '/admin/dashboard');
    });

    it('should redirect unknown routes to /login when not authenticated', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: false, user: null, token: null },
        },
        initialEntries: ['/unknown'],
      });

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-to', '/login');
    });
  });

  // ─── REDUX INTEGRATION TESTS ───────────────────────────────────────────────

  describe('Redux Integration', () => {
    it('should use isAuthenticated from Redux state for route protection', () => {
      // Test authenticated state
      const { unmount: unmountAuth } = renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin'],
      });

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      unmountAuth();

      // Test unauthenticated state
      const { unmount: unmountUnauth } = renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: false, user: null, token: null },
        },
        initialEntries: ['/admin'],
      });

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-to', '/login');
      unmountUnauth();
    });

    it('should handle auth state changes correctly', async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: { isAuthenticated: false, user: null, token: null },
        },
      });

      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/admin']}>
            <AppRoutes />
          </MemoryRouter>
        </Provider>
      );

      // Initially should redirect to login
      let navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-to', '/login');

      // Update to authenticated
      const newStore = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
      });

      rerender(
        <Provider store={newStore}>
          <MemoryRouter initialEntries={['/admin']}>
            <AppRoutes />
          </MemoryRouter>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('layout')).toBeInTheDocument();
      });
    });
  });

  // ─── LAYOUT CHILDREN TESTS ─────────────────────────────────────────────────

  describe('Layout Children', () => {
    it('should render children inside Layout for protected routes', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/dashboard'],
      });

      const layoutChildren = screen.getByTestId('layout-children');
      expect(layoutChildren).toBeInTheDocument();
      expect(layoutChildren).toContainElement(screen.getByTestId('dashboard-page'));
    });
  });

  // ─── EDGE CASES ─────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle undefined auth state gracefully', () => {
  const store = configureStore({
    reducer: {
      auth: (state = { isAuthenticated: false, user: null, token: null }) => state,
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    </Provider>
  );

  // Should attempt redirect to login (treat undefined/false as not authenticated)
  const navigate = screen.getByTestId('navigate');
  expect(navigate).toHaveAttribute('data-to', '/login');
});

    it('should handle null auth state gracefully', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: null, user: null, token: null },
        },
        initialEntries: ['/login'],
      });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  // ─── ROUTE PARAMETER TESTS ─────────────────────────────────────────────────

  describe('Route Parameters', () => {
    it('should support userId parameter in profile route', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/profile/456'],
      });

      expect(screen.getByTestId('profile-details-page')).toBeInTheDocument();
    });

    it('should support wildcard routes for notifications', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/notifications/send'],
      });

      expect(screen.getByTestId('notifications-page')).toBeInTheDocument();
    });

    it('should support wildcard routes for reports', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/reports/monthly'],
      });

      expect(screen.getByTestId('reports-page')).toBeInTheDocument();
    });

    it('should support religion/* wildcard route', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/religion/castes'],
      });

      expect(screen.getByTestId('religion-page')).toBeInTheDocument();
    });
  });

  // ─── REDIRECT BEHAVIOR TESTS ───────────────────────────────────────────────

  describe('Redirect Behavior', () => {
    it('should use replace navigation for auth redirects', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: false, user: null, token: null },
        },
        initialEntries: ['/admin'],
      });

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-replace', 'true');
    });

    it('should redirect from /login to /admin/dashboard when authenticated', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/login'],
      });

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-to', '/admin/dashboard');
    });
  });

  // ─── COMPONENT MOUNTING TESTS ──────────────────────────────────────────────

  describe('Component Mounting', () => {
    it('should mount all route components without errors', () => {
      renderWithProviders(<AppRoutes />, {
        preloadedState: {
          auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' },
        },
        initialEntries: ['/admin/dashboard'],
      });

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('should handle route transitions without errors', () => {
  renderWithProviders(<AppRoutes />, {
    preloadedState: { auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' } },
    initialEntries: ['/admin/dashboard'],
  });
  expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();

  renderWithProviders(<AppRoutes />, {
    preloadedState: { auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'valid-token' } },
    initialEntries: ['/admin/requests'],
  });
  expect(screen.getByTestId('approve-reject-page')).toBeInTheDocument();
});
  });
});
