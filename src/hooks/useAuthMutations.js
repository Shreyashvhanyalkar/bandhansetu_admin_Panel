// src/hooks/useAuthMutations.js
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/auth/Authslice";

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

const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  return "Unknown";
};
export const useLogin = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      // Dynamic Device & Browser Information
      const deviceInfo = {
        device_id: `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        device_type: "web",
        os: getOS(),
        os_version: getOSVersion(),
        app_version: "1.0.0",           // You can change this from env later
        user_agent: navigator.userAgent,
        browser: getBrowser(),
      };

      const payload = {
        email,
        password,
        ...deviceInfo,
      };

      const response = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.message || "Invalid email or password.");
      }

      const userData = {
        id: data.admin_id,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email,
      };

      return {
        token: data.token,
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