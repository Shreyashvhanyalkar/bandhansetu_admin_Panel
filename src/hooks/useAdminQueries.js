// hooks/useAdminQueries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const USERS_KEY = ["admin", "users"];

export const useAllUsers = (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    deleted,
  } = filters;

  return useQuery({
    queryKey: [...USERS_KEY, { page, limit, search, status, deleted }],
    queryFn: async () => {
      console.log("API CALLED with filters:", { page, limit, search, status, deleted });
      
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (status !== undefined && status !== "") params.set("status", String(status));
      if (deleted !== undefined && deleted !== "") params.set("deleted", String(deleted));

      const url = `${BASE_URL}/admin/users?${params.toString()}`;
      console.log("Fetching URL:", url);
      
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch users");
      }

      const { data } = await res.json();
      console.log("API Response:", data);

      const users = data.users.map((u) => ({
  id: u.id,
  name: `${u.first_name}${u.middle_name ? " " + u.middle_name : ""} ${u.last_name}`.trim(),
  email: u.email,
  mobile: String(u.mobile_number),
  countryCode: u.country_code ?? "+91",
  status: u.status === 1 ? "approved" : "pending",
  rawStatus: u.status,
  isDeleted: u.deleted_at !== null, // Add this line
  religionId: u.religion_id ?? null,
  casteId: u.caste_id ?? null,
  cityId: u.city_id ?? null,
}));

      return {
        users,
        pagination: data.pagination,
      };
    },
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache data
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }) => {
      console.log("Toggling status for user:", userId, "to status:", status);
      const res = await fetch(`${BASE_URL}/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update user status");
      }

      return { userId, status };
    },

    onSuccess: ({ userId, status }) => {
      // Only update cache, don't refetch
      queryClient.setQueriesData({ queryKey: USERS_KEY, exact: false }, (old) => {
        if (!old?.users) return old;
        return {
          ...old,
          users: old.users.map((u) =>
            u.id === userId
              ? { ...u, rawStatus: status, status: status === 1 ? "approved" : "pending" }
              : u
          ),
        };
      });
      console.log("Cache updated, no refetch triggered");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      console.log("Deleting user:", userId);
      const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete user");
      }

      return userId;
    },

    onSuccess: (userId) => {
      // Only update cache, don't refetch
      queryClient.setQueriesData({ queryKey: USERS_KEY, exact: false }, (old) => {
        if (!old?.users) return old;
        return {
          ...old,
          users: old.users.filter((u) => u.id !== userId),
          pagination: old.pagination
            ? { ...old.pagination, total: Math.max(0, old.pagination.total - 1) }
            : old.pagination,
        };
      });
      console.log("Cache updated after delete, no refetch triggered");
    },
  });
};

// Legacy hooks kept for backward compatibility
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

export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      console.log("Restoring user:", userId);
      const res = await fetch(`${BASE_URL}/admin/users/${userId}/restore`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to restore user");
      }

      return userId;
    },

    onSuccess: (userId) => {
      // Update cache to remove the restored user from deleted list
      queryClient.setQueriesData({ queryKey: USERS_KEY, exact: false }, (old) => {
        if (!old?.users) return old;
        return {
          ...old,
          users: old.users.filter((u) => u.id !== userId),
          pagination: old.pagination
            ? { ...old.pagination, total: Math.max(0, old.pagination.total - 1) }
            : old.pagination,
        };
      });
      console.log("Cache updated after restore, no refetch triggered");
    },
  });
};