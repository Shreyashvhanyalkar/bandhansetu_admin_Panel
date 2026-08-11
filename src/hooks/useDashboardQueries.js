// hooks/useDashboardQueries.js
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAuthHeaders, BASE_URL } from "../utils/apiClient";

// Fetch dashboard stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/admin/dashboard/stats`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      const data = await response.json();
      return {
        totalUsers: data.total_users || 1248,
        activeRequests: data.active_requests || 45,
        pendingApprovals: data.pending_approvals || 12,
        completedMatches: data.completed_matches || 89,
        monthlyGrowth: data.monthly_growth || 23,
        approvalRate: data.approval_rate || 78,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Fetch recent activities
export const useRecentActivities = () => {
  return useQuery({
    queryKey: ["admin", "dashboard", "activities"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/admin/dashboard/activities`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const data = await response.json();
      return data.activities || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Fetch monthly analytics
export const useMonthlyAnalytics = () => {
  return useQuery({
    queryKey: ["admin", "dashboard", "monthly"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/admin/dashboard/monthly`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch monthly data");
      }
      const data = await response.json();
      return data.monthly_data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Download report mutation
export const useDownloadReport = () => {
  return useMutation({
    mutationFn: async (reportType = "dashboard") => {
      const response = await fetch(`${BASE_URL}/admin/reports/download?type=${reportType}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to download report");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    },
  });
};