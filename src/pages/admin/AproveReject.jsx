// pages/admin/ApproveReject.jsx
// pages/admin/ApproveReject.jsx
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";     // ← ADD THIS LINE

import {
  useAllUsers,
  useToggleUserStatus,
  useDeleteUser,
  useRestoreUser,
} from "../../hooks/useAdminQueries";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#e990e8",      // Slightly lighter than original #a21caf
  primaryDark: "#da0eed",
  primaryLight: "#fdf4ff",
  primaryMid: "#fae8ff",
  primaryBorder: "#f0abfc",
  active: "#047857",
  activeBg: "#ecfdf5",
  activeBorder: "#a7f3d0",
  inactive: "#64748b",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  warn: "#b45309",
  warnBg: "#fffbeb",
  info: "#3b82f6",
  infoBg: "#eff6ff",
  infoBorder: "#bfdbfe",
};

const AVATAR_PALETTE = ["#a21caf", "#7C3AED", "#0369A1", "#0F766E", "#B45309", "#BE123C"];
const PAGE_SIZES = [10, 25, 50, 100];

// ─── Enhanced mock data with received requests ────────────────────────────────
const MOCK_SENT_REQUESTS = [
  { id: 1, to: "Priya Sharma", toId: "101", avatar: "PS", color: "#7C3AED", status: "accepted", date: "12 Jan 2025" },
  { id: 2, to: "Aarti Verma", toId: "102", avatar: "AV", color: "#0369A1", status: "pending", date: "18 Jan 2025" },
  { id: 3, to: "Sunita Rao", toId: "103", avatar: "SR", color: "#0F766E", status: "rejected", date: "22 Jan 2025" },
  { id: 4, to: "Meena Patel", toId: "104", avatar: "MP", color: "#B45309", status: "accepted", date: "03 Feb 2025" },
  { id: 5, to: "Kavya Nair", toId: "105", avatar: "KN", color: "#BE123C", status: "pending", date: "10 Feb 2025" },
  { id: 6, to: "Deepa Iyer", toId: "106", avatar: "DI", color: "#a21caf", status: "withdrawn", date: "15 Feb 2025" },
];

const MOCK_RECEIVED_REQUESTS = [
  { id: 7, from: "Rahul Mehta", fromId: "201", avatar: "RM", color: "#7C3AED", status: "accepted", date: "10 Jan 2025" },
  { id: 8, from: "Vikram Singh", fromId: "202", avatar: "VS", color: "#0369A1", status: "pending", date: "15 Jan 2025" },
  { id: 9, from: "Anjali Sharma", fromId: "203", avatar: "AS", color: "#0F766E", status: "rejected", date: "20 Jan 2025" },
  { id: 10, from: "Rajesh Kumar", fromId: "204", avatar: "RK", color: "#B45309", status: "accepted", date: "25 Jan 2025" },
  { id: 11, from: "Neha Gupta", fromId: "205", avatar: "NG", color: "#BE123C", status: "pending", date: "01 Feb 2025" },
  { id: 12, from: "Suresh Patel", fromId: "206", avatar: "SP", color: "#a21caf", status: "accepted", date: "05 Feb 2025" },
];

