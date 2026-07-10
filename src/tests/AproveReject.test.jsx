import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import ApproveReject from '../pages/admin/AproveReject';
import authReducer from '../features/auth/Authslice';
import * as adminQueries from '../hooks/useAdminQueries';

// Mock intersection observer (used for infinite scroll)
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: false }),
}));

// Mock all admin query hooks used by the component
vi.mock('../hooks/useAdminQueries', () => ({
  useAllUsers: vi.fn(),
  useAllUsersInfinite: vi.fn(),
  useToggleUserStatus: vi.fn(),
  useDeleteUser: vi.fn(),
  useRestoreUser: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe('ApproveReject Component', () => {
  const mockUsers = [
    {
      id: 'user-1',
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul@test.com',
      mobile: '9876543210',
      countryCode: '+91',
      platformId: 'BS-100234',
      rawStatus: 1,
      isDeleted: false,
    },
    {
      id: 'user-2',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya@test.com',
      mobile: '9876543211',
      countryCode: '+91',
      platformId: 'BS-100235',
      rawStatus: 0,
      isDeleted: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminQueries.useAllUsersInfinite).mockReturnValue({
      data: {
        pages: [{ users: mockUsers }],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(adminQueries.useToggleUserStatus).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      variables: null,
    });

    vi.mocked(adminQueries.useDeleteUser).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    vi.mocked(adminQueries.useRestoreUser).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it('should render User Management heading and list users from the API', () => {
    renderWithProviders(<ApproveReject />);

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('Priya Patel')).toBeInTheDocument();
    expect(screen.getByText('rahul@test.com')).toBeInTheDocument();
  });

  it('should render a search box input', () => {
    renderWithProviders(<ApproveReject />);
    const searchBox = screen.getByPlaceholderText('Search by name, email or mobile...');
    expect(searchBox).toBeInTheDocument();
  });

  it('should render Export CSV and Deleted Users buttons in toolbar', () => {
    renderWithProviders(<ApproveReject />);
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Deleted Users')).toBeInTheDocument();
  });

  it('should render toggle buttons for each active (non-deleted) user row', () => {
    renderWithProviders(<ApproveReject />);

    // Toggle component renders buttons with class 'relative inline-flex'
    const allButtons = screen.getAllByRole('button');
    const toggleButtons = allButtons.filter(btn =>
      btn.className.includes('relative inline-flex')
    );
    // One toggle per user (both users are not deleted)
    expect(toggleButtons.length).toBe(2);
  });

  it('should call toggleMutation with status=0 when an active user toggle is clicked', async () => {
    const mockToggleMutate = vi.fn();
    vi.mocked(adminQueries.useToggleUserStatus).mockReturnValue({
      mutate: mockToggleMutate,
      isPending: false,
      variables: null,
    });

    renderWithProviders(<ApproveReject />);

    const allButtons = screen.getAllByRole('button');
    const toggleButtons = allButtons.filter(btn =>
      btn.className.includes('relative inline-flex')
    );

    // Rahul (user-1) has rawStatus=1 (active), clicking should deactivate -> status: 0
    fireEvent.click(toggleButtons[0]);

    expect(mockToggleMutate).toHaveBeenCalledWith(
      { userId: 'user-1', status: 0 },
      expect.any(Object)
    );
  });

  it('should navigate to profile page when Full Profile (eye) button is clicked', () => {
    renderWithProviders(<ApproveReject />);

    const eyeButtons = screen.getAllByTitle('Full Profile');
    fireEvent.click(eyeButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/profile/user-1');
  });

  it('should open the delete confirmation modal when Delete User button is clicked', async () => {
    renderWithProviders(<ApproveReject />);

    const trashButtons = screen.getAllByTitle('Delete User');
    fireEvent.click(trashButtons[0]);

    // Modal title is "Delete User Account"
    await waitFor(() => {
      expect(screen.getByText('Delete User Account')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to soft-delete "Rahul/)).toBeInTheDocument();
    });
  });

  it('should show loading skeleton rows when data is being fetched', () => {
    vi.mocked(adminQueries.useAllUsersInfinite).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });

    renderWithProviders(<ApproveReject />);

    // Should NOT render user names when loading
    expect(screen.queryByText('Rahul Sharma')).not.toBeInTheDocument();
  });

  it('should show "No users found." message when list is empty', () => {
    vi.mocked(adminQueries.useAllUsersInfinite).mockReturnValue({
      data: { pages: [{ users: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });

    renderWithProviders(<ApproveReject />);

    expect(screen.getByText('No users found.')).toBeInTheDocument();
  });
});
