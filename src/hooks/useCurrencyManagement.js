// // src/hooks/useCurrencyManagement.js
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

// export const CURRENCY_KEYS = {
//   all: ["currencies"],
// };

// // ====================== CURRENCY ======================
// const fetchCurrencies = async () => {
//   const res = await fetch(`${BASE_URL}/api/auth/admin/currency`, {
//     headers: getAuthHeaders(),
//   });
//   const json = await handleResponse(res);
//   return json.currencies || [];
// };

// export const useGetCurrencies = () =>
//   useQuery({
//     queryKey: CURRENCY_KEYS.all,
//     queryFn: fetchCurrencies,
//     staleTime: 5 * 60 * 1000,
//   });

// export const useAddCurrency = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ currency_type }) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/currency`, {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ currency_type }),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: CURRENCY_KEYS.all }),
//   });
// };

// export const useEditCurrency = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ id, currency_type }) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/currency/${id}`, {
//         method: "PUT",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ currency_type }),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: CURRENCY_KEYS.all }),
//   });
// };

// export const useDeleteCurrency = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/currency/${id}`, {
//         method: "DELETE",
//         headers: getAuthHeaders(),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: CURRENCY_KEYS.all }),
//   });
// };