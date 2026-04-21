import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "http://bandhan-setu-prod.eba-am6hwsad.ap-south-1.elasticbeanstalk.com";

// ─── Helper ───────────────────────────────────────────────────────────────────
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const json = await res.json();
  if (!json.status) throw new Error(json.message || "Something went wrong.");
  return json;
};

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const RELIGION_KEYS = {
  all: ["religions"],
  castes: (religionId) => ["castes", religionId],
  subcasts: (casteId) => ["subcasts", casteId],
};

// ══════════════════════════════════════════════════════════════════════════════
//  RELIGION APIs
// ══════════════════════════════════════════════════════════════════════════════

const fetchReligions = async () => {
  const res = await fetch(`${BASE_URL}/admin/religion`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const json = await handleResponse(res);
  return json.data.religions;
};

export const useGetReligions = () =>
  useQuery({
    queryKey: RELIGION_KEYS.all,
    queryFn: fetchReligions,
    staleTime: 5 * 60 * 1000,
  });

const addReligion = async ({ id, religion_name }) => {
  const res = await fetch(`${BASE_URL}/admin/religion`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, religion_name }),
  });
  return handleResponse(res);
};

export const useAddReligion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addReligion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RELIGION_KEYS.all }),
  });
};

const editReligion = async ({ id, religion_name }) => {
  const res = await fetch(`${BASE_URL}/admin/religion/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ religion_name }),
  });
  return handleResponse(res);
};

export const useEditReligion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editReligion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RELIGION_KEYS.all }),
  });
};

const deleteReligion = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/religion/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const useDeleteReligion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReligion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RELIGION_KEYS.all }),
  });
};

// ══════════════════════════════════════════════════════════════════════════════
//  CASTE APIs
// ══════════════════════════════════════════════════════════════════════════════

const fetchCastesByReligion = async (religionId) => {
  if (!religionId) return [];
  const res = await fetch(`${BASE_URL}/admin/caste?religion_id=${religionId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const json = await handleResponse(res);
  return json.data.castes;
};

export const useGetCastes = (religionId) =>
  useQuery({
    queryKey: RELIGION_KEYS.castes(religionId),
    queryFn: () => fetchCastesByReligion(religionId),
    enabled: !!religionId,
    staleTime: 5 * 60 * 1000,
  });

const addCaste = async ({ id, caste_name, religion_id }) => {
  const res = await fetch(`${BASE_URL}/admin/caste`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, caste_name, religion_id }),
  });
  return handleResponse(res);
};

export const useAddCaste = (religionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCaste,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: RELIGION_KEYS.castes(religionId) }),
  });
};

const editCaste = async ({ id, caste_name, religion_id }) => {
  const res = await fetch(`${BASE_URL}/admin/caste/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ caste_name, religion_id }),
  });
  return handleResponse(res);
};

export const useEditCaste = (religionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editCaste,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: RELIGION_KEYS.castes(religionId) }),
  });
};

const deleteCaste = async ({ id }) => {
  const res = await fetch(`${BASE_URL}/admin/caste/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const useDeleteCaste = (religionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCaste,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: RELIGION_KEYS.castes(religionId) }),
  });
};

// ══════════════════════════════════════════════════════════════════════════════
//  SUBCAST APIs
// ══════════════════════════════════════════════════════════════════════════════

// ── Fetch subcasts by caste ───────────────────────────────────────────────────
const fetchSubcastsByCaste = async (casteId) => {
  if (!casteId) return [];
  const res = await fetch(`${BASE_URL}/admin/subcast?caste_id=${casteId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const json = await handleResponse(res);
  return json.data.subcasts; // [{ id, subcaste_name, caste_id }]
};

export const useGetSubcasts = (casteId) =>
  useQuery({
    queryKey: RELIGION_KEYS.subcasts(casteId),
    queryFn: () => fetchSubcastsByCaste(casteId),
    enabled: !!casteId,
    staleTime: 5 * 60 * 1000,
  });

// ── Add subcast ───────────────────────────────────────────────────────────────
const addSubcast = async ({ id, subcaste_name, caste_id }) => {
  const res = await fetch(`${BASE_URL}/admin/subcast`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, subcaste_name, caste_id }),
  });
  return handleResponse(res);
};

export const useAddSubcast = (casteId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSubcast,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: RELIGION_KEYS.subcasts(casteId) }),
  });
};

// ── Edit subcast ──────────────────────────────────────────────────────────────
const editSubcast = async ({ id, subcaste_name }) => {
  const res = await fetch(`${BASE_URL}/admin/subcast/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ subcaste_name }),
  });
  return handleResponse(res);
};

export const useEditSubcast = (casteId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editSubcast,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: RELIGION_KEYS.subcasts(casteId) }),
  });
};

// ── Delete subcast ────────────────────────────────────────────────────────────
const deleteSubcast = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/subcast/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const useDeleteSubcast = (casteId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSubcast,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: RELIGION_KEYS.subcasts(casteId) }),
  });
};