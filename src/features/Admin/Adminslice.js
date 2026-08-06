import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, getAuthHeaders } from "../../utils/apiClient";

// Fetch all pending users
export const fetchPendingUsers = createAsyncThunk(
  "admin/fetchPendingUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/admin/users/pending`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to fetch users.");
      }

      return data.pending_users; // array of { id, name, email, mobile }
    } catch (err) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Approve a user by ID
export const approveUser = createAsyncThunk(
  "admin/approveUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/admin/users/approve/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to approve user.");
      }

      return userId; // return id so we can update state
    } catch (err) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Update a user by ID
export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ id, name, email, mobile }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/admin/users/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, mobile }),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to update user.");
      }

      return { id, name, email, mobile }; // return updated fields to patch state
    } catch (err) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Delete a user by ID
export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/admin/users/delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to delete user.");
      }

      return userId; // return id to remove from state
    } catch (err) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    loading: false,
    error: null,
    actionLoadingId: null,  // approve in-flight
    updateLoadingId: null,  // update in-flight
    deleteLoadingId: null,  // delete in-flight
    actionError: null,
  },
  reducers: {
    // Local-only status update (used for reject / reset until reject API is added)
    updateUserStatus(state, action) {
      const { id, status } = action.payload;
      const user = state.users.find((u) => u.id === id);
      if (user) user.status = status;
    },
    clearAdminError(state) {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch pending users ──────────────────────────────
      .addCase(fetchPendingUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.map((u) => ({ ...u, status: "pending" }));
      })
      .addCase(fetchPendingUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Approve user ─────────────────────────────────────
      .addCase(approveUser.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg;
        state.actionError = null;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        const user = state.users.find((u) => u.id === action.payload);
        if (user) user.status = "approved";
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.actionError = action.payload;
      })

      // ── Update user ──────────────────────────────────────
      .addCase(updateUser.pending, (state, action) => {
        state.updateLoadingId = action.meta.arg.id;
        state.actionError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoadingId = null;
        const { id, name, email, mobile } = action.payload;
        const user = state.users.find((u) => u.id === id);
        if (user) {
          user.name = name;
          user.email = email;
          user.mobile = mobile;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoadingId = null;
        state.actionError = action.payload;
      })

      // ── Delete user ──────────────────────────────────────
      .addCase(deleteUser.pending, (state, action) => {
        state.deleteLoadingId = action.meta.arg;
        state.actionError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoadingId = null;
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoadingId = null;
        state.actionError = action.payload;
      });
  },
});

export const { updateUserStatus, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;