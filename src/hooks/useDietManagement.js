// // src/hooks/useDietManagement.js
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const getAuthHeaders = () => ({
//   "Content-Type": "application/json",
//   Authorization: `Bearer ${localStorage.getItem("token")}`,
//   "x-app-type": "admin",
// });

// const handleResponse = async (res) => {
//   const json = await res.json();
//   if (!res.ok || json.status === false) {
//     throw new Error(json.message || "Something went wrong");
//   }
//   return json;
// };

// export const DIET_KEYS = {
//   all: ["diets"],
// };

// // ====================== DIETS ======================
// const fetchDiets = async () => {
//   const res = await fetch(`${BASE_URL}/api/auth/admin/diet`, {
//     headers: getAuthHeaders(),
//   });
//   const json = await handleResponse(res);
//   return json.diets || [];
// };

// export const useGetDiets = () =>
//   useQuery({
//     queryKey: DIET_KEYS.all,
//     queryFn: fetchDiets,
//     staleTime: 5 * 60 * 1000,
//   });

// export const useAddDiet = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ diet_name }) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/diet`, {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ diet_name }),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: DIET_KEYS.all }),
//   });
// };

// export const useEditDiet = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ id, diet_name }) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/diet/${id}`, {
//         method: "PUT",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ diet_name }),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: DIET_KEYS.all }),
//   });
// };

// export const useDeleteDiet = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/diet/${id}`, {
//         method: "DELETE",
//         headers: getAuthHeaders(),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: DIET_KEYS.all }),
//   });
// };