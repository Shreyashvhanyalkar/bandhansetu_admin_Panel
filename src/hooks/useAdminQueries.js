// hooks/useAdminQueries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "x-app-type": "admin",
});

const USERS_KEY = ["admin", "users"];

// ==================== LIST OF USERS ====================
export const useAllUsers = (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    deleted,
  } = filters;

  return useQuery({
    queryKey: ["admin", "users", { page, limit, search, status, deleted }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      if (search?.trim()) params.set("search", search.trim());
      if (status !== undefined) params.set("status", String(status));
      if (deleted !== undefined) params.set("deleted", String(deleted));

      const url = `${BASE_URL}/api/auth/admin/users?${params.toString()}`;

      const res = await fetch(url, { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch users");
      }

      const response = await res.json();
      let usersData = Array.isArray(response) ? response : response.users || [];

      let totalPages = 1;
      let total = usersData.length;

      // Case 1: API returned the entire unpaginated list
      if (usersData.length > limit) {
        total = usersData.length;
        totalPages = Math.ceil(total / limit);
        usersData = usersData.slice((page - 1) * limit, page * limit);
      } 
      // Case 2: API returns an object with pagination metadata
      else if (!Array.isArray(response) && (response.pagination || response.total !== undefined || response.total_pages !== undefined)) {
        const p = response.pagination || response;
        total = p.total ?? p.total_items ?? usersData.length;
        totalPages = p.total_pages ?? p.totalPages ?? Math.ceil(total / limit);
      }
      // Case 3: API returned a paginated slice but NO metadata (plain array)
      else {
        if (usersData.length === limit) {
          totalPages = page + 1; // Assume there is a next page
          total = page * limit + 1; // Fake total
        } else {
          totalPages = page;
          total = (page - 1) * limit + usersData.length;
        }
      }

      const paginationData = { page, limit, total, total_pages: totalPages };

      const users = usersData.map((u) => ({
        id: u.id,
        platformId: u.platform_id || u.platformId || "",
        name: `${u.firstName || u.first_name || ""} ${u.middleName || u.middle_name || ""} ${u.lastName || u.last_name || ""}`.trim(),
        email: u.email,
        mobile: String(u.mobile_number || u.mobileNumber || ""),
        countryCode: u.country_code || u.countryCode || "+91",
        rawStatus: u.status ?? 0,
        status: u.status === 1 ? "approved" : "pending",
        isDeleted: !!u.deleted_at,
        gender: u.gender || "",
        age: u.age ?? null,
        cityName: u.cityName || u.city_name || "",
        stateName: u.stateName || u.state_name || "",
      }));

      return {
        users,
        pagination: paginationData || {
          page,
          limit,
          total: users.length,
          total_pages: Math.ceil(users.length / limit),
        },
      };
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// ==================== SINGLE USER PROFILE ====================
export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ["admin", "userProfile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const res = await fetch(`${BASE_URL}/api/auth/admin/users/${userId}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch user profile");
      }

      const data = await res.json();
      // Return the user object (adjust key if your API wraps it differently)
      return data.user || data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000,
  });
};

// ==================== MUTATIONS ====================
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/users/status/${userId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update user status");
      }

      return { userId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      // Also invalidate profile if open
      queryClient.invalidateQueries({ queryKey: ["admin", "userProfile"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete user");
      }

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/users/restore/${userId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to restore user");
      }

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

// Legacy hooks (kept for backward compatibility)
export const useApproveUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`${BASE_URL}/admin/users/approve/${userId}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message);
      }
      return userId;
    },
    onSuccess: (userId) => {
      queryClient.setQueriesData({ queryKey: USERS_KEY, exact: false }, (old) => {
        if (!old?.users) return old;
        return {
          ...old,
          users: old.users.map((u) =>
            u.id === userId ? { ...u, status: "approved", rawStatus: 1 } : u
          ),
        };
      });
    },
  });
};
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, email, mobile }) => {
      const res = await fetch(`${BASE_URL}/admin/users/update/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, email, mobile }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message);
      }
      return { id, name, email, mobile };
    },
    onSuccess: (updated) => {
      queryClient.setQueriesData({ queryKey: USERS_KEY, exact: false }, (old) => {
        if (!old?.users) return old;
        return {
          ...old,
          users: old.users.map((u) =>
            u.id === updated.id ? { ...u, ...updated } : u
          ),
        };
      });
    },
  });
};  