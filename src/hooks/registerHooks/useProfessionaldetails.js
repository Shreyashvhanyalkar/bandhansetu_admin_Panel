// src/hooks/registerHooks/useProfessionaldetails.js
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAuthHeaders, BASE_URL } from "../../utils/apiClient";

// ==================== FETCH HELPER ====================
const fetchMasterList = async (url) => {
  try {
    const res = await fetch(url, { 
      headers: getAuthHeaders(),
      // credentials:'include' removed — causes extra CORS preflight on every request.
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

// GET Education Levels
export const useEducationLevels = () =>
  useQuery({
    queryKey: ["master", "education-levels"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/education-levels/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Education Fields (depends on education level)
export const useEducationFields = (educationLevelId) =>
  useQuery({
    queryKey: ["master", "education-fields", educationLevelId],
    queryFn: () => fetchMasterList(
      `${BASE_URL}/api/auth/education-fields/list?education_level_id=${educationLevelId}`
    ),
    enabled: !!educationLevelId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Incomes
export const useIncomes = () =>
  useQuery({
    queryKey: ["master", "incomes"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/incomes/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Working With
export const useWorkingWith = () =>
  useQuery({
    queryKey: ["master", "working-with"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/working-with/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Working Categories (depends on working with)
export const useWorkingCategories = (workingWithId) =>
  useQuery({
    queryKey: ["master", "working-categories", workingWithId],
    queryFn: () => fetchMasterList(
      `${BASE_URL}/api/auth/working-categories/list?working_with_id=${workingWithId}`
    ),
    enabled: !!workingWithId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Working Subcategories (depends on category)
export const useWorkingSubcategories = (categoryId) =>
  useQuery({
    queryKey: ["master", "working-subcategories", categoryId],
    queryFn: () => fetchMasterList(
      `${BASE_URL}/api/auth/working-subcategories/list?category_id=${categoryId}`
    ),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// ==================== SAVE PROFESSIONAL DETAILS ====================
export const useSaveProfessionalDetails = () =>
  useMutation({
    mutationFn: async (payload) => {
      
      const res = await fetch(`${BASE_URL}/api/auth/admin/users/professional-details`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error("Invalid JSON response from server");
      }


      if (!res.ok) {
        throw new Error(data.message || "Failed to save professional details");
      }

      return data;
    },
    onError: (error) => {
      console.error("❌ Save mutation error:", error);
    },
    onSuccess: (data) => {
    },
  });