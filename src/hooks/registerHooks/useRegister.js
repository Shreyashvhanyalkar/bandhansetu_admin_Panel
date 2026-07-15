// src/hooks/registerHooks/useRegister.js
import { useMutation } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "x-app-type": "admin",
  "Accept-Language": "en",
});

// ==================== CREATE USER (Step 1: Register) ====================
// POST /api/auth/admin/users/create
// Body: { firstName, lastName, email, mobileNumber, countryCode, gender, birthDate }
// Success -> { statusCode, messageCode, message, userId, platformId }
export const useRegisterUser = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/users/create`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to register user");
      }

      return data; // { statusCode, messageCode, message, userId, platformId }
    },
  });
};