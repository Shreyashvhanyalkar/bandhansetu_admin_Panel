// src/hooks/useUserProfile.js
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { updateUser } from "../features/auth/Authslice";
import { getAuthHeaders, BASE_URL } from "../utils/apiClient";

export const useUserProfile = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["auth", "user-profile"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/admin/profile`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - clear token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          throw new Error("Session expired");
        }
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      
      // Update Redux store with fresh user data
      if (data.user) {
        dispatch(updateUser(data.user));
      }
      
      return data.user;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!localStorage.getItem("token"), // Only run if authenticated
    retry: false,
  });
};