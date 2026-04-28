// hooks/useAdminQueries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "x-app-type": "admin",
});

const USERS_KEY = ["admin", "users"];

// In useAllUsers hook



export const useAllUsers = (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    deleted,
    gender,
  } = filters;

  return useQuery({
    queryKey: ["admin", "users", { page, limit, search, status, deleted, gender }], // Clean and reliable key

    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      if (search?.trim()) params.set("search", search.trim());
      if (status !== undefined) params.set("status", String(status));
      if (deleted !== undefined) params.set("deleted", String(deleted));
      if (gender) params.set("gender", gender);        // ← This must be sent

      const url = `${BASE_URL}/api/auth/admin/users?${params.toString()}`;

      console.log("Fetching users with gender =", gender, "→ Full URL:", url); // Debugging

      const res = await fetch(url, { 
        headers: getAuthHeaders() 
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch users");
      }

      const response = await res.json();

      const usersData = response.users || [];
      const paginationData = response.pagination || null;

      const users = usersData.map((u) => ({
        id: u.id,
        name: `${u.first_name || ""} ${u.middle_name || ""} ${u.last_name || ""}`.trim(),
        email: u.email,
        mobile: String(u.mobile_number || ""),
        countryCode: u.country_code || "+91",
        rawStatus: u.status ?? 0,
        status: u.status === 1 ? "approved" : "pending",
        isDeleted: !!u.deleted_at,
        gender: u.gender || "",
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

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/users/status/${userId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),        // { status: 0 or 1 }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update user status");
      }

      return { userId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
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