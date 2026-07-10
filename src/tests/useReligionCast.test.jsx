import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useGetReligions,
  useAddReligion,
  useEditReligion,
  useDeleteReligion,
  useGetCastes,
  useAddCaste,
  useEditCaste,
  useDeleteCaste,
  useGetSubcasts,
  useAddSubcast,
  useEditSubcast,
  useDeleteSubcast,
} from '../hooks/useReligionCast';

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

// ══════════════════════════════════════════════════════════════════════════════
// RELIGIONS
// ══════════════════════════════════════════════════════════════════════════════

describe('useGetReligions', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should fetch religions from { religions: [...] } response', async () => {
    const mockData = [{ id: 1, religion_name: 'Hindu' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, religions: mockData }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetReligions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/religion`,
      expect.any(Object)
    );
  });

  it('should fetch religions from a direct array response', async () => {
    const mockData = [{ id: 1, religion_name: 'Hindu' }, { id: 2, religion_name: 'Muslim' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetReligions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it('should return [] when response has unknown structure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, someOtherField: 'abc' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetReligions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('should throw error when API returns status: false', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: false, message: 'Access denied' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetReligions(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Access denied');
  });
});

describe('useAddReligion', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should POST a new religion', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, religion_name: 'Buddhism' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddReligion(), { wrapper });

    result.current.mutate({ religion_name: 'Buddhism' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/religion`,
      expect.objectContaining({ method: 'POST' })
    );

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.religion_name).toBe('Buddhism');
  });

  it('should throw error when add fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: false, message: 'Religion already exists' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddReligion(), { wrapper });

    result.current.mutate({ religion_name: 'Hindu' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Religion already exists');
  });
});

describe('useEditReligion', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should PUT updated religion name', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEditReligion(), { wrapper });

    result.current.mutate({ id: 1, religion_name: 'Hinduism' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/religion/1`,
      expect.objectContaining({ method: 'PUT' })
    );
  });
});

describe('useDeleteReligion', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should DELETE a religion by id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteReligion(), { wrapper });

    result.current.mutate(2);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/religion/2`,
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// CASTES
// ══════════════════════════════════════════════════════════════════════════════

describe('useGetCastes', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should be disabled when no religionId is provided', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetCastes(null), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should fetch castes for a given religionId from { castes: [...] } response', async () => {
    const mockCastes = [{ id: 10, caste_name: 'Brahmin' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, castes: mockCastes }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetCastes(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCastes);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/caste?religion_id=1`,
      expect.any(Object)
    );
  });

  it('should fetch castes from a direct array response', async () => {
    const mockCastes = [{ id: 10, caste_name: 'Brahmin' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCastes,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetCastes(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCastes);
  });
});

describe('useAddCaste', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should POST a new caste', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddCaste(1), { wrapper });

    result.current.mutate({ caste_name: 'Kshatriya', religion_id: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/caste`,
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('useEditCaste', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should PUT updated caste name', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEditCaste(1), { wrapper });

    result.current.mutate({ id: 10, caste_name: 'Brahmin (Updated)', religion_id: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/caste/10`,
      expect.objectContaining({ method: 'PUT' })
    );
  });
});

describe('useDeleteCaste', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should DELETE a caste by id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteCaste(1), { wrapper });

    result.current.mutate({ id: 10 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/caste/10`,
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SUBCASTS
// ══════════════════════════════════════════════════════════════════════════════

describe('useGetSubcasts', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should be disabled when no casteId is provided', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetSubcasts(null), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should fetch subcasts for a given casteId from { subcasts: [...] } response', async () => {
    const mockSubcasts = [{ id: 100, subcaste_name: 'Iyer' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, subcasts: mockSubcasts }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGetSubcasts(10), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSubcasts);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/subcast?caste_id=10`,
      expect.any(Object)
    );
  });
});

describe('useAddSubcast', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should POST a new subcast', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddSubcast(10), { wrapper });

    result.current.mutate({ subcaste_name: 'Iyer', caste_id: 10 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/subcast`,
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('useEditSubcast', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should PUT updated subcast name', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEditSubcast(10), { wrapper });

    result.current.mutate({ id: 100, subcaste_name: 'Iyer (Updated)' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/subcast/100`,
      expect.objectContaining({ method: 'PUT' })
    );
  });
});

describe('useDeleteSubcast', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('should DELETE a subcast by id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteSubcast(10), { wrapper });

    result.current.mutate(100);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/admin/subcast/100`,
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
