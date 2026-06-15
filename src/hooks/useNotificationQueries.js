// hooks/useNotificationQueries.js - Simplified version

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "x-app-type": "admin",
  "Accept-Language": "en",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Fetch all users for selection
export const useAllUsers = (searchTerm = "", page = 1, limit = 50) => {
  return useQuery({
    queryKey: ["admin", "users", "all", searchTerm, page],
    queryFn: async () => {
      const url = searchTerm 
        ? `${BASE_URL}/api/auth/admin/users/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`
        : `${BASE_URL}/api/auth/admin/users?page=${page}&limit=${limit}&status=1`;
      
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

// Fetch religions
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

// Send notification mutation
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