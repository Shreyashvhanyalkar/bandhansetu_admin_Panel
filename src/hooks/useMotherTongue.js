// // src/hooks/useMotherTongue.js
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

// export const MOTHER_TONGUE_KEYS = {
//   all: ["mother-tongues"],
// };

// // ====================== MOTHER TONGUE ======================
// const fetchMotherTongues = async () => {
//   const res = await fetch(`${BASE_URL}/api/auth/admin/mother-tongue`, {
//     headers: getAuthHeaders(),
//   });
//   const json = await handleResponse(res);
//   return json.mother_tongues || [];
// };

// export const useGetMotherTongues = () =>
//   useQuery({
//     queryKey: MOTHER_TONGUE_KEYS.all,
//     queryFn: fetchMotherTongues,
//     staleTime: 5 * 60 * 1000,
//   });

// export const useAddMotherTongue = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ mothertongue_name }) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/mother-tongue`, {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ mothertongue_name }),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: MOTHER_TONGUE_KEYS.all }),
//   });
// };

// export const useEditMotherTongue = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ id, mothertongue_name }) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/mother-tongue/${id}`, {
//         method: "PUT",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ mothertongue_name }),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: MOTHER_TONGUE_KEYS.all }),
//   });
// };

// export const useDeleteMotherTongue = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/mother-tongue/${id}`, {
//         method: "DELETE",
//         headers: getAuthHeaders(),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: MOTHER_TONGUE_KEYS.all }),
//   });
// };