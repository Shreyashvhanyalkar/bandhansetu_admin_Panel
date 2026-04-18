// src/hooks/useAuthMutations.js
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/auth/Authslice";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useLogin = () => {
  const dispatch = useDispatch();
  
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await fetch(`${BASE_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();

if (!response.ok || !data.status) {
  throw new Error(data.message || "Invalid email or password.");
}

const userData = {
  id: data.data.admin_id,
  name: `${data.data.first_name} ${data.data.last_name}`,
  email: data.data.email,
};

localStorage.setItem("token", data.data.token);

return {
  token: data.data.token,
  user: userData,
};
    },
    onSuccess: (data) => {
      dispatch(loginSuccess(data));
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async ({ name, email, password }) => {
      const response = await fetch(`${BASE_URL}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      
      return data;
    },
  });
};