// pages/admin/ApproveReject.jsx
import { useState, useCallback, useEffect } from "react";
import {
  useAllUsers,
  useToggleUserStatus,
  useDeleteUser,
  useRestoreUser,
} from "../../hooks/useAdminQueries";

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#C026D3", "#7C3AED", "#0369A1", "#0F766E", "#B45309", "#BE123C"];
const PAGE_SIZES = [10, 25, 50, 100];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getAvatarColor = (id) =>
  AVATAR_COLORS[String(id).charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function ToggleSwitch({ checked, onChange, loading }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2"
      style={{ backgroundColor: checked ? "#C026D3" : "#d1d5db" }}
    >
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner className="h-3 w-3 text-white" />
        </span>
      ) : (
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      )}
    </button>
  );
}

function StatCard({ label, value, icon, color, bgColor, trend }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="absolute right-0 top-0 -mr-4 -mt-4 h-20 w-20 rounded-full opacity-10 transition-all duration-300 group-hover:scale-150" style={{ backgroundColor: color }} />
      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: bgColor }}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-800">{value?.toLocaleString() || "—"}</p>
          <p className="text-xs font-medium text-gray-400">{label}</p>
        </div>
        {trend && (
          <div className={`text-xs font-semibold ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, isDeleted = false }) {
  if (isDeleted) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-200">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Deleted
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        status === 1
          ? "bg-green-50 text-green-700 ring-green-200"
          : "bg-gray-50 text-gray-600 ring-gray-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status === 1 ? "bg-green-500" : "bg-gray-400"}`} />
      {status === 1 ? "Active" : "Inactive"}
    </span>
  );
}

