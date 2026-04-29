// src/hooks/useMaritalStatusManagement.js
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

export const MARITAL_STATUS_KEYS = {
  all: ["marital-statuses"],
};

// ====================== MARITAL STATUS ======================
const fetchMaritalStatuses = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/admin/marital-status`, {
    headers: getAuthHeaders(),
  });
  const json = await handleResponse(res);
  return json.marital_statuses || [];
};

export const useGetMaritalStatuses = () =>
  useQuery({
    queryKey: MARITAL_STATUS_KEYS.all,
    queryFn: fetchMaritalStatuses,
    staleTime: 5 * 60 * 1000,
  });

export const useAddMaritalStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ marital_status_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/marital-status`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ marital_status_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MARITAL_STATUS_KEYS.all }),
  });
};

export const useEditMaritalStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, marital_status_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/marital-status/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ marital_status_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MARITAL_STATUS_KEYS.all }),
  });
};

export const useDeleteMaritalStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/marital-status/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MARITAL_STATUS_KEYS.all }),
  });
};