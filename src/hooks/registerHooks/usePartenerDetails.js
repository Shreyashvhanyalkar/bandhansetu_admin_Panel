// src/hooks/registerHooks/usePartenerDetails.js
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

// GET Marital Statuses
export const useMaritalStatuses = () =>
  useQuery({
    queryKey: ["master", "marital-statuses"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/marital-statuses/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Religions
export const useReligions = () =>
  useQuery({
    queryKey: ["master", "religions"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/religions/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Castes (depends on religion)
export const useCastes = (religionId) =>
  useQuery({
    queryKey: ["master", "castes", religionId],
    queryFn: () => fetchMasterList(
      `${BASE_URL}/api/auth/castes/list?religion_id=${religionId}`
    ),
    enabled: !!religionId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Subcastes (depends on caste)
export const useSubcastes = (casteId) =>
  useQuery({
    queryKey: ["master", "subcastes", casteId],
    queryFn: () => fetchMasterList(
      `${BASE_URL}/api/auth/subcastes/list?caste_id=${casteId}`
    ),
    enabled: !!casteId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Mother Tongues
export const useMotherTongues = () =>
  useQuery({
    queryKey: ["master", "mother-tongues"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/mother-tongues/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Countries
export const useCountries = () =>
  useQuery({
    queryKey: ["master", "countries"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/countries/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET States (depends on country)
export const useStates = (countryId) =>
  useQuery({
    queryKey: ["master", "states", countryId],
    queryFn: () => fetchMasterList(
      `${BASE_URL}/api/auth/states/list?country_id=${countryId}`
    ),
    enabled: !!countryId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Cities (depends on state)
export const useCities = (stateId) =>
  useQuery({
    queryKey: ["master", "cities", stateId],
    queryFn: () => fetchMasterList(
      `${BASE_URL}/api/auth/cities/list?state_id=${stateId}`
    ),
    enabled: !!stateId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

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

// GET Working With
export const useWorkingWith = () =>
  useQuery({
    queryKey: ["master", "working-with"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/working-with/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// GET Working Categories
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

// ==================== SAVE PARTNER PREFERENCES ====================
export const useSavePartnerPreferences = () =>
  useMutation({
    mutationFn: async (payload) => {
      
      const res = await fetch(`${BASE_URL}/api/auth/admin/users/partner-preferences`, {
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
        if (res.status === 409) {
          throw new Error("Partner preferences already exist for this user.");
        }
        throw new Error(data.message || "Failed to save partner preferences");
      }

      return data;
    },
    onError: (error) => {
      console.error("❌ Save mutation error:", error);
    },
    onSuccess: (data) => {
    },
  });