const MOCK_DOCS = [
  { id: 1, name: "Aadhaar Card", type: "identity", status: "verified", icon: "🪪", url: "#" },
  { id: 2, name: "PAN Card", type: "identity", status: "verified", icon: "💳", url: "#" },
  { id: 3, name: "10th Marksheet", type: "education", status: "pending", icon: "📄", url: "#" },
  { id: 4, name: "Degree Certificate", type: "education", status: "unverified", icon: "🎓", url: "#" },
  { id: 5, name: "Salary Slip", type: "income", status: "verified", icon: "💰", url: "#" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const avatarColor = (id) => AVATAR_PALETTE[String(id).charCodeAt(0) % AVATAR_PALETTE.length];
const initials = (name = "") =>
  name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = C.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color }}>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, id, size = 36, muted = false, src }) {
  const bg = avatarColor(id ?? name);
  if (src) {
    return (
      <img src={src} alt={name}
        className={`rounded-xl object-cover shrink-0 ${muted ? "opacity-50" : ""}`}
        style={{ width: size, height: size }} />
    );
  }
  return (
    <span
      className={`rounded-xl flex items-center justify-center font-bold text-white shrink-0 select-none transition-transform group-hover:scale-105 ${muted ? "opacity-50" : ""}`}
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, className = "" }) {
  return (
    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full tracking-wide ${className}`}>
      {children}
    </span>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, loading }) {
  return (
    <button onClick={onChange} disabled={loading}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60"
      style={{ backgroundColor: checked ? C.primary : "#d1d5db" }}>
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={12} color="#fff" />
        </span>
      ) : (
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      )}
    </button>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, initText, color, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 text-sm"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
        {icon || initText}
      </span>
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold" style={{ color }}>{value?.toLocaleString() ?? "—"}</p>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, isDeleted }) {
  if (isDeleted) return <Badge className="bg-red-100 text-red-700"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />Deleted</Badge>;
  return status === 1
    ? <Badge className="bg-green-100 text-green-700"><span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />Active</Badge>
    : <Badge className="bg-gray-100 text-gray-500"><span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mr-1" />Inactive</Badge>;
}

// ─── Icon Button ──────────────────────────────────────────────────────────────
function IconBtn({ onClick, disabled, danger, title, children }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed
        ${danger ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-fuchsia-700 hover:bg-fuchsia-50"}`}>
      {children}
    </button>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, isPending, title, message, confirmLabel, accentColor = C.danger }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(30,0,40,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: accentColor + "18" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
            <button onClick={onConfirm} disabled={isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
              {isPending ? <><Spinner size={14} color="#fff" /> Processing…</> : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────
function ResetPasswordModal({ isOpen, onClose, onConfirm, isPending, userName }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setConfirmPassword("");
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) newErrors.password = "Must contain uppercase, lowercase & number";
    if (password !== confirmPassword) newErrors.confirm = "Passwords don't match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      await onConfirm(password);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "modalIn 0.2s ease-out" }}>
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.primary}88)` }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.primary}15` }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.8">
                  <rect x="5" y="11" width="14" height="11" rx="2" strokeLinecap="round" />
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
                <p className="text-xs text-gray-500">For {userName}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all focus:ring-2 ${errors.password ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:ring-fuchsia-100"}`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.88 9.88a3 3 0 104.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0112 5c7 0 11 7 11 7a18.45 18.45 0 01-2.56 3.44" />
                      <path d="M6.24 6.24A18.45 18.45 0 011 12s4 7 11 7c1.31 0 2.57-.24 3.76-.76" />
                      <path d="M2 2l20 20" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all ${errors.confirm ? "border-red-300" : "border-gray-200"}`}
                placeholder="Confirm new password"
              />
              {errors.confirm && <p className="text-[10px] text-red-500 mt-1">{errors.confirm}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` }}>
                {isPending ? <Spinner size={14} color="#fff" /> : "Reset Password"}
              </button>
            </div>
          </form>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center">Password must be at least 8 characters and contain uppercase, lowercase & number</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ show, message, type }) {
  if (!show) return null;
  const cfg = {
    success: { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0", icon: "✓" },
    error: { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: "✕" },
    info: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", icon: "ℹ" },
  }[type] ?? { bg: "#f9fafb", text: "#374151", border: "#e5e7eb", icon: "•" };
  return (
    <div className="fixed right-4 top-4 z-[70] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium border"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border, animation: "slideIn 0.3s ease both" }}>
      <span className="font-bold text-base">{cfg.icon}</span>
      {message}
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onClear, isOpen }) {
  if (!isOpen) return null;
  const hasActive = filters.status !== undefined || filters.deleted !== undefined || filters.gender !== undefined;
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: C.primaryBorder, animation: "slideDown 0.25s ease both" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700">Advanced Filters</p>
        {hasActive && <button onClick={onClear} className="text-xs font-semibold hover:underline" style={{ color: C.danger }}>Clear all</button>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Account Status</p>
          <div className="flex gap-2">
            {[{ label: "All", value: undefined }, { label: "Active", value: 1 }, { label: "Inactive", value: 0 }].map(({ label, value }) => (
              <button key={label} onClick={() => onChange({ status: value })}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border transition"
                style={filters.status === value
                  ? { background: C.primary, color: "#fff", borderColor: C.primary }
                  : { background: "#f8fafc", color: "#475569", borderColor: "#e2e8f0" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Deleted Users</p>
          <button onClick={() => onChange({ deleted: filters.deleted === true ? undefined : true })}
            className="w-full py-2 rounded-xl text-xs font-semibold border transition"
            style={filters.deleted === true
              ? { background: C.primary, color: "#fff", borderColor: C.primary }
              : { background: "#f8fafc", color: "#475569", borderColor: "#e2e8f0" }}>
            Show Deleted
          </button>
          {filters.deleted === true && <p className="text-[11px] text-amber-600 mt-1.5">⚠️ Showing soft-deleted — Restore option available</p>}
        </div>

        {/* Gender Filter */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Gender</p>
          <div className="flex gap-2">
            {[
              { label: "All", value: undefined },
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" }
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => onChange({ gender: value })}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border transition"
                style={filters.gender === value
                  ? { background: C.primary, color: "#fff", borderColor: C.primary }
                  : { background: "#f8fafc", color: "#475569", borderColor: "#e2e8f0" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ pagination, page, onPage }) {
  if (!pagination || pagination.total_pages <= 1) return null;
  const { total_pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = (() => {
    const list = []; const show = 5;
    let s = Math.max(1, page - Math.floor(show / 2));
    let e = Math.min(total_pages, s + show - 1);
    if (e - s + 1 < show) s = Math.max(1, e - show + 1);
    if (s > 1) list.push(1); if (s > 2) list.push("…");
    for (let i = s; i <= e; i++) list.push(i);
    if (e < total_pages - 1) list.push("…"); if (e < total_pages) list.push(total_pages);
    return list;
  })();
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs text-gray-400">Showing <span className="font-semibold text-gray-700">{from}–{to}</span> of <span className="font-semibold text-gray-700">{total}</span></p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {pages.map((p, i) => p === "…"
          ? <span key={`d${i}`} className="px-1 text-xs text-gray-400">…</span>
          : <button key={p} onClick={() => onPage(p)}
            className="w-8 h-8 rounded-lg text-xs font-semibold transition"
            style={p === page ? { background: C.primary, color: "#fff" } : { color: "#475569" }}
            onMouseEnter={(e) => { if (p !== page) e.currentTarget.style.background = C.primaryMid; }}
            onMouseLeave={(e) => { if (p !== page) e.currentTarget.style.background = ""; }}>
            {p}
          </button>
        )}
        <button onClick={() => onPage(page + 1)} disabled={page === total_pages}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-36 bg-gray-200 rounded-lg" />
        <div className="h-3 w-48 bg-gray-100 rounded-lg" />
      </div>
      <div className="h-5 w-16 bg-gray-100 rounded-full" />
      <div className="h-6 w-11 bg-gray-200 rounded-full" />
      <div className="h-8 w-20 bg-gray-100 rounded-xl" />
    </div>
  );
}

// ─── User Row ─────────────────────────────────────────────────────────────────
function UserRow({ user, isSelected, isDeletedView, onSelect, onToggle, onDelete, onRestore, isToggling, isDeleting, isRestoring }) {
  return (
    <div onClick={onSelect}
      className="group cursor-pointer transition-all duration-150 border-b border-gray-100 last:border-0 hover:shadow-sm"
      style={{ background: isSelected ? (isDeletedView ? "#fffbeb" : C.primaryLight) : "white" }}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-0.5 h-10 rounded-full transition-all" style={{ background: isSelected ? C.primary : "transparent" }} />
        <Avatar name={user.name} id={user.id} size={40} muted={isDeletedView} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold truncate ${isDeletedView ? "text-gray-400 line-through" : "text-gray-800"}`}>{user.name}</span>
            <StatusBadge status={user.rawStatus} isDeleted={isDeletedView && user.isDeleted} />
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
          <p className="text-xs text-gray-400">{user.countryCode} {user.mobile}</p>
        </div>
        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!isDeletedView && <Toggle checked={user.rawStatus === 1} onChange={onToggle} loading={isToggling} />}
          {isDeletedView ? (
            <button onClick={onRestore} disabled={isRestoring}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition disabled:opacity-50 hover:scale-105"
              style={{ borderColor: C.activeBorder, color: C.active, background: C.activeBg }}>
              {isRestoring ? <Spinner size={12} color={C.active} /> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4v5h5M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 9a8 8 0 0114.93-3.5M20 15a8 8 0 01-14.93 3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              Restore
            </button>
          ) : (
            <button onClick={onDelete} disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition disabled:opacity-50 hover:scale-105"
              style={{ borderColor: C.dangerBorder, color: C.danger, background: C.dangerBg }}>
              {isDeleting ? <Spinner size={12} color={C.danger} /> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6" strokeLinecap="round" /><path d="M19 6l-1 14H6L5 6" strokeLinecap="round" /><path d="M10 11v6M14 11v6" strokeLinecap="round" /></svg>}
              Delete
            </button>
          )}
        </div>
        {/* Mobile actions */}
        <div className="sm:hidden" onClick={(e) => e.stopPropagation()}>
          {isDeletedView
            ? <IconBtn onClick={onRestore} disabled={isRestoring} title="Restore"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4v5h5M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 9a8 8 0 0114.93-3.5M20 15a8 8 0 01-14.93 3.5" strokeLinecap="round" strokeLinejoin="round" /></svg></IconBtn>
            : <IconBtn onClick={onDelete} disabled={isDeleting} danger title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6" strokeLinecap="round" /><path d="M19 6l-1 14H6L5 6" strokeLinecap="round" /></svg></IconBtn>
          }
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ENHANCED USER DETAIL MODAL with Received Requests & Password Reset
// ═══════════════════════════════════════════════════════════════════════════════
const REQ_STATUS_CFG = {
  accepted: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Accepted" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  rejected: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Rejected" },
  withdrawn: { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400", label: "Withdrawn" },
};

const DOC_STATUS_CFG = {
  verified: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Verified" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  unverified: { bg: "bg-gray-50", text: "text-gray-500", label: "Unverified" },
};

function UserDetailModal({
  user,
  isDeletedView,
  onClose,
  onToggle,
  onDelete,
  onRestore,
  onResetPassword,
  onViewFullProfile,
  togglePending,
  deletePending,
  restorePending,
  resetPending = false,
  sentRequests = MOCK_SENT_REQUESTS,
  receivedRequests = MOCK_RECEIVED_REQUESTS,
  documents = MOCK_DOCS,
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImg, setProfileImg] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Calculate statistics
  const sentCount = sentRequests.length;
  const receivedCount = receivedRequests.length;
  const acceptedReceived = receivedRequests.filter(r => r.status === "accepted").length;
  const pendingReceived = receivedRequests.filter(r => r.status === "pending").length;
  const rejectedReceived = receivedRequests.filter(r => r.status === "rejected").length;
  const acceptedSent = sentRequests.filter(r => r.status === "accepted").length;
  const pendingSent = sentRequests.filter(r => r.status === "pending").length;
  const rejectedSent = sentRequests.filter(r => r.status === "rejected").length;

  const handleImgChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImg(reader.result);
    reader.readAsDataURL(file);
  };

  const handleResetPasswordClick = () => {
    setIsResetModalOpen(true);
  };

  const TABS = [
    { key: "profile", label: "Profile", icon: "👤" },
    { key: "sent", label: "Sent", icon: "📤", count: sentCount },
    { key: "received", label: "Received", icon: "📥", count: receivedCount },
    { key: "docs", label: "Documents", icon: "📄", count: documents.filter(d => d.status === "pending").length },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(30,0,40,0.55)", backdropFilter: "blur(8px)" }}>
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          style={{ animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}>

          {/* Colored top bar */}
          <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.primary}88)` }} />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
            style={{ borderColor: C.primaryMid, background: "linear-gradient(135deg, #fdf4ff 0%, #f8fafc 100%)" }}>
            <div className="flex items-center gap-4">
              {/* Profile picture with upload */}
              <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {profileImg
                  ? <img src={profileImg} alt={user.name} className="w-16 h-16 rounded-xl object-cover ring-2 ring-fuchsia-200" />
                  : <span className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-white text-2xl"
                    style={{ background: `linear-gradient(135deg, ${avatarColor(user.id)}, ${avatarColor(user.id)}cc)` }}>
                    {initials(user.name)}
                  </span>
                }
                <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                  </svg>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImgChange} />
              </div>

              <div>
                <p className={`text-xl font-bold tracking-tight ${isDeletedView ? "text-gray-400 line-through" : "text-gray-900"}`}>
                  {user.name}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={user.rawStatus} isDeleted={isDeletedView && user.isDeleted} />
                  <span className="text-xs text-gray-400">{user.countryCode} {user.mobile}</span>
                </div>
              </div>
            </div>

            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-fuchsia-100 hover:text-fuchsia-700 transition shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-100 shrink-0 px-6 bg-white">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="relative py-3 px-4 text-sm font-semibold transition-all flex items-center gap-2"
                style={{ color: activeTab === tab.key ? C.primary : "#94A3B8" }}>
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                    style={{ background: C.primaryMid, color: C.primary }}>{tab.count}</span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: C.primary }} />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto flex-1 p-6 space-y-5">

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <>
                {/* Request stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-gray-100 p-3 text-center bg-gradient-to-br from-fuchsia-50/50 to-white">
                    <p className="text-2xl font-bold" style={{ color: C.primary }}>{sentCount}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Sent</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-3 text-center bg-gradient-to-br from-emerald-50/50 to-white">
                    <p className="text-2xl font-bold" style={{ color: C.active }}>{acceptedReceived}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Received & Accepted</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-3 text-center bg-gradient-to-br from-amber-50/50 to-white">
                    <p className="text-2xl font-bold" style={{ color: C.warn }}>{pendingReceived}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Pending Response</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-3 text-center bg-gradient-to-br from-red-50/50 to-white">
                    <p className="text-2xl font-bold" style={{ color: C.danger }}>{rejectedReceived}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Rejected</p>
                  </div>
                </div>

                {/* User details */}
                <div className="space-y-3 bg-gray-50/50 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Account Information</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Full Name", value: user.name },
                      { label: "Platform ID", value: user.platformId, mono: true },
                      { label: "Gender", value: user.gender || "—" },
                      { label: "Email Address", value: user.email },
                      { label: "Mobile Number", value: `${user.countryCode} ${user.mobile}` },
                      // { label: "User ID", value: user.id, mono: true },
                    ].map(({ label, value, mono }) => (
                      <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                        <span className="text-xs font-medium text-gray-500">{label}</span>
                        <span className={`text-right text-sm font-medium text-gray-800 break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">

                  <button
                    onClick={() => onViewFullProfile(user.id)}           // ← Updated
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition hover:scale-105"
                    style={{ borderColor: C.infoBorder, color: C.info, background: C.infoBg }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5 16.477 5 20.268 7.943 21.542 12 20.268 16.057 16.477 19 12 19 7.523 19 3.732 16.057 2.458 12z" />
                    </svg>
                    View Full Profile
                  </button>

                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition hover:scale-105"
                    style={{ borderColor: C.primaryBorder, color: C.primary, background: C.primaryLight }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {profileImg ? "Change Photo" : "Upload Photo"}
                  </button>

                  <button onClick={handleResetPasswordClick}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition hover:scale-105"
                    style={{ borderColor: C.infoBorder, color: C.info, background: C.infoBg }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="11" width="14" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Reset Password
                  </button>
                </div>
              </>
            )}

            {/* SENT REQUESTS TAB */}
            {activeTab === "sent" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Match Requests Sent</h4>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: C.primaryLight, color: C.primary }}>
                    {sentCount} Total
                  </span>
                </div>
                <div className="space-y-2">
                  {sentRequests.map((req) => {
                    const cfg = REQ_STATUS_CFG[req.status];
                    return (
                      <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-fuchsia-200 hover:bg-fuchsia-50/30 transition-all group">
                        <span className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                          style={{ background: `linear-gradient(135deg, ${req.color}, ${req.color}cc)` }}>
                          {req.avatar}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{req.to}</p>
                          <p className="text-xs text-gray-400">{req.date}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                  {sentRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">No requests sent yet</div>
                  )}
                </div>
              </>
            )}

            {/* RECEIVED REQUESTS TAB */}
            {activeTab === "received" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Requests Received</h4>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: C.primaryLight, color: C.primary }}>
                    {receivedCount} Total
                  </span>
                </div>

                {/* Summary chips */}
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">✓ {acceptedReceived} Accepted</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">⏳ {pendingReceived} Pending</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">✕ {rejectedReceived} Rejected</span>
                </div>

                <div className="space-y-2 mt-2">
                  {receivedRequests.map((req) => {
                    const cfg = REQ_STATUS_CFG[req.status];
                    return (
                      <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-fuchsia-200 hover:bg-fuchsia-50/30 transition-all group">
                        <span className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                          style={{ background: `linear-gradient(135deg, ${req.color}, ${req.color}cc)` }}>
                          {req.avatar}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{req.from}</p>
                          <p className="text-xs text-gray-400">{req.date}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                  {receivedRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">No requests received yet</div>
                  )}
                </div>
              </>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === "docs" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Submitted Documents</h4>
                  <div className="flex gap-1">
                    {Object.entries(DOC_STATUS_CFG).map(([status, cfg]) => {
                      const count = documents.filter(d => d.status === status).length;
                      return count > 0 && (
                        <span key={status} className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}: {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const cfg = DOC_STATUS_CFG[doc.status];
                    return (
                      <div key={doc.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-fuchsia-200 hover:bg-fuchsia-50/30 transition-all group">
                        <span className="text-2xl shrink-0">{doc.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{doc.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{doc.type}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-fuchsia-600 hover:bg-fuchsia-100 transition opacity-0 group-hover:opacity-100"
                          title="View document">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-white">
            {isDeletedView ? (
              <button onClick={onRestore} disabled={restorePending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition hover:scale-105 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${C.active}, ${C.active}cc)` }}>
                {restorePending ? <><Spinner size={14} color="#fff" /> Restoring…</> : "Restore Account"}
              </button>
            ) : (
              <>
                <button onClick={onToggle} disabled={togglePending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition hover:scale-105 disabled:opacity-50"
                  style={user.rawStatus === 1
                    ? { borderColor: "#fcd34d", color: C.warn, background: C.warnBg }
                    : { borderColor: C.activeBorder, color: C.active, background: C.activeBg }}>
                  {togglePending
                    ? <><Spinner size={14} color={user.rawStatus === 1 ? C.warn : C.active} /> Processing…</>
                    : user.rawStatus === 1 ? "Deactivate" : "Activate"}
                </button>
                <button onClick={onDelete} disabled={deletePending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition hover:scale-105 disabled:opacity-50"
                  style={{ borderColor: C.dangerBorder, color: C.danger, background: C.dangerBg }}>
                  {deletePending ? <><Spinner size={14} color={C.danger} /> Deleting…</> : "Delete User"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={onResetPassword}
        isPending={resetPending}
        userName={user.name}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ApproveReject() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "", status: undefined, deleted: undefined, gender: undefined });
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput.trim(), page: 1 })), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, error, refetch } = useAllUsers(filters);
  // Handle both possible response structures
  const users = data?.users || data?.data?.users || [];
  const pagination = data?.pagination || data?.data?.pagination || null;

  const toggleMutation = useToggleUserStatus();
  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();
  const [resetPending, setResetPending] = useState(false);
  const isDeletedView = filters.deleted === true;

  const notify = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };
  const updateFilter = useCallback((partial) => {
    setFilters((f) => ({ ...f, ...partial, page: 1 }));
    setSelected(null);
  }, []);

  const handleViewFullProfile = (userId) => {
    console.log("Navigating with userId:", userId);  // add this
    navigate(`/admin/profile/${userId}`);
  };

  // ─── Filter Panel ─────────────────────────────────────────────────────────────
  function FilterPanel({ filters, onChange, onClear, isOpen }) {
    if (!isOpen) return null;

    const hasActive = filters.status !== undefined ||
      filters.deleted !== undefined ||
      filters.gender !== undefined;

    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: C.primaryBorder, animation: "slideDown 0.25s ease both" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-700">Advanced Filters</p>
          {hasActive && <button onClick={onClear} className="text-xs font-semibold hover:underline" style={{ color: C.danger }}>Clear all</button>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Account Status */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Account Status</p>
            <div className="flex gap-2">
              {[{ label: "All", value: undefined }, { label: "Active", value: 1 }, { label: "Inactive", value: 0 }].map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => onChange({ status: value })}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border transition"
                  style={filters.status === value
                    ? { background: C.primary, color: "#fff", borderColor: C.primary }
                    : { background: "#f8fafc", color: "#475569", borderColor: "#e2e8f0" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Deleted Users */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Deleted Users</p>
            <button
              onClick={() => onChange({ deleted: filters.deleted === true ? undefined : true })}
              className="w-full py-2 rounded-xl text-xs font-semibold border transition"
              style={filters.deleted === true
                ? { background: C.primary, color: "#fff", borderColor: C.primary }
                : { background: "#f8fafc", color: "#475569", borderColor: "#e2e8f0" }}
            >
              Show Deleted
            </button>
            {filters.deleted === true && <p className="text-[11px] text-amber-600 mt-1.5">⚠️ Showing soft-deleted accounts</p>}
          </div>

          {/* Gender Filter - FIXED */}
          {/* <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Gender</p>
            <div className="flex gap-2">
              {[
                { label: "All", value: undefined },
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" }
              ].map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => onChange({ gender: value })}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border transition"
                  style={filters.gender === value
                    ? { background: C.primary, color: "#fff", borderColor: C.primary }
                    : { background: "#f8fafc", color: "#475569", borderColor: "#e2e8f0" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    );
  }

  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 10, search: "", status: undefined, deleted: undefined, gender: undefined }); setSearchInput("");
    setSelected(null);
    notify("Filters cleared", "info");
  }, []);

  const handleToggle = useCallback((user) => {
    const next = user.rawStatus === 1 ? 0 : 1;
    toggleMutation.mutate({ userId: user.id, status: next }, {
      onSuccess: () => {
        if (selected?.id === user.id) setSelected({ ...selected, rawStatus: next });
        notify(`${user.name} ${next === 1 ? "activated" : "deactivated"}`, "success");
        refetch();
      },
      onError: () => notify("Failed to update status", "error"),
    });
  }, [toggleMutation, refetch, selected]);

  const handleResetPassword = useCallback(async (userId, newPassword) => {
    setResetPending(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Password reset for user ${userId}: ${newPassword}`);
      notify(`Password reset successfully for ${selected?.name}`, "success");
    } catch (error) {
      notify("Failed to reset password", "error");
    } finally {
      setResetPending(false);
    }
  }, [selected]);

  const confirmDelete = useCallback(() => {
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        if (selected?.id === deleteTarget.id) setSelected(null);
        notify(`${deleteTarget.name} deleted`, "success");
        refetch();
      },
      onError: () => notify("Failed to delete user", "error"),
    });
  }, [deleteMutation, deleteTarget, selected, refetch]);

  const confirmRestore = useCallback(() => {
    restoreMutation.mutate(restoreTarget.id, {
      onSuccess: () => {
        setRestoreTarget(null);
        if (selected?.id === restoreTarget.id) setSelected(null);
        notify(`${restoreTarget.name} restored`, "success");
        refetch();
      },
      onError: () => notify("Failed to restore user", "error"),
    });
  }, [restoreMutation, restoreTarget, selected, refetch]);

  const activeFilterCount = [filters.status !== undefined, filters.deleted !== undefined, filters.gender !== undefined].filter(Boolean).length;
  const total = pagination?.total ?? users.length;
  const deletedCount = users.filter((u) => u.isDeleted).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/60 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-5 w-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-3 w-64 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-20 animate-pulse" />)}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-3xl">⚠️</div>
        <p className="font-semibold text-gray-700">Failed to load users</p>
        <p className="text-sm text-gray-400">{error?.message}</p>
        <button onClick={() => refetch()} className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition"
          style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6">
      <Toast {...toast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0 text-lg"
            style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` }}>
            UM
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
            <p className="text-sm text-gray-500">
              {isDeletedView ? "Viewing soft-deleted accounts" : "Manage accounts, access & deletions"}
            </p>
          </div>
        </div>
        {isDeletedView && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border"
            style={{ background: C.warnBg, color: C.warn, borderColor: "#fcd34d" }}>
            ⚠️ Deleted View
            <button onClick={() => updateFilter({ deleted: undefined })} className="underline hover:opacity-70 ml-1">Exit</button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={total} initText="👥" color={C.primary} icon="👥" />
        <StatCard label="Active" value={users.filter(u => u.rawStatus === 1 && !u.isDeleted).length} initText="✅" color={C.active} icon="✅" />
        <StatCard label="Inactive" value={users.filter(u => u.rawStatus === 0 && !u.isDeleted).length} initText="⭕" color={C.warn} icon="⭕" />
        <StatCard label="Deleted" value={deletedCount} initText="🗑️" color={C.danger} icon="🗑️" />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
            {isFetching
              ? <Spinner size={15} color={C.primary} />
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
            }
          </span>
          <input type="text" placeholder="Search by name, email or mobile…" value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-gray-200 rounded-xl outline-none shadow-sm transition-all focus:shadow-md"
            onFocus={(e) => { e.target.style.borderColor = C.primaryBorder; e.target.style.boxShadow = `0 0 0 3px ${C.primary}18`; }}
            onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }} />
          {searchInput && (
            <button onClick={() => { setSearchInput(""); setFilters((f) => ({ ...f, search: "", page: 1 })); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl border transition hover:scale-105"
            style={filterOpen || activeFilterCount > 0
              ? { background: C.primary, color: "#fff", borderColor: C.primary }
              : { background: "#fff", color: "#475569", borderColor: "#e2e8f0" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold" style={{ color: C.primary }}>
                {activeFilterCount}
              </span>
            )}
          </button>
          <select value={filters.limit}
            onChange={(e) => setFilters((f) => ({ ...f, limit: Number(e.target.value), page: 1 }))}
            className="px-3 py-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl outline-none shadow-sm cursor-pointer">
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onChange={updateFilter}
        onClear={clearFilters}
        isOpen={filterOpen}
      />
      {/* User List */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#F1F5F9" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "#F1F5F9", background: "linear-gradient(135deg, #fdf4ff 0%, #f8fafc 100%)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-6 rounded-full" style={{ background: C.primary }} />
            <div>
              <p className="text-sm font-semibold text-gray-800">{isDeletedView ? "Deleted Users" : "All Users"}</p>
              <p className="text-[11px] text-gray-400">
                {pagination ? `${pagination.total} total` : `${users.length} results`}
                {isFetching && <span className="ml-1" style={{ color: C.primary }}>· refreshing…</span>}
              </p>
            </div>
          </div>
          <button onClick={() => refetch()} disabled={isFetching}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-fuchsia-50 hover:text-fuchsia-700 transition disabled:opacity-40">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isFetching ? "animate-spin" : ""}>
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {users.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
              style={{ background: "linear-gradient(135deg, #fae8ff, #e9d5ff)" }}>
              {isDeletedView ? "🗑️" : "📭"}
            </div>
            <p className="font-semibold text-gray-600">{isDeletedView ? "No deleted users" : "No users found"}</p>
            <p className="text-sm text-gray-400 mt-1">{isDeletedView ? "No accounts have been soft-deleted" : "Try adjusting search or filters"}</p>
            {(filters.search || activeFilterCount > 0) && (
              <button onClick={clearFilters} className="mt-3 text-sm font-semibold hover:underline" style={{ color: C.primary }}>Clear filters</button>
            )}
          </div>
        ) : (
          users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isSelected={selected?.id === user.id}
              isDeletedView={isDeletedView}
              onSelect={() => setSelected(selected?.id === user.id ? null : user)}
              onToggle={() => handleToggle(user)}
              onDelete={() => setDeleteTarget(user)}
              onRestore={() => setRestoreTarget(user)}
              isToggling={toggleMutation.isPending && toggleMutation.variables?.userId === user.id}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === user.id}
              isRestoring={restoreMutation.isPending && restoreMutation.variables === user.id}
            />
          ))
        )}

        {pagination && (
          <div className="px-5 py-4 border-t border-gray-100">
            <Pagination pagination={pagination} page={filters.page} onPage={(p) => setFilters((f) => ({ ...f, page: p }))} />
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selected && (
        <UserDetailModal
          user={selected}
          isDeletedView={isDeletedView}
          onClose={() => setSelected(null)}
          onToggle={() => handleToggle(selected)}
          onDelete={() => { setSelected(null); setDeleteTarget(selected); }}
          onRestore={() => { setSelected(null); setRestoreTarget(selected); }}
          onResetPassword={handleResetPassword}
          onViewFullProfile={handleViewFullProfile}     // ← THIS WAS MISSING
          togglePending={toggleMutation.isPending && toggleMutation.variables?.userId === selected.id}
          deletePending={deleteMutation.isPending && deleteMutation.variables === selected.id}
          restorePending={restoreMutation.isPending && restoreMutation.variables === selected.id}
          resetPending={resetPending}
        />
      )}

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete} isPending={deleteMutation.isPending}
        title="Delete User?"
        message={`"${deleteTarget?.name}" will be soft-deleted. Data is preserved and can be restored later.`}
        confirmLabel="Yes, Delete" accentColor={C.danger}
      />
      <ConfirmModal
        isOpen={!!restoreTarget} onClose={() => setRestoreTarget(null)}
        onConfirm={confirmRestore} isPending={restoreMutation.isPending}
        title="Restore Account?"
        message={`"${restoreTarget?.name}" will be restored and regain access to their account.`}
        confirmLabel="Yes, Restore" accentColor={C.active}
      />

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}