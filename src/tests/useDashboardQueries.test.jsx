import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useDashboardStats,
  useRecentActivities,
  useMonthlyAnalytics,
  useDownloadReport,
} from '../hooks/useDashboardQueries';

// The actual BASE_URL used in the hooks (from .env)
const BASE_URL = 'http://bandhan-setu-prod.eba-am6hwsad.ap-south-1.elasticbeanstalk.com';

describe('useDashboardQueries Hooks', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    localStorage.clear();
    global.fetch = vi.fn();

    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://test/1234');
    window.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useDashboardStats', () => {
    it('should fetch and format dashboard stats successfully', async () => {
      localStorage.setItem('token', 'test-token');
      const mockPayload = {
        total_users: 100,
        active_requests: 10,
        pending_approvals: 5,
        completed_matches: 20,
        monthly_growth: 15,
        approval_rate: 90,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayload,
      });

      const { result } = renderHook(() => useDashboardStats(), { wrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        totalUsers: 100,
        activeRequests: 10,
        pendingApprovals: 5,
        completedMatches: 20,
        monthlyGrowth: 15,
        approvalRate: 90,
      });

      // Verify the correct URL is called
      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/admin/dashboard/stats`,
        expect.any(Object)
      );
    });

    it('should return fallback values when API response has empty fields', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useDashboardStats(), { wrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should return fallback defaults
      expect(result.current.data.totalUsers).toBe(1248);
      expect(result.current.data.pendingApprovals).toBe(12);
    });

    it('should throw error if stats fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });
      const { result } = renderHook(() => useDashboardStats(), { wrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe('Failed to fetch dashboard stats');
    });
  });

  describe('useRecentActivities', () => {
    it('should fetch recent activities successfully', async () => {
      const mockActivities = [{ id: 1, action: 'User registered' }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: mockActivities }),
      });

      const { result } = renderHook(() => useRecentActivities(), { wrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockActivities);
    });

    it('should return empty array when activities field is missing', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useRecentActivities(), { wrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('should throw error when activities fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });
      const { result } = renderHook(() => useRecentActivities(), { wrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe('Failed to fetch activities');
    });
  });

  describe('useMonthlyAnalytics', () => {
    it('should fetch monthly analytics successfully', async () => {
      const mockAnalytics = [{ month: 'Jan', count: 12 }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ monthly_data: mockAnalytics }),
      });

      const { result } = renderHook(() => useMonthlyAnalytics(), { wrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAnalytics);
    });

    it('should throw error when monthly fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });
      const { result } = renderHook(() => useMonthlyAnalytics(), { wrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe('Failed to fetch monthly data');
    });
  });

  describe('useDownloadReport', () => {
    it('should download the report blob and trigger file download', async () => {
      localStorage.setItem('token', 'dl-token');
      const blobMock = new Blob(['csv,data'], { type: 'text/csv' });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => blobMock,
      });

      const { result } = renderHook(() => useDownloadReport(), { wrapper });
      result.current.mutate('sales');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/admin/reports/download?type=sales`,
        expect.any(Object)
      );
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(blobMock);
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://test/1234');
    });

    it('should throw error if download fails', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });
      const { result } = renderHook(() => useDownloadReport(), { wrapper });
      result.current.mutate('dashboard');
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe('Failed to download report');
    });
  });
});
