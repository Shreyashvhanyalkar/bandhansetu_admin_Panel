
// src/hooks/useIncomeManagement.js
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

export const INCOME_KEYS = {
  all: ["incomes"],
};

// ====================== INCOME RANGES ======================
const fetchIncomes = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/admin/income`, {
    headers: getAuthHeaders(),
  });
  const json = await handleResponse(res);
  return json.incomes || [];
};

export const useGetIncomes = () =>
  useQuery({
    queryKey: INCOME_KEYS.all,
    queryFn: fetchIncomes,
    staleTime: 5 * 60 * 1000,
  });

export const useAddIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ income_label, sort_order }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/income`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ income_label, sort_order: Number(sort_order) }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: INCOME_KEYS.all }),
  });
};

export const useEditIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, income_label, sort_order }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/income/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ income_label, sort_order: Number(sort_order) }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: INCOME_KEYS.all }),
  });
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/income/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: INCOME_KEYS.all }),
  });
};