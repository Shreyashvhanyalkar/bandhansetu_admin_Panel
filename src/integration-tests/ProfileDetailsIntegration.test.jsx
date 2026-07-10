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

const renderWithProviders = (ui, { preloadedState, initialEntries = ['/admin/profile/user123'] } = {}) => {
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

// Shape must match what ProfileDetails.jsx actually destructures:
// profileData.userDetails, profileData.userPrimaryDetails, profileData.userReligionDetails, etc.
// fetchUserProfile returns res.json() directly — no "data" wrapper.
const mockUserProfile = {
  userDetails: {
    firstName: 'Arjun',
    lastName: 'Mehta',
    platformId: 'BS10023',
    mobileNumber: '9876543210',
    countryCode: '+91',
    email: 'arjun.mehta@email.com',
    age: 29,
    dateOfBirth: '1995-06-15',
    gender: 'Male',
    profileCreatedBy: 'Self',
    profilePicture: null,
  },
  userPrimaryDetails: {
    maritalStatus: 'Never Married',
    mothertongueName: 'Hindi',
    childStatus: 'No',
    numberOfChildrens: 0,
    cityName: 'Mumbai',
    stateName: 'Maharashtra',
    countryName: 'India',
  },
  userReligionDetails: {
    religionName: 'Hindu',
    castName: 'Brahmin',
    subcastName: 'Deshastha',
  },
  userEducationalDetails: {},
  userWorkingDetails: {},
  userLifeStyleDetails: {},
  userAboutMeDetails: {},
  userAddressDetails: {},
  userFamilyDetails: {},
};

describe('Profile Details Integration', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/auth/admin/userprofile/') || url.includes('user123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserProfile),
        });
      }
      if (url.includes('/api/auth/user/gallery/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
          blob: () => Promise.resolve(new Blob([], { type: 'image/jpeg' })),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  it('renders profile details page heading', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/My Profile/i)).toBeInTheDocument();
    });
  });

  it('renders Basic Details section', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Basic Details/i)).toBeInTheDocument();
    });
  });

  it('renders contact info within Basic Details', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/arjun.mehta@email.com/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/9876543210/)).toBeInTheDocument();
  });

  it('renders status action buttons', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/My Profile/i)).toBeInTheDocument();
    });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders back navigation button', async () => {
    renderWithProviders(<AppRoutes />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { name: 'Admin' }, token: 'fake-token' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Basic Details/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Back/i)).toBeInTheDocument();
  });
});