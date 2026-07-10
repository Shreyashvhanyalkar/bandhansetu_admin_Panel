// hooks/useNotificationQueries.js
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "x-app-type": "admin",
  "Accept-Language": "en",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ==================== INFINITE SCROLL USERS FOR SELECT ====================
export const useAllUsersInfinite = (searchTerm = "", limit = 20) => {
  return useInfiniteQuery({
    queryKey: ["admin", "users", "select", "infinite", searchTerm],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(pageParam));

      if (searchTerm?.trim()) params.set("search", searchTerm.trim());

      const url = `${BASE_URL}/api/auth/admin/users?${params.toString()}`;
      console.log(`Fetching users for select - offset: ${pageParam}, limit: ${limit}, search: "${searchTerm}"`);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch users");
      }

      const data = await response.json();
      console.log("Select users response:", data);

      // Handle array response (no pagination metadata)
      let usersData = [];
      
      if (Array.isArray(data)) {
        usersData = data;
      } else if (data.users || data.data) {
        usersData = data.users || data.data || [];
      } else {
        usersData = data || [];
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

// ==================== REGULAR USERS (Keep for backward compatibility) ====================
export const useAllUsers = (searchTerm = "", page = 1, limit = 100) => {
  return useQuery({
    queryKey: ["admin", "users", "all", searchTerm, page],
    queryFn: async () => {
      const url = searchTerm 
        ? `${BASE_URL}/api/auth/admin/users/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`
        : `${BASE_URL}/api/auth/admin/users?page=${page}&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch users");
      }
      
      const data = await response.json();
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

// ==================== RELIGIONS ====================
export const useReligions = () => {
  return useQuery({
    queryKey: ["admin", "religions"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/api/auth/admin/religion`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch religions");
      }
      
      const data = await response.json();
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });
};

// ==================== SEND NOTIFICATION ====================
export const useSendNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationData) => {
      console.log("Sending notification with data:", notificationData);
      
      const response = await fetch(`${BASE_URL}/api/auth/admin/notifications/send`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(notificationData),
      });
      
      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response text:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error(`Server error: ${responseText.substring(0, 200)}`);
      }
      
      if (!response.ok) {
        const errorMessage = data.message || data.error || `Failed to send notification (${response.status})`;
        throw new Error(errorMessage);
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["admin", "notifications"]);
    },
  });
};

// ==================== UPLOAD BANNER ====================
export const useUploadBanner = () => {
  return useMutation({
    mutationFn: async (file) => {
      console.log("Uploading banner file:", file.name);
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${BASE_URL}/api/auth/admin/upload-banner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "x-app-type": "admin",
          "Accept-Language": "en-us",
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log("Upload response status:", response.status);
      console.log("Upload response text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse upload response as JSON:", e);
        throw new Error(`Server error: ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `Failed to upload banner (${response.status})`;
        throw new Error(errorMessage);
      }

      return data;
    },
  });
};