// src/hooks/useEducationManagement.js
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
export const EDUCATION_KEYS = {
  levels: ["education", "levels"],
  fields: (levelId) => ["education", "fields", levelId],
};

// ====================== EDUCATION LEVELS ======================
const fetchEducationLevels = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/admin/education-level`, {
    headers: getAuthHeaders(),
  });
  const json = await handleResponse(res);
  return json.education_levels || [];
};

export const useGetEducationLevels = () =>
  useQuery({
    queryKey: EDUCATION_KEYS.levels,
    queryFn: fetchEducationLevels,
    staleTime: 5 * 60 * 1000,
  });

export const useAddEducationLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ education_level_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/education-level`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ education_level_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: EDUCATION_KEYS.levels }),
  });
};

export const useEditEducationLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, education_level_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/education-level/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ education_level_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: EDUCATION_KEYS.levels }),
  });
};

export const useDeleteEducationLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/education-level/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: EDUCATION_KEYS.levels }),
  });
};

// ====================== EDUCATION FIELDS ======================
const fetchEducationFields = async (levelId) => {
  if (!levelId) return [];
  const res = await fetch(
    `${BASE_URL}/api/auth/admin/education-field?education_level_id=${levelId}`,
    { headers: getAuthHeaders() }
  );
  const json = await handleResponse(res);
  return json.education_fields || [];
};

export const useGetEducationFields = (levelId) =>
  useQuery({
    queryKey: EDUCATION_KEYS.fields(levelId),
    queryFn: () => fetchEducationFields(levelId),
    enabled: !!levelId,
    staleTime: 5 * 60 * 1000,
  });

export const useAddEducationField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ education_field_name, education_level_id }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/education-field`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ education_field_name, education_level_id }),
      });
      return handleResponse(res);
    },
    onSuccess: (_, { education_level_id }) =>
      queryClient.invalidateQueries({
        queryKey: EDUCATION_KEYS.fields(education_level_id),
      }),
  });
};

export const useEditEducationField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, education_field_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/education-field/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ education_field_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["education", "fields"],
        exact: false,
      }),
  });
};

export const useDeleteEducationField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/education-field/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["education", "fields"],
        exact: false,
      }),
  });
};