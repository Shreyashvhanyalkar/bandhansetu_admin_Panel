// // src/hooks/useBodySkinManagement.js
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

// export const BODY_SKIN_KEYS = {
//   bodyTypes: ["body-types"],
//   skinTones: ["skin-tones"],
// };

// // ====================== BODY TYPES ======================
// const fetchBodyTypes = async () => {
//   const res = await fetch(`${BASE_URL}/api/auth/admin/body-type`, {
//     headers: getAuthHeaders(),
//   });
//   const json = await handleResponse(res);
//   return json.body_types || [];
// };

// export const useGetBodyTypes = () =>
//   useQuery({
//     queryKey: BODY_SKIN_KEYS.bodyTypes,
//     queryFn: fetchBodyTypes,
//     staleTime: 5 * 60 * 1000,
//   });

// export const useAddBodyType = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ body_type_name }) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/body-type`, {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ body_type_name }),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: BODY_SKIN_KEYS.bodyTypes }),
//   });
// };

// export const useEditBodyType = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ id, body_type_name }) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/body-type/${id}`, {
//         method: "PUT",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ body_type_name }),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: BODY_SKIN_KEYS.bodyTypes }),
//   });
// };

// export const useDeleteBodyType = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/body-type/${id}`, {
//         method: "DELETE",
//         headers: getAuthHeaders(),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: BODY_SKIN_KEYS.bodyTypes }),
//   });
// };

// // ====================== SKIN TONES ======================
// const fetchSkinTones = async () => {
//   const res = await fetch(`${BASE_URL}/api/auth/admin/skin-tone`, {
//     headers: getAuthHeaders(),
//   });
//   const json = await handleResponse(res);
//   return json.skin_tones || [];
// };

// export const useGetSkinTones = () =>
//   useQuery({
//     queryKey: BODY_SKIN_KEYS.skinTones,
//     queryFn: fetchSkinTones,
//     staleTime: 5 * 60 * 1000,
//   });

// export const useAddSkinTone = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ skin_tone_name }) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/skin-tone`, {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ skin_tone_name }),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: BODY_SKIN_KEYS.skinTones }),
//   });
// };

// export const useEditSkinTone = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ id, skin_tone_name }) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/skin-tone/${id}`, {
//         method: "PUT",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ skin_tone_name }),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: BODY_SKIN_KEYS.skinTones }),
//   });
// };

// export const useDeleteSkinTone = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id) => {
//       const res = await fetch(`${BASE_URL}/api/auth/admin/skin-tone/${id}`, {
//         method: "DELETE",
//         headers: getAuthHeaders(),
//       });
//       return handleResponse(res);
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: BODY_SKIN_KEYS.skinTones }),
//   });
// };