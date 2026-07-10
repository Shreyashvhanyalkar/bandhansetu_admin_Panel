import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useUserProfile } from '../hooks/useUserProfile';

// The actual BASE_URL used in the hooks (from .env)
const BASE_URL = 'http://bandhan-setu-prod.eba-am6hwsad.ap-south-1.elasticbeanstalk.com';

// Mock useDispatch
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
}));

// Mock the updateUser action from Authslice
vi.mock('../features/auth/Authslice', () => ({
  updateUser: vi.fn((user) => ({ type: 'auth/updateUser', payload: user })),
}));

describe('useUserProfile Hook', () => {
  let queryClient;
  let mockDispatch;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockDispatch = vi.fn();
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    localStorage.clear();
    global.fetch = vi.fn();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should NOT fetch if token is absent from localStorage (query is disabled)', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    // Query is disabled — should stay pending with fetchStatus idle
    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should fetch profile and update Redux store on success', async () => {
    localStorage.setItem('token', 'valid-token-xyz');
    const mockUser = { id: 1, name: 'Admin User', email: 'admin@test.com' };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ user: mockUser }),
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify returned data
    expect(result.current.data).toEqual(mockUser);

    // Verify correct API endpoint was called
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/admin/profile`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-token-xyz',
        }),
      })
    );

    // Verify Redux was updated
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'auth/updateUser',
      payload: mockUser,
    });
  });

  it('should clear localStorage and throw on 401 Unauthorized (session expiry)', async () => {
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Admin' }));

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error.message).toBe('Session expired');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should throw a generic error on any other non-OK response', async () => {
    localStorage.setItem('token', 'valid-token');

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error.message).toBe('Failed to fetch user profile');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should NOT dispatch to Redux if API returns no user data', async () => {
    localStorage.setItem('token', 'valid-token');

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ user: null }),
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
