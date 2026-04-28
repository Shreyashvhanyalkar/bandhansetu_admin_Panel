// src/hooks/useLocationManagement.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "x-app-type": "admin",
});

const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok || json.status === false) {
    throw new Error(json.message || "Something went wrong");
  }
  return json;
};

// Query Keys
export const LOCATION_KEYS = {
  countries: ["locations", "countries"],
  states: (countryId) => ["locations", "states", countryId],
  cities: (stateId) => ["locations", "cities", stateId],
};

// ====================== COUNTRIES ======================
const fetchCountries = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/admin/country`, { headers: getAuthHeaders() });
  const json = await handleResponse(res);
  return json.countries || [];
};

export const useGetCountries = () =>
  useQuery({ queryKey: LOCATION_KEYS.countries, queryFn: fetchCountries, staleTime: 5 * 60 * 1000 });

export const useAddCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ country_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/country`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ country_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.countries }),
  });
};

export const useEditCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, country_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/country/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ country_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.countries }),
  });
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/country/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.countries }),
  });
};

// ====================== STATES ======================
const fetchStatesByCountry = async (countryId) => {
  if (!countryId) return [];
  const res = await fetch(`${BASE_URL}/api/auth/admin/state?country_id=${countryId}`, { headers: getAuthHeaders() });
  const json = await handleResponse(res);
  return json.states || [];
};

export const useGetStates = (countryId) =>
  useQuery({
    queryKey: LOCATION_KEYS.states(countryId),
    queryFn: () => fetchStatesByCountry(countryId),
    enabled: !!countryId,
    staleTime: 5 * 60 * 1000,
  });

export const useAddState = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ state_name, country_id }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/state`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ state_name, country_id }),
      });
      return handleResponse(res);
    },
    onSuccess: (_, { country_id }) => 
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.states(country_id) }),
  });
};

export const useEditState = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, state_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/state/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ state_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.states() }),
  });
};

export const useDeleteState = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/state/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.states() }),
  });
};

// ====================== CITIES ======================
const fetchCitiesByState = async (stateId) => {
  if (!stateId) return [];
  const res = await fetch(`${BASE_URL}/api/auth/admin/city?state_id=${stateId}`, { headers: getAuthHeaders() });
  const json = await handleResponse(res);
  return json.cities || [];
};

export const useGetCities = (stateId) =>
  useQuery({
    queryKey: LOCATION_KEYS.cities(stateId),
    queryFn: () => fetchCitiesByState(stateId),
    enabled: !!stateId,
    staleTime: 5 * 60 * 1000,
  });

export const useAddCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ city_name, state_id }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/city`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ city_name, state_id }),
      });
      return handleResponse(res);
    },
    onSuccess: (_, { state_id }) => 
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.cities(state_id) }),
  });
};

// Improved useEditCity with optimistic update
export const useEditCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, city_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/city/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ city_name }),
      });
      return handleResponse(res);
    },
    onSuccess: (_, { id, city_name }) => {
      // Optimistic update + invalidate for safety
      queryClient.setQueriesData({ queryKey: LOCATION_KEYS.cities() }, (oldData = []) => {
        return oldData.map(city => 
          city.id === id ? { ...city, city_name } : city
        );
      });
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.cities() });
    },
  });
};

export const useDeleteCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/city/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.cities() });
    },
  });
};