function ActionButton({ onClick, disabled, title, variant, icon, children }) {
  const variants = {
    delete: "bg-red-50 text-red-600 hover:bg-red-100 ring-red-200",
    restore: "bg-green-50 text-green-600 hover:bg-green-100 ring-green-200",
    activate: "bg-green-50 text-green-700 hover:bg-green-100 ring-green-200",
    deactivate: "bg-amber-50 text-amber-700 hover:bg-amber-100 ring-amber-200",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:hover:scale-100 ${variants[variant]}`}
    >
      {icon}
      {children}
    </button>
  );
}

function Pagination({ pagination, page, onPage }) {
  if (!pagination || pagination.total_pages <= 1) return null;

  const { total_pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, page - Math.floor(showPages / 2));
    let end = Math.min(total_pages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total_pages - 1) pages.push("...");
    if (end < total_pages) pages.push(total_pages);

    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-700">{from}</span> to{" "}
        <span className="font-semibold text-gray-700">{to}</span> of{" "}
        <span className="font-semibold text-gray-700">{total}</span> users
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-xs text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                p === page
                  ? "bg-fuchsia-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === total_pages}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function FilterPanel({ filters, onChange, onClear, isOpen }) {
  if (!isOpen) return null;

  const hasActiveFilters = filters.status !== undefined || filters.deleted !== undefined;

  return (
    <div className="animate-slideDown rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-700">Advanced Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-red-500 transition hover:text-red-600"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Account Status
          </label>
          <div className="flex gap-2">
            {[
              { label: "All", value: undefined },
              { label: "Active", value: 1 },
              { label: "Inactive", value: 0 },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => onChange({ status: value })}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                  filters.status === value
                    ? "bg-fuchsia-600 text-white shadow-sm"
                    : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Deleted Users
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onChange({ deleted: filters.deleted === true ? undefined : true })}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                filters.deleted === true
                  ? "bg-fuchsia-600 text-white shadow-sm"
                  : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Show Deleted
            </button>
          </div>
          {filters.deleted === true && (
            <p className="text-[11px] text-amber-600">⚠️ Showing soft-deleted users — Restore option available</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ApproveReject() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: undefined,
    deleted: undefined,
  });
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: "", type: "" });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput.trim(), page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, error, refetch } = useAllUsers(filters);
  const users = data?.users ?? [];
  const pagination = data?.pagination ?? null;

  const toggleMutation = useToggleUserStatus();
  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();

  const isDeletedView = filters.deleted === true;

  const showNotification = (message, type = "success") => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: "", type: "" }), 3000);
  };

  const updateFilter = useCallback((partial) => {
    setFilters((f) => ({ ...f, ...partial, page: 1 }));
    setSelected(null);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 10, search: "", status: undefined, deleted: undefined });
    setSearchInput("");
    setSelected(null);
    showNotification("All filters cleared", "info");
  }, []);

  const handleToggle = useCallback(
    (user) => {
      const nextStatus = user.rawStatus === 1 ? 0 : 1;
      toggleMutation.mutate(
        { userId: user.id, status: nextStatus },
        {
          onSuccess: () => {
            if (selected?.id === user.id) {
              setSelected({ ...selected, rawStatus: nextStatus });
            }
            showNotification(
              `User ${user.name} ${nextStatus === 1 ? "activated" : "deactivated"} successfully`,
              "success"
            );
            refetch();
          },
          onError: () => {
            showNotification(`Failed to update user status`, "error");
          },
        }
      );
    },
    [toggleMutation, refetch, selected]
  );

  const confirmDelete = useCallback(() => {
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        if (selected?.id === deleteTarget.id) setSelected(null);
        showNotification(`User ${deleteTarget.name} deleted successfully`, "success");
        refetch();
      },
      onError: () => {
        showNotification(`Failed to delete user`, "error");
      },
    });
  }, [deleteMutation, deleteTarget, selected, refetch]);

  const confirmRestore = useCallback(() => {
    restoreMutation.mutate(restoreTarget.id, {
      onSuccess: () => {
        setRestoreTarget(null);
        if (selected?.id === restoreTarget.id) setSelected(null);
        showNotification(`User ${restoreTarget.name} restored successfully`, "success");
        refetch();
      },
      onError: () => {
        showNotification(`Failed to restore user`, "error");
      },
    });
  }, [restoreMutation, restoreTarget, selected, refetch]);

  const activeFilterCount = [filters.status !== undefined, filters.deleted !== undefined].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-fuchsia-100 border-t-fuchsia-600" />
        </div>
        <p className="text-sm font-medium text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="text-5xl">⚠️</div>
        <p className="text-center font-semibold text-red-600">{error?.message || "Failed to load users"}</p>
        <button
          onClick={() => refetch()}
          className="rounded-xl bg-fuchsia-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const total = pagination?.total ?? users.length;
  const activeCount = users.filter((u) => u.rawStatus === 1 && !u.isDeleted).length;
  const inactiveCount = users.filter((u) => u.rawStatus === 0 && !u.isDeleted).length;
  const deletedCount = users.filter((u) => u.isDeleted).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast.show && (
        <div className="fixed right-4 top-4 z-50 animate-slideIn rounded-xl bg-white shadow-lg ring-1 ring-black/5">
          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
              showToast.type === "success"
                ? "bg-green-50 text-green-800"
                : showToast.type === "error"
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
            }`}
          >
            {showToast.type === "success" && (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {showToast.type === "error" && (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {showToast.type === "info" && (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm font-medium">{showToast.message}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isDeletedView
              ? "Viewing soft-deleted users — click Restore to recover an account"
              : "Manage user accounts, control access, and handle deletions"}
          </p>
        </div>
        {isDeletedView && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Deleted View Active
            <button
              onClick={() => updateFilter({ deleted: undefined })}
              className="ml-2 text-xs underline hover:text-amber-900"
            >
              Exit
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Users" value={total} icon="👥" color="#C026D3" bgColor="#fdf4ff" />
        <StatCard label="Active" value={activeCount} icon="✅" color="#10b981" bgColor="#dcfce7" />
        <StatCard label="Inactive" value={inactiveCount} icon="⏸️" color="#6b7280" bgColor="#f3f4f6" />
        <StatCard label="Deleted" value={deletedCount} icon="🗑️" color="#ef4444" bgColor="#fee2e2" />
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            {isFetching ? (
              <Spinner className="h-4 w-4 text-fuchsia-500" />
            ) : (
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or mobile number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-700 outline-none transition-all focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                setFilters((f) => ({ ...f, search: "", page: 1 }));
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              filterOpen || activeFilterCount > 0
                ? "bg-fuchsia-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-fuchsia-600">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={filters.limit}
            onChange={(e) => setFilters((f) => ({ ...f, limit: Number(e.target.value), page: 1 }))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-fuchsia-400"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel filters={filters} onChange={updateFilter} onClear={clearFilters} isOpen={filterOpen} />

      {/* Main Content */}
      <div className="flex flex-col gap-4 xl:flex-row">
        {/* Users Table */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm ${
                    isDeletedView ? "bg-amber-100" : "bg-fuchsia-100"
                  }`}
                >
                  {isDeletedView ? "🗑️" : "👥"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{isDeletedView ? "Deleted Users" : "All Users"}</h3>
                  <p className="text-[11px] text-gray-400">
                    {pagination ? `${pagination.total} total` : `${users.length} results`}
                    {isFetching && <span className="ml-1 text-fuchsia-400">· refreshing...</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-fuchsia-600 disabled:opacity-40"
                title="Refresh"
              >
                <svg className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                {isDeletedView ? "🗑️" : "📭"}
              </div>
              <p className="font-semibold text-gray-500">{isDeletedView ? "No deleted users found" : "No users found"}</p>
              <p className="mt-1 text-sm text-gray-400">
                {isDeletedView ? "No accounts have been soft-deleted" : "Try adjusting your search or filters"}
              </p>
              {(filters.search || activeFilterCount > 0) && (
                <button onClick={clearFilters} className="mt-3 text-sm font-medium text-fuchsia-600 hover:text-fuchsia-700">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user) => {
                const isSelected = selected?.id === user.id;
                const isToggling = toggleMutation.isPending && toggleMutation.variables?.userId === user.id;
                const isDeleting = deleteMutation.isPending && deleteMutation.variables === user.id;
                const isRestoring = restoreMutation.isPending && restoreMutation.variables === user.id;

                return (
                  <div
                    key={user.id}
                    onClick={() => setSelected(isSelected ? null : user)}
                    className={`group cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? isDeletedView
                          ? "bg-amber-50/50"
                          : "bg-fuchsia-50/70"
                        : "hover:bg-gray-50/80"
                    }`}
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar & Info */}
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-105 ${
                              isDeletedView ? "opacity-60" : ""
                            }`}
                            style={{ background: getAvatarColor(user.id) }}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className={`truncate text-sm font-semibold ${isDeletedView ? "text-gray-400 line-through" : "text-gray-800"}`}>
                                {user.name}
                              </p>
                              {isDeletedView && (
                                <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                  Deleted
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs text-gray-400">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              {user.countryCode} {user.mobile}
                            </p>
                          </div>
                        </div>

                        {/* Status & Actions - Desktop */}
                        <div className="hidden items-center gap-4 sm:flex">
                          {!isDeletedView && <StatusBadge status={user.rawStatus} />}
                          {!isDeletedView && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <ToggleSwitch checked={user.rawStatus === 1} onChange={() => handleToggle(user)} loading={isToggling} />
                            </div>
                          )}
                          <div onClick={(e) => e.stopPropagation()}>
                            {isDeletedView ? (
                              <ActionButton
                                onClick={() => setRestoreTarget(user)}
                                disabled={isRestoring}
                                variant="restore"
                                icon={
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                }
                              >
                                Restore
                              </ActionButton>
                            ) : (
                              <ActionButton
                                onClick={() => setDeleteTarget(user)}
                                disabled={isDeleting}
                                variant="delete"
                                icon={
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                }
                              >
                                Delete
                              </ActionButton>
                            )}
                          </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="sm:hidden" onClick={(e) => e.stopPropagation()}>
                          {isDeletedView ? (
                            <button
                              onClick={() => setRestoreTarget(user)}
                              className="rounded-xl bg-green-50 p-2 text-green-600"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="rounded-xl bg-red-50 p-2 text-red-500"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pagination && (
            <div className="border-t border-gray-100 px-6 py-4">
              <Pagination pagination={pagination} page={filters.page} onPage={(p) => setFilters((f) => ({ ...f, page: p }))} />
            </div>
          )}
        </div>

        {/* User Details Panel */}
        {selected && (
          <div className="xl:w-96">
            <div className="sticky top-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className={`border-b border-gray-100 px-5 py-4 ${isDeletedView ? "bg-amber-50/30" : "bg-fuchsia-50/30"}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">User Details</h3>
                  <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-5 py-6 text-center">
                <div
                  className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-md ${
                    isDeletedView ? "opacity-50" : ""
                  }`}
                  style={{ background: getAvatarColor(selected.id) }}
                >
                  {getInitials(selected.name)}
                </div>
                <p className={`text-base font-bold ${isDeletedView ? "text-gray-400 line-through" : "text-gray-800"}`}>{selected.name}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {selected.countryCode} {selected.mobile}
                </p>
                <div className="mt-3">
                  {isDeletedView ? (
                    <StatusBadge isDeleted={true} />
                  ) : (
                    <StatusBadge status={selected.rawStatus} />
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Email</span>
                  <span className="break-all text-right text-xs font-medium text-gray-700">{selected.email}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Mobile</span>
                  <span className="text-right text-xs font-medium text-gray-700">
                    {selected.countryCode} {selected.mobile}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">User ID</span>
                  <span className="break-all text-right font-mono text-[11px] font-medium text-gray-700">{selected.id}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-100 px-5 py-4">
                {isDeletedView ? (
                  <ActionButton
                    onClick={() => setRestoreTarget(selected)}
                    disabled={restoreMutation.isPending && restoreMutation.variables === selected.id}
                    variant="restore"
                    fullWidth
                    icon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    }
                  >
                    {restoreMutation.isPending && restoreMutation.variables === selected.id ? "Restoring..." : "Restore Account"}
                  </ActionButton>
                ) : (
                  <>
                    <ActionButton
                      onClick={() => handleToggle(selected)}
                      disabled={toggleMutation.isPending && toggleMutation.variables?.userId === selected.id}
                      variant={selected.rawStatus === 1 ? "deactivate" : "activate"}
                      fullWidth
                      icon={
                        selected.rawStatus === 1 ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )
                      }
                    >
                      {toggleMutation.isPending && toggleMutation.variables?.userId === selected.id
                        ? "Processing..."
                        : selected.rawStatus === 1
                        ? "Deactivate Account"
                        : "Activate Account"}
                    </ActionButton>

                    <ActionButton
                      onClick={() => setDeleteTarget(selected)}
                      disabled={deleteMutation.isPending && deleteMutation.variables === selected.id}
                      variant="delete"
                      fullWidth
                      icon={
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      }
                    >
                      {deleteMutation.isPending && deleteMutation.variables === selected.id ? "Deleting..." : "Delete User"}
                    </ActionButton>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-scaleIn rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Delete User?</h3>
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{deleteTarget.name}</span> will be soft-deleted. Their data is preserved and can be
                restored later.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {restoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-scaleIn rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
                <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Restore User?</h3>
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{restoreTarget.name}</span> will be restored and will be able to access their account
                again.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setRestoreTarget(null)}
                className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                disabled={restoreMutation.isPending}
                className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                {restoreMutation.isPending ? "Restoring..." : "Yes, Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}