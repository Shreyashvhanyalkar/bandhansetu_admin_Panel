import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useReligions,
  useSendNotification,
  useUploadBanner,
  useAllUsersInfinite,
} from '../hooks/useNotificationQueries';

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

// ─── useReligions ─────────────────────────────────────────────────────────────

describe('useReligions', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should fetch religions and return raw API data', async () => {
    const mockReligions = [{ id: 1, religion_name: 'Hindu' }, { id: 2, religion_name: 'Muslim' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReligions,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useReligions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockReligions);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/religion`,
      expect.any(Object)
    );
  });

  it('should throw error when religion fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to fetch religions' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useReligions(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Failed to fetch religions');
  });
});

// ─── useSendNotification ──────────────────────────────────────────────────────

describe('useSendNotification', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should POST notification payload to the send endpoint successfully', async () => {
    const mockResponse = { successfulPushes: 150, failedPushes: 0, totalAttempted: 150 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockResponse),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSendNotification(), { wrapper });

    const payload = {
      title: 'Welcome',
      shortDescription: 'Hello everyone',
      notificationType: 'Admin Group',
      notificationCategory: 'Text',
    };
    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResponse);

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/notifications/send`,
      expect.objectContaining({ method: 'POST' })
    );

    // Verify payload was sent in body
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.title).toBe('Welcome');
    expect(body.notificationType).toBe('Admin Group');
  });

  it('should throw error when notification send fails (non-OK response)', async () => {
    const errorResponse = { message: 'No target users found.' };
    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify(errorResponse),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSendNotification(), { wrapper });

    result.current.mutate({ title: 'Test', shortDescription: 'Test desc' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('No target users found.');
  });

  it('should throw error when server returns non-JSON body', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Internal Server Error',
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSendNotification(), { wrapper });

    result.current.mutate({ title: 'Test' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toContain('Server error');
  });
});

// ─── useUploadBanner ──────────────────────────────────────────────────────────

describe('useUploadBanner', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should POST FormData with the image to the upload endpoint', async () => {
    const mockUploadResult = [{ fileName: 'banner.png', url: 'https://s3.example.com/banner.png' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockUploadResult),
    });

    const file = new File(['image data'], 'banner.png', { type: 'image/png' });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUploadBanner(), { wrapper });

    result.current.mutate(file);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUploadResult);

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/upload-banner`,
      expect.objectContaining({ method: 'POST' })
    );

    // Verify it used FormData (no Content-Type header — browser sets multipart boundary)
    const callArgs = global.fetch.mock.calls[0];
    expect(callArgs[1].body).toBeInstanceOf(FormData);
  });

  it('should throw error when banner upload fails', async () => {
    const errorBody = { message: 'File too large' };
    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify(errorBody),
    });

    const file = new File(['large image'], 'big.jpg', { type: 'image/jpeg' });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUploadBanner(), { wrapper });

    result.current.mutate(file);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('File too large');
  });
});

// ─── useAllUsersInfinite (notification context) ───────────────────────────────

describe('useAllUsersInfinite (notification select)', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should fetch users for select dropdown with a search term in the URL', async () => {
    const mockUsers = [
      {
        id: 'u-1',
        firstName: 'Anita',
        lastName: 'Singh',
        email: 'anita@test.com',
        status: 1,
      },
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAllUsersInfinite('Anita'), { wrapper });

    result.current.fetchNextPage();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const page = result.current.data.pages[0];
    expect(page.users).toHaveLength(1);
    expect(page.users[0].firstName).toBe('Anita');

    // Verify search term in URL
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain('search=Anita');
  });

  it('should map raw API user to normalized format', async () => {
    const rawUser = {
      id: 'u-1',
      first_name: 'Ravi',
      last_name: 'Kumar',
      email: 'ravi@test.com',
      mobile_number: '9999999999',
      country_code: '+91',
      status: 0,
      deleted_at: null,
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [rawUser],
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAllUsersInfinite(''), { wrapper });

    result.current.fetchNextPage();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const user = result.current.data.pages[0].users[0];
    expect(user.firstName).toBe('Ravi');
    expect(user.lastName).toBe('Kumar');
    expect(user.mobile).toBe('9999999999');
    expect(user.rawStatus).toBe(0);
    expect(user.status).toBe('pending');
    expect(user.isDeleted).toBe(false);
  });

  it('should throw error when users fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to fetch users' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAllUsersInfinite(), { wrapper });

    result.current.fetchNextPage();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Failed to fetch users');
  });
});
