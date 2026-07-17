// src/hooks/registerHooks/usePersonalDetails.js
import { useQuery, useMutation } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ==================== HEADERS ====================
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || ''}`,
    "x-app-type": "Admin",
    "Accept-Language": "en-US",
  };
};

const getAdminHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || ''}`,
    "x-app-type": "Admin",
    "Accept-Language": "en",
  };
};

// ==================== FETCH HELPER ====================
const fetchMasterList = async (url) => {
  try {
    const res = await fetch(url, { 
      headers: getHeaders(),
      credentials: 'include',
    });
    
    if (res.status === 401) {
      throw new Error("Authentication failed. Please login again.");
    }
    
    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      throw new Error("Invalid JSON response from server");
    }
    
    if (!res.ok) {
      throw new Error(data.message || data.error || `HTTP ${res.status}: Failed to fetch list`);
    }
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    if (data.statusCode && data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    if (data.items && Array.isArray(data.items)) {
      return data.items;
    }
    
    if (data.list && Array.isArray(data.list)) {
      return data.list;
    }
    
    return [];
    
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    throw error;
  }
};

// ==================== MASTER DATA HOOKS ====================

// GET Diets
export const useDiets = () =>
  useQuery({
    queryKey: ["master", "diets"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/diets/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Body Types
export const useBodyTypes = () =>
  useQuery({
    queryKey: ["master", "body-types"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/body-types/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Skin Tones
export const useSkinTones = () =>
  useQuery({
    queryKey: ["master", "skin-tones"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/skin-tones/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// ==================== SAVE PERSONAL DETAILS ====================
export const useSavePersonalDetails = () =>
  useMutation({
    mutationFn: async (payload) => {
      
      const res = await fetch(`${BASE_URL}/api/auth/admin/users/personal-details`, {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error("Invalid JSON response from server");
      }


      if (!res.ok) {
        throw new Error(data.message || "Failed to save personal details");
      }

      return data;
    },
    onError: (error) => {
      console.error("❌ Save mutation error:", error);
    },
    onSuccess: (data) => {
    },
  });