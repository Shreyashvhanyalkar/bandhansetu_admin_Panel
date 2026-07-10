import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import NotificationManagement from '../pages/admin/Notifications';
import authReducer from '../features/auth/Authslice';
import * as notificationQueries from '../hooks/useNotificationQueries';
import * as locationHooks from '../hooks/useLocationManagement';

// Mock the query hooks
vi.mock('../hooks/useNotificationQueries', () => ({
  useReligions: vi.fn(),
  useSendNotification: vi.fn(),
  useUploadBanner: vi.fn(),
  useAllUsersInfinite: vi.fn(),
}));

vi.mock('../hooks/useLocationManagement', () => ({
  useGetCountries: vi.fn(),
  useGetStates: vi.fn(),
  useGetCities: vi.fn(),
}));

const renderWithProviders = (ui) => {
  const store = configureStore({
    reducer: { auth: authReducer },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </Provider>
  );
};

describe('NotificationManagement Component', () => {
  let mockMutate;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate = vi.fn();

    vi.mocked(notificationQueries.useReligions).mockReturnValue({
      data: [{ id: '1', religion_name: 'Hindu' }],
      isLoading: false,
    });

    vi.mocked(notificationQueries.useSendNotification).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    vi.mocked(notificationQueries.useUploadBanner).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue([{ fileName: 'banner.png' }]),
      isPending: false,
    });

    vi.mocked(notificationQueries.useAllUsersInfinite).mockReturnValue({
      data: { pages: [{ users: [] }] },
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      refetch: vi.fn(),
    });

    vi.mocked(locationHooks.useGetCountries).mockReturnValue({ data: [], isLoading: false });
    vi.mocked(locationHooks.useGetStates).mockReturnValue({ data: [], isLoading: false });
    vi.mocked(locationHooks.useGetCities).mockReturnValue({ data: [], isLoading: false });
  });

  it('should render the page heading correctly', () => {
    renderWithProviders(<NotificationManagement />);
    // The page header contains "Send Notification" text
    expect(screen.getByText('Send Notification')).toBeInTheDocument();
  });

  it('should render delivery mode type card buttons', () => {
    renderWithProviders(<NotificationManagement />);
    // The two delivery mode type cards
    expect(screen.getByText('Admin Personalize')).toBeInTheDocument();
    expect(screen.getByText('Admin Group')).toBeInTheDocument();
  });

  it('should display validation errors when Title and Short Description are empty on submit', async () => {
    renderWithProviders(<NotificationManagement />);

    // Click Send Push button without filling form
    const sendBtn = screen.getByRole('button', { name: /Send Push/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Short description is required')).toBeInTheDocument();
    });
  });

  it('should show target user validation error when Personalize mode has no recipients', async () => {
    renderWithProviders(<NotificationManagement />);

    // Fill Title input (label is "Title")
    const titleInput = screen.getByPlaceholderText('e.g., Profile Verification Successful');
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });

    // Fill Short Description input
    const shortDescInput = screen.getByPlaceholderText('Brief summary of your notification');
    fireEvent.change(shortDescInput, { target: { value: 'Test description' } });

    // Submit without selecting users (Admin Personalize mode)
    const sendBtn = screen.getByRole('button', { name: /Send Push/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText('Please select at least one user')).toBeInTheDocument();
    });
  });

  it('should call send mutation when Admin Group type is selected and form is valid', async () => {
    renderWithProviders(<NotificationManagement />);

    // Switch to Admin Group delivery mode
    fireEvent.click(screen.getByText('Admin Group'));

    // Fill Title
    const titleInput = screen.getByPlaceholderText('e.g., Profile Verification Successful');
    fireEvent.change(titleInput, { target: { value: 'Welcome to BandhanSetu' } });

    // Fill Short Description
    const shortDescInput = screen.getByPlaceholderText('Brief summary of your notification');
    fireEvent.change(shortDescInput, { target: { value: 'New updates are live!' } });

    // Send the notification
    const sendBtn = screen.getByRole('button', { name: /Send Push/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Welcome to BandhanSetu',
          shortDescription: 'New updates are live!',
          notificationType: 'Admin Group',
          notificationCategory: 'Text',
        }),
        expect.any(Object)
      );
    });
  });
});
