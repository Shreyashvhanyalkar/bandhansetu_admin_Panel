// src/hooks/useWorkingCategory.js
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

export const WORKING_KEYS = {
  categories: ["working", "categories"],
  subcategories: (categoryId) => ["working", "subcategories", categoryId],
  workingWith: ["working", "with"],
};

// ====================== WORKING CATEGORIES ======================
const fetchWorkingCategories = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/admin/working-category`, {
    headers: getAuthHeaders(),
  });
  const json = await handleResponse(res);
  return json.working_categories || [];
};

export const useGetWorkingCategories = () =>
  useQuery({
    queryKey: WORKING_KEYS.categories,
    queryFn: fetchWorkingCategories,
    staleTime: 5 * 60 * 1000,
  });

export const useAddWorkingCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ category_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/working-category`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ category_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: WORKING_KEYS.categories }),
  });
};

export const useEditWorkingCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, category_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/working-category/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ category_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: WORKING_KEYS.categories }),
  });
};

export const useDeleteWorkingCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/working-category/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: WORKING_KEYS.categories }),
  });
};

// ====================== WORKING SUBCATEGORIES ======================
const fetchWorkingSubcategories = async (categoryId) => {
  if (!categoryId) return [];
  const res = await fetch(
    `${BASE_URL}/api/auth/admin/working-subcategory?category_id=${categoryId}`,
    { headers: getAuthHeaders() }
  );
  const json = await handleResponse(res);
  return json.working_subcategories || [];
};

export const useGetWorkingSubcategories = (categoryId) =>
  useQuery({
    queryKey: WORKING_KEYS.subcategories(categoryId),
    queryFn: () => fetchWorkingSubcategories(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });

export const useAddWorkingSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subcategory_name, category_id }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/working-subcategory`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ subcategory_name, category_id }),
      });
      return handleResponse(res);
    },
    onSuccess: (_, { category_id }) =>
      queryClient.invalidateQueries({
        queryKey: WORKING_KEYS.subcategories(category_id),
      }),
  });
};

export const useEditWorkingSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, subcategory_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/working-subcategory/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ subcategory_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["working", "subcategories"],
        exact: false,
      }),
  });
};

export const useDeleteWorkingSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/working-subcategory/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["working", "subcategories"],
        exact: false,
      }),
  });
};

// ====================== WORKING WITH ======================
const fetchWorkingWith = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/admin/working-with`, {
    headers: getAuthHeaders(),
  });
  const json = await handleResponse(res);
  return json.working_with || [];
};

export const useGetWorkingWith = () =>
  useQuery({
    queryKey: WORKING_KEYS.workingWith,
    queryFn: fetchWorkingWith,
    staleTime: 5 * 60 * 1000,
  });

export const useAddWorkingWith = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ working_with_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/working-with`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ working_with_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: WORKING_KEYS.workingWith }),
  });
};

export const useEditWorkingWith = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, working_with_name }) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/working-with/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ working_with_name }),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: WORKING_KEYS.workingWith }),
  });
};

export const useDeleteWorkingWith = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/working-with/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: WORKING_KEYS.workingWith }),
  });
};