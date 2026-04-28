// src/features/auth/Authslice.js
import { createSlice } from "@reduxjs/toolkit";

// Safe way to get initial state from localStorage
const getInitialState = () => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    let user = null;

    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (parseError) {
        console.warn("Failed to parse user from localStorage. Clearing corrupted data.");
        localStorage.removeItem("user");
      }
    }

    return {
      isAuthenticated: !!token && !!user,   // Only authenticated if both exist
      user: user,
      token: token || null,
    };
  } catch (error) {
    console.error("Error loading auth state:", error);
    // Clear everything if something goes wrong
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    loginSuccess(state, action) {
  const { token, user } = action.payload;
  if (!token || !user) return;

  state.isAuthenticated = true;
  state.token = token;
  state.user = user;

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
},

    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Clear TanStack Query cache if exists
      if (window.queryClient?.clear) {
        window.queryClient.clear();
      }
    },

    updateUser(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;