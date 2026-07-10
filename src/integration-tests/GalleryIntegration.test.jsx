import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (ui, { preloadedState, initialEntries = ['/admin/gallery/user123'] } = {}) => {
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

const mockGalleryImages = [
  { _id: 'img1', fileName: 'photo1.jpg', isProfilePicture: true },
  { _id: 'img2', fileName: 'photo2.jpg', isProfilePicture: false },
];

describe('Gallery Integration', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/auth/user/gallery/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGalleryImages),
          blob: () => Promise.resolve(new Blob(['image'], { type: 'image/jpeg' })),
        });
      }
      if (url.includes('/api/file/download/')) {
        return Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(['image'], { type: 'image/jpeg' })),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });
    });
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  it('renders gallery page with title', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/My Photo Gallery/i)).toBeInTheDocument();
    });
  });

  it('shows back button on gallery page', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/My Photo Gallery/i)).toBeInTheDocument();
    });
    expect(screen.getByText('←')).toBeInTheDocument();
  });
});
