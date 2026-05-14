// src/hooks/useAuthMutations.js
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../features/auth/Authslice";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper functions for dynamic device info
const getOS = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
  return "Unknown";
};

const getOSVersion = () => {
  // Basic version detection (can be enhanced)
  const userAgent = navigator.userAgent;
  const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
  if (windowsMatch) return windowsMatch[1];

  const macMatch = userAgent.match(/Mac OS X (\d+[._]\d+)/);
  if (macMatch) return macMatch[1].replace("_", ".");

  return "N/A";
};

// ==================== LOGIN ====================
export const useLogin = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      // Build nested deviceInfo object matching the new backend spec
      const deviceInfo = {
        deviceId: `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        deviceType: "web",
        os: getOS(),
        osVersion: getOSVersion(),
        appVersion: "1.0.0",
        notificationToken: "web-no-token",
      };

      const payload = {
        email,
        password,
        deviceInfo,
      };

      const response = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("Login API raw response:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // Extract token from multiple possible locations
      const token =
        data.deviceDetails?.sessionKey ||
        data.token ||
        data.sessionKey ||
        data.data?.token ||
        data.data?.deviceDetails?.sessionKey;

      if (!token) {
        console.error("Could not find token in response:", data);
        throw new Error("Login succeeded but no session token was returned.");
      }

      const userData = {
        id: data.id || data.admin_id || data.data?.id,
        name: `${data.firstName || data.first_name || ""} ${data.lastName || data.last_name || ""}`.trim(),
        email: data.email || data.data?.email,
      };

      return {
        token,
        user: userData,
      };
    },

    onSuccess: (data) => {
      dispatch(loginSuccess(data));
    },

    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

// ==================== LOGOUT ====================
export const useLogout = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "x-app-type": "admin",
        },
      });
      // Don't throw on failure — we still want to clear local state
      return res.json().catch(() => ({}));
    },
    onSettled: () => {
      // Always clear local state, even if API call fails
      dispatch(logout());
    },
  });
};

// ==================== REGISTER ====================
export const useRegister = () => {
  return useMutation({
    mutationFn: async ({ name, email, password }) => {
      const response = await fetch(`${BASE_URL}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      
      return data;
    },
  });
};