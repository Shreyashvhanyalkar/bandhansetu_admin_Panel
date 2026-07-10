import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { useLogin, useLogout, useRegister } from '../hooks/useAuthMutations';
import authReducer from '../features/auth/Authslice';

const BASE_URL = 'http://bandhan-setu-prod.eba-am6hwsad.ap-south-1.elasticbeanstalk.com';

// Create a full wrapper: QueryClient + Redux Provider
const createWrapper = (store) => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        {children}
      </Provider>
    </QueryClientProvider>
  );
};

describe('useLogin', () => {
  let store;

  beforeEach(() => {
    store = configureStore({ reducer: { auth: authReducer } });
    global.fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should login successfully and dispatch loginSuccess to Redux', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        deviceDetails: { sessionKey: 'session-abc-123' },
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        id: 99,
      }),
    });

    const wrapper = createWrapper(store);
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: 'admin@test.com', password: 'pass123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify Redux store updated with token
    const state = store.getState().auth;
    expect(state.token).toBe('session-abc-123');
    expect(state.isAuthenticated).toBe(true);
    expect(state.user.name).toBe('Admin User');
    expect(state.user.email).toBe('admin@test.com');

    // Verify correct endpoint was called
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/admin/login`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should throw an error when API returns non-OK response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials.' }),
    });

    const wrapper = createWrapper(store);
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: 'wrong@test.com', password: 'badpass' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Invalid credentials.');
  });

  it('should throw "no session token" error if response has no token field', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        firstName: 'Admin',
        email: 'admin@test.com',
        // No token, no sessionKey
      }),
    });

    const wrapper = createWrapper(store);
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: 'admin@test.com', password: 'pass' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toMatch(/no session token/i);
  });

  it('should include deviceInfo in the request body', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'token-xyz',
        firstName: 'Test',
        email: 'test@test.com',
      }),
    });

    const wrapper = createWrapper(store);
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: 'test@test.com', password: 'pass' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const callArgs = global.fetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body).toHaveProperty('deviceInfo');
    expect(body.deviceInfo).toHaveProperty('deviceType', 'web');
    expect(body.deviceInfo).toHaveProperty('appVersion', '1.0.0');
  });
});

describe('useLogout', () => {
  let store;

  beforeEach(() => {
    store = configureStore({ reducer: { auth: authReducer } });
    global.fetch = vi.fn();
    localStorage.setItem('token', 'logout-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call logout API and dispatch logout action on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logged out' }),
    });

    const wrapper = createWrapper(store);
    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Redux should be cleared
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/logout`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should still dispatch logout even if API call fails (always clear local state)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Server error' }),
    });

    const wrapper = createWrapper(store);
    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // onSettled always dispatches logout
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
  });
});

describe('useRegister', () => {
  let store;

  beforeEach(() => {
    store = configureStore({ reducer: { auth: authReducer } });
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully register a new admin', async () => {
    const mockResponse = { id: 1, name: 'New Admin', email: 'new@admin.com' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const wrapper = createWrapper(store);
    const { result } = renderHook(() => useRegister(), { wrapper });

    result.current.mutate({ name: 'New Admin', email: 'new@admin.com', password: 'pass123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/admin/register`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should throw an error when registration fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Email already in use' }),
    });

    const wrapper = createWrapper(store);
    const { result } = renderHook(() => useRegister(), { wrapper });

    result.current.mutate({ name: 'Test', email: 'existing@test.com', password: 'pass' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Email already in use');
  });
});
