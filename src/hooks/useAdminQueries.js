// hooks/useAdminQueries.js
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "x-app-type": "admin",
  "Accept-Language": "en",
});

const USERS_KEY = ["admin", "users"];

// ==================== INFINITE SCROLL USERS ====================
export const useAllUsersInfinite = (filters = {}) => {
  const {
    search = "",
    status,
    deleted,
    gender = "",
    city = "",
    state = "",
    limit = 25,
  } = filters;

  return useInfiniteQuery({
    queryKey: ["admin", "users", "infinite", { search, status, deleted, gender, city, state, limit }],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(pageParam));

      // Backend filters
      if (search?.trim()) params.set("search", search.trim());
      if (status !== undefined) params.set("status", String(status));
      if (deleted !== undefined) params.set("deleted", String(deleted));
      
      // Advanced filters - sent to backend
      if (gender) params.set("gender", gender);
      if (city) params.set("city", city);
      if (state) params.set("state", state);

      const url = `${BASE_URL}/api/auth/admin/users?${params.toString()}`;

      const res = await fetch(url, { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch users");
      }

      const response = await res.json();

      // Handle array response (no pagination metadata)
      let usersData = [];
      
      if (Array.isArray(response)) {
        usersData = response;
      } else if (response.users || response.data) {
        usersData = response.users || response.data || [];
      } else {
        usersData = response || [];
      }

      if (!Array.isArray(usersData)) {
        usersData = [];
      }

      // Map users to consistent format
      const users = usersData.map((u) => ({
        id: u.id || u.userId,
        platformId: u.platform_id || u.platformId || "",
        firstName: u.firstName || u.first_name || "",
        lastName: u.lastName || u.last_name || "",
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
        religionName: u.religionName || u.religion_name || "",
        createdAt: u.created_at || u.createdAt,
      }));

      // Determine if there are more users
      const hasMore = usersData.length === limit;
      const nextOffset = hasMore ? pageParam + limit : undefined;

      return {
        users,
        pagination: {
          offset: pageParam,
          limit,
          hasMore,
          nextOffset,
          currentPage: Math.floor(pageParam / limit) + 1,
        },
      };
    },
    getNextPageParam: (lastPage) => lastPage.pagination.nextOffset,
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ==================== REGULAR PAGINATED USERS ====================
export const useAllUsers = (filters = {}) => {
  const {
    offset = 0,
    limit = 10,
    search = "",
    status,
    deleted,
    gender = "",
    city = "",
    state = "",
  } = filters;

  return useQuery({
    queryKey: ["admin", "users", { offset, limit, search, status, deleted, gender, city, state }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset));

      if (search?.trim()) params.set("search", search.trim());
      if (status !== undefined) params.set("status", String(status));
      if (deleted !== undefined) params.set("deleted", String(deleted));
      if (gender) params.set("gender", gender);
      if (city) params.set("city", city);
      if (state) params.set("state", state);

      const url = `${BASE_URL}/api/auth/admin/users?${params.toString()}`;

      const res = await fetch(url, { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch users");
      }

      const response = await res.json();

      let usersData = [];
      let total = 0;
      
      if (Array.isArray(response)) {
        usersData = response;
        const hasMore = response.length === limit;
        total = hasMore ? offset + limit + 1 : offset + response.length;
      } else if (response.users || response.data) {
        usersData = response.users || response.data || [];
        total = response.total || response.total_count || usersData.length;
      } else {
        usersData = response || [];
        total = usersData.length;
      }

      if (!Array.isArray(usersData)) {
        usersData = [];
      }

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = offset + limit < total;

      const users = usersData.map((u) => ({
        id: u.id || u.userId,
        platformId: u.platform_id || u.platformId || "",
        firstName: u.firstName || u.first_name || "",
        lastName: u.lastName || u.last_name || "",
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
        religionName: u.religionName || u.religion_name || "",
        createdAt: u.created_at || u.createdAt,
      }));

      return {
        users,
        pagination: {
          offset,
          limit,
          total,
          total_pages: totalPages,
          current_page: Math.floor(offset / limit) + 1,
          has_next_page: hasNextPage,
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
      return data.user || data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: ["admin", "userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "infinite"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "infinite"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "infinite"] });
    },
  });
};

// ==================== LEGACY HOOKS ====================
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