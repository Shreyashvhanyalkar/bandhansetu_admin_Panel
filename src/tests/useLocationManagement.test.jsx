import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useGetCountries,
  useAddCountry,
  useEditCountry,
  useDeleteCountry,
  useGetStates,
  useAddState,
  useEditState,
  useDeleteState,
  useGetCities,
  useAddCity,
  useEditCity,
  useDeleteCity,
} from '../hooks/useLocationManagement';

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

// ─── COUNTRIES ────────────────────────────────────────────────────────────────

describe('useGetCountries', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should fetch countries as a direct array', async () => {
    const mockData = [{ id: 1, country_name: 'India' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetCountries(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/country`,
      expect.any(Object)
    );
  });

  it('should fetch countries from { countries: [...] } wrapper', async () => {
    const mockData = [{ id: 1, country_name: 'India' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ countries: mockData }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetCountries(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it('should throw error when countries fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Unauthorized' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetCountries(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Unauthorized');
  });
});

describe('useAddCountry', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should POST a new country successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, id: 5, country_name: 'Australia' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddCountry(), { wrapper });

    result.current.mutate({ country_name: 'Australia' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/country`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should throw error when add country fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: false, message: 'Country already exists' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddCountry(), { wrapper });

    result.current.mutate({ country_name: 'India' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Country already exists');
  });
});

describe('useEditCountry', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should PUT an updated country name', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEditCountry(), { wrapper });

    result.current.mutate({ id: 1, country_name: 'India (Updated)' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/country/1`,
      expect.objectContaining({ method: 'PUT' })
    );
  });
});

describe('useDeleteCountry', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should DELETE a country by id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteCountry(), { wrapper });

    result.current.mutate(3);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/country/3`,
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

// ─── STATES ───────────────────────────────────────────────────────────────────

describe('useGetStates', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should be disabled when no countryId is provided', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetStates(null), { wrapper });

    // Disabled queries remain pending with idle fetchStatus
    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should fetch states for a given countryId (array response)', async () => {
    const mockStates = [{ id: 10, state_name: 'Maharashtra' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStates,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetStates(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockStates);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/state?country_id=1`,
      expect.any(Object)
    );
  });

  it('should fetch states wrapped in { states: [...] }', async () => {
    const mockStates = [{ id: 10, state_name: 'Maharashtra' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ states: mockStates }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetStates(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockStates);
  });
});

describe('useAddState', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should POST a new state', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, state_name: 'Goa' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddState(), { wrapper });

    result.current.mutate({ state_name: 'Goa', country_id: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/state`,
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('useEditState', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should PUT an updated state', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEditState(), { wrapper });

    result.current.mutate({ id: 10, state_name: 'Maharashtra (Updated)' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/state/10`,
      expect.objectContaining({ method: 'PUT' })
    );
  });
});

describe('useDeleteState', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should DELETE a state by id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteState(), { wrapper });

    result.current.mutate(10);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/state/10`,
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

// ─── CITIES ───────────────────────────────────────────────────────────────────

describe('useGetCities', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should be disabled when no stateId is provided', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetCities(null), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should fetch cities for a given stateId', async () => {
    const mockCities = [{ id: 100, city_name: 'Mumbai' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCities,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetCities(10), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCities);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/city?state_id=10`,
      expect.any(Object)
    );
  });
});

describe('useAddCity', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should POST a new city', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, city_name: 'Pune' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddCity(), { wrapper });

    result.current.mutate({ city_name: 'Pune', state_id: 10 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/city`,
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('useEditCity', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should PUT an updated city', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEditCity(), { wrapper });

    result.current.mutate({ id: 100, city_name: 'Mumbai (Updated)' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/city/100`,
      expect.objectContaining({ method: 'PUT' })
    );
  });
});

describe('useDeleteCity', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should DELETE a city by id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteCity(), { wrapper });

    result.current.mutate(100);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/city/100`,
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
