import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAllUsers,
  useAllUsersInfinite,
  useToggleUserStatus,
  useDeleteUser,
  useRestoreUser,
} from '../hooks/useAdminQueries';

const BASE_URL = 'http://bandhan-setu-prod.eba-am6hwsad.ap-south-1.elasticbeanstalk.com';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Sample raw user from the API (snake_case)
const rawApiUser = {
  id: 'u-1',
  platform_id: 'BS-001',
  firstName: 'Rahul',
  lastName: 'Sharma',
  email: 'rahul@test.com',
  mobile_number: '9876543210',
  country_code: '+91',
  status: 1,
  deleted_at: null,
  gender: 'Male',
  age: 28,
};

// Expected normalized user (camelCase)
const normalizedUser = {
  id: 'u-1',
  platformId: 'BS-001',
  firstName: 'Rahul',
  lastName: 'Sharma',
  email: 'rahul@test.com',
  mobile: '9876543210',
  countryCode: '+91',
  rawStatus: 1,
  status: 'approved',
  isDeleted: false,
  gender: 'Male',
  age: 28,
};

describe('useAllUsers', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should fetch and normalize users successfully (array response)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [rawApiUser],
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAllUsers({ limit: 10, offset: 0 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data.users).toHaveLength(1);
    expect(result.current.data.users[0]).toMatchObject({
      id: 'u-1',
      firstName: 'Rahul',
      email: 'rahul@test.com',
      rawStatus: 1,
      status: 'approved',
      isDeleted: false,
    });
  });

  it('should fetch and normalize users when wrapped in { users: [...] }', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [rawApiUser], total: 1 }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAllUsers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.users).toHaveLength(1);
    expect(result.current.data.pagination.total).toBe(1);
  });

  it('should throw an error on API failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Unauthorized' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAllUsers(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Unauthorized');
  });

  it('should include search and status params in the query URL', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const wrapper = createWrapper();
    renderHook(() => useAllUsers({ search: 'Rahul', status: 1, limit: 10, offset: 0 }), { wrapper });

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain('search=Rahul');
    expect(url).toContain('status=1');
  });
});

describe('useAllUsersInfinite', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should fetch first page of infinite users and provide pagination info', async () => {
    // Return 25 users to simulate a full first page
    const twentyFiveUsers = Array.from({ length: 25 }, (_, i) => ({
      ...rawApiUser,
      id: `u-${i}`,
      email: `user${i}@test.com`,
    }));

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: twentyFiveUsers }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAllUsersInfinite({ limit: 25 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const page = result.current.data.pages[0];
    expect(page.users).toHaveLength(25);
    // Full page means hasMore=true → nextOffset is set
    expect(page.pagination.hasMore).toBe(true);
    expect(page.pagination.nextOffset).toBe(25);
  });

  it('should indicate no more pages when response is smaller than limit', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [rawApiUser] }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAllUsersInfinite({ limit: 25 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const page = result.current.data.pages[0];
    expect(page.pagination.hasMore).toBe(false);
    expect(page.pagination.nextOffset).toBeUndefined();
    expect(result.current.hasNextPage).toBe(false);
  });

  it('should throw an error on API failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to fetch users' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAllUsersInfinite(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Failed to fetch users');
  });
});

describe('useToggleUserStatus', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should PATCH user status and return { userId, status }', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleUserStatus(), { wrapper });

    result.current.mutate({ userId: 'u-1', status: 0 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ userId: 'u-1', status: 0 });

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/users/status/u-1`,
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('should throw error on PATCH failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to update user status' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleUserStatus(), { wrapper });

    result.current.mutate({ userId: 'u-1', status: 0 });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Failed to update user status');
  });
});

describe('useDeleteUser', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should DELETE a user by ID and return the userId', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    result.current.mutate('u-99');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe('u-99');

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/users/u-99`,
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('should throw error when delete fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to delete user' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    result.current.mutate('u-99');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Failed to delete user');
  });
});

describe('useRestoreUser', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should PATCH restore endpoint and return the userId', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useRestoreUser(), { wrapper });

    result.current.mutate('u-42');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe('u-42');

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/users/restore/u-42`,
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('should throw error when restore fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to restore user' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useRestoreUser(), { wrapper });

    result.current.mutate('u-42');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Failed to restore user');
  });
});
