// src/hooks/registerHooks/useBasicdetail.js
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAuthHeaders, BASE_URL } from "../../utils/apiClient";

const fetchMasterList = async (url) => {
  try {
    const res = await fetch(url, { 
      headers: getAuthHeaders(),
      // credentials:'include' removed — it caused extra CORS preflight requests.
      // Authorization: Bearer header is sufficient for authentication.
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
export const useReligions = () =>
  useQuery({
    queryKey: ["master", "religions"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/religions/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

export const useCastes = (religionId) =>
  useQuery({
    queryKey: ["master", "castes", religionId],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/castes/list?religion_id=${religionId}`),
    enabled: !!religionId,
    staleTime: 10 * 60 * 1000,
  });

export const useSubcastes = (casteId) =>
  useQuery({
    queryKey: ["master", "subcastes", casteId],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/subcastes/list?caste_id=${casteId}`),
    enabled: !!casteId,
    staleTime: 10 * 60 * 1000,
  });

export const useCountries = () =>
  useQuery({
    queryKey: ["master", "countries"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/countries/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

export const useStates = (countryId) =>
  useQuery({
    queryKey: ["master", "states", countryId],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/states/list?country_id=${countryId}`),
    enabled: !!countryId,
    staleTime: 10 * 60 * 1000,
  });

export const useCities = (stateId) =>
  useQuery({
    queryKey: ["master", "cities", stateId],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/cities/list?state_id=${stateId}`),
    enabled: !!stateId,
    staleTime: 10 * 60 * 1000,
  });

export const useMotherTongues = () =>
  useQuery({
    queryKey: ["master", "motherTongues"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/mother-tongues/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

export const useMaritalStatuses = () =>
  useQuery({
    queryKey: ["master", "maritalStatuses"],
    queryFn: () => fetchMasterList(`${BASE_URL}/api/auth/marital-statuses/list`),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

// ==================== SAVE BASIC DETAILS ====================
export const useSaveBasicDetails = () =>
  useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/users/basic-details`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to save basic details");
      }

      return data;
    },
  });