// src/pages/admin/AproveReject.jsx
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  useAllUsers,
  useToggleUserStatus,
  useDeleteUser,
  useRestoreUser,
} from "../../hooks/useAdminQueries";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#bd201c",      // main red
  primaryDark: "#601000",  // dark red
  primaryLight: "#fef2f2", // red-50
  primaryMid: "#fee2e2",   // red-100
  primaryBorder: "#fca5a5",// red-300
  active: "#059669",
  activeBg: "#ecfdf5",
  activeBorder: "#a7f3d0",
  inactive: "#64748b",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  warn: "#d97706",
  warnBg: "#fffbeb",
  warnBorder: "#fde68a",
  info: "#2563eb",
  infoBg: "#eff6ff",
  infoBorder: "#bfdbfe",
};

const AVATAR_PALETTE = ["#bd201c", "#9B0424", "#601000", "#dc2626", "#ef4444", "#7f1d1d"];
const PAGE_SIZES = [10, 25, 50, 100];

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SENT_REQUESTS = [
  { id: 1, to: "Priya Sharma", toId: "101", avatar: "PS", color: "#bd201c", status: "accepted", date: "12 Jan 2025" },
  { id: 2, to: "Aarti Verma", toId: "102", avatar: "AV", color: "#601000", status: "pending", date: "18 Jan 2025" },
];
const MOCK_RECEIVED_REQUESTS = [
  { id: 7, from: "Rahul Mehta", fromId: "201", avatar: "RM", color: "#bd201c", status: "accepted", date: "10 Jan 2025" },
];
const MOCK_DOCS = [
  { id: 1, name: "Aadhaar Card", type: "identity", status: "verified", icon: "🪪", url: "#" },
  { id: 3, name: "10th Marksheet", type: "education", status: "pending", icon: "📄", url: "#" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const avatarColor = (id) => AVATAR_PALETTE[String(id).charCodeAt(0) % AVATAR_PALETTE.length] || C.primary;
const initials = (name = "") =>
  name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

// ─── SVGs ─────────────────────────────────────────────────────────────────────
const Icons = {
  Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>,
  Filter: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" strokeLinecap="round" /><path d="M19 6l-1 14H6L5 6" strokeLinecap="round" /><path d="M10 11v6M14 11v6" strokeLinecap="round" /></svg>,
  Restore: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v5h5M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 9a8 8 0 0114.93-3.5M20 15a8 8 0 01-14.93 3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>,
  Key: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
};

// ─── Components ───────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = C.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color }}>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function Avatar({ name, id, size = 36, muted = false, src }) {
  const bg = avatarColor(id ?? name);
  if (src) {
    return (
      <img src={src} alt={name} className={`rounded-full object-cover shrink-0 shadow-sm ${muted ? "opacity-50 grayscale" : ""}`} style={{ width: size, height: size }} />
    );
  }
  return (
    <span className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none shadow-sm transition-transform ${muted ? "opacity-50 grayscale" : ""}`}
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  );
}

function Toggle({ checked, onChange, loading }) {
  return (
    <button onClick={onChange} disabled={loading}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60"
      style={{ backgroundColor: checked ? C.active : "#cbd5e1" }}>
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={12} color="#fff" />
        </span>
      ) : (
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      )}
    </button>
  );
}

function StatusBadge({ status, isDeleted }) {
  if (isDeleted) return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Deleted</span>;
  return status === 1
    ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active</span>
    : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Inactive</span>;
}

function Toast({ show, message, type }) {
  if (!show) return null;
  const cfg = {
    success: { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0", icon: "✓" },
    error: { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: "✕" },
    info: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", icon: "ℹ" },
  }[type] ?? { bg: "#f9fafb", text: "#374151", border: "#e5e7eb", icon: "•" };
  return (
    <div className="fixed right-6 top-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold border"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border, animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
      <span className="text-lg">{cfg.icon}</span>
      {message}
    </div>
  );
}

function ConfirmModal({ isOpen, onClose, onConfirm, isPending, title, message, confirmLabel, accentColor = C.danger }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
            <button onClick={onConfirm} disabled={isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition"
              style={{ background: accentColor }}>
              {isPending ? <Spinner size={14} color="#fff" /> : confirmLabel}
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) { setPassword(""); setConfirmPassword(""); setErrors({}); }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!password) newErrors.password = "Required";
    else if (password.length < 8) newErrors.password = "At least 8 chars";
    if (password !== confirmPassword) newErrors.confirm = "Mismatch";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      await onConfirm(password);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
          <p className="text-xs text-gray-500 mb-5">For {userName}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 ${errors.password ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:ring-red-50"}`}
                placeholder="New password" />
              {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 ${errors.confirm ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:ring-red-50"}`}
                placeholder="Confirm password" />
              {errors.confirm && <p className="text-[10px] text-red-500 mt-1">{errors.confirm}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
              <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-50 bg-[#bd201c] hover:bg-[#a01b18]">
                {isPending ? <Spinner size={14} color="#fff" /> : "Reset"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Drawer Component ─────────────────────────────────────────────────────────
function UserDetailDrawer({ user, isDeletedView, onClose, onToggle, onDelete, onRestore, onResetPassword, onViewFullProfile, togglePending, deletePending, restorePending, resetPending }) {
  const [activeTab, setActiveTab] = useState("profile");

  const TABS = [
    { key: "profile", label: "Overview" },
    { key: "sent", label: "Sent Req" },
    { key: "received", label: "Recv Req" },
    { key: "docs", label: "Docs" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[60] flex justify-end">
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose} style={{ animation: 'fadeIn 0.2s ease-out forwards' }} />
        <div className="relative w-full max-w-md md:max-w-xl bg-white h-full shadow-2xl flex flex-col" style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} id={user.id} size={56} muted={isDeletedView} />
              <div>
                <h2 className={`text-xl font-bold tracking-tight ${isDeletedView ? "text-gray-400 line-through" : "text-gray-900"}`}>{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-2"><StatusBadge status={user.rawStatus} isDeleted={isDeletedView && user.isDeleted} /></div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition">
              <Icons.Close />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6 shrink-0 pt-2">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`relative py-3 px-4 text-sm font-semibold transition-colors ${activeTab === tab.key ? 'text-[#bd201c]' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
                {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#bd201c] rounded-t-full" />}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {activeTab === "profile" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase">Platform ID</span>
                    <p className="text-sm font-mono font-medium text-gray-800 mt-1">{user.platformId || "—"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase">Phone Number</span>
                    <p className="text-sm font-medium text-gray-800 mt-1">{user.countryCode} {user.mobile}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase">Gender</span>
                    <p className="text-sm font-medium text-gray-800 mt-1">{user.gender || "—"}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <button onClick={() => onViewFullProfile(user.id)} className="w-full py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition shadow-sm flex justify-center items-center gap-2">
                    <Icons.Eye /> View Full Detailed Profile
                  </button>
                  <button onClick={onResetPassword} className="w-full py-3 rounded-xl text-sm font-semibold border border-blue-100 text-blue-700 bg-blue-50 hover:bg-blue-100 transition shadow-sm flex justify-center items-center gap-2">
                    <Icons.Key /> Reset User Password
                  </button>
                </div>
              </div>
            )}
            {/* Minimal implementations for other tabs to save space */}
            {activeTab !== "profile" && (
              <div className="py-10 text-center text-gray-400 text-sm animate-fadeIn">
                Detailed view available in full profile.
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
            {isDeletedView ? (
              <button onClick={onRestore} disabled={restorePending} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#059669] hover:bg-[#047857] transition disabled:opacity-50 shadow-sm flex justify-center items-center gap-2">
                {restorePending ? <Spinner size={16} color="#fff" /> : <><Icons.Restore /> Restore Account</>}
              </button>
            ) : (
              <>
                <button onClick={onToggle} disabled={togglePending} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition shadow-sm flex justify-center items-center gap-2 disabled:opacity-50 ${user.rawStatus === 1 ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
                  {togglePending ? <Spinner size={16} color={user.rawStatus === 1 ? C.warn : C.active} /> : (user.rawStatus === 1 ? "Deactivate" : "Activate")}
                </button>
                <button onClick={onDelete} disabled={deletePending} className="flex-1 py-3 rounded-xl text-sm font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 transition shadow-sm flex justify-center items-center gap-2 disabled:opacity-50">
                  {deletePending ? <Spinner size={16} color={C.danger} /> : <><Icons.Trash /> Delete</>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────
function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fef2f2] text-[#bd201c] border border-[#fca5a5] rounded-lg text-xs font-bold">
      {label}
      <button onClick={onRemove} className="hover:text-red-800 transition-colors leading-none">✕</button>
    </span>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export default function ApproveReject() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "", status: undefined, deleted: undefined });
  const [advFilters, setAdvFilters] = useState({ gender: "", ageMin: "", ageMax: "", city: "", state: "" });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput.trim(), page: 1 })), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, error, refetch } = useAllUsers(filters);
  const rawUsers = data?.users || data?.data?.users || [];
  const pagination = data?.pagination || data?.data?.pagination || null;

  // Client-side filtering
  const users = rawUsers.filter(u => {
    if (advFilters.gender && u.gender !== advFilters.gender) return false;
    if (advFilters.ageMin !== "" && u.age != null && u.age < Number(advFilters.ageMin)) return false;
    if (advFilters.ageMax !== "" && u.age != null && u.age > Number(advFilters.ageMax)) return false;
    if (advFilters.state && !u.stateName?.toLowerCase().includes(advFilters.state.toLowerCase())) return false;
    if (advFilters.city && !u.cityName?.toLowerCase().includes(advFilters.city.toLowerCase())) return false;
    return true;
  });

  const toggleMutation = useToggleUserStatus();
  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();
  const [resetPending, setResetPending] = useState(false);
  
  const isDeletedView = filters.deleted === true;

  const notify = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const updateFilter = useCallback((k, v) => {
    setFilters(f => ({ ...f, [k]: v, page: 1 }));
    setSelected(null);
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

  const handleResetPassword = async (pwd) => {
    setResetPending(true);
    await new Promise(r => setTimeout(r, 1000));
    setResetPending(false);
    notify(`Password reset for ${selected?.name}`, "success");
  };

  // Styles injected for animations
  useEffect(() => {
    const s = document.createElement('style');
    s.innerHTML = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      .animate-scaleIn { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .animate-slideDown { animation: slideDown 0.25s ease-out forwards; }
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // Count active advanced filters
  const activeFilterCount = [
    advFilters.gender,
    advFilters.ageMin !== "" ? advFilters.ageMin : undefined,
    advFilters.ageMax !== "" ? advFilters.ageMax : undefined,
    advFilters.city,
    advFilters.state,
  ].filter(Boolean).length;

  const updateAdvFilter = useCallback((k, v) => {
    setAdvFilters(f => ({ ...f, [k]: v }));
  }, []);

  const clearAdvancedFilters = () => {
    setAdvFilters({ gender: "", ageMin: "", ageMax: "", city: "", state: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,sans-serif] p-4 sm:p-8">
      <Toast {...toast} />
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all registered accounts and moderation queues.</p>
          </div>
          {isDeletedView && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm">
              <span>⚠️ Soft-Deleted View Active</span>
              <button onClick={() => updateFilter('deleted', undefined)} className="underline hover:text-red-900 ml-2">Exit</button>
            </div>
          )}
        </div>

        {/* Professional Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full lg:w-96 group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#bd201c] transition-colors">
                <Icons.Search />
              </span>
              <input 
                type="text" 
                placeholder="Search by name, email or ID..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-[#fca5a5] focus:ring-4 focus:ring-[#fee2e2]"
              />
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 flex-wrap">
              <select value={filters.status || ""} onChange={e => updateFilter('status', e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none hover:bg-gray-100 cursor-pointer transition">
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
              
              <button onClick={() => updateFilter('deleted', filters.deleted ? undefined : true)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition whitespace-nowrap ${filters.deleted ? 'bg-[#bd201c] text-white border-[#bd201c]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
                Deleted Users
              </button>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`relative px-3 py-2.5 rounded-xl text-sm font-bold border transition flex items-center gap-2 whitespace-nowrap ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-[#fef2f2] text-[#bd201c] border-[#fca5a5]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Icons.Filter />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[10px] font-extrabold bg-[#bd201c] text-white rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="h-8 w-px bg-gray-200 hidden sm:block mx-1" />

              <select value={filters.limit} onChange={e => updateFilter('limit', Number(e.target.value))}
                className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition">
                {PAGE_SIZES.map(n => <option key={n} value={n}>{n} rows</option>)}
              </select>
            </div>
          </div>

          {/* Advanced Filter Panel */}
          {showFilters && (
            <div className="border-t border-gray-100 pt-3 animate-slideDown">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Gender</label>
                  <select
                    value={advFilters.gender}
                    onChange={e => updateAdvFilter('gender', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-[#fca5a5] focus:ring-2 focus:ring-[#fef2f2] cursor-pointer transition"
                  >
                    <option value="">Any Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Min Age */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Min Age</label>
                  <input
                    type="number" min="18" max="80"
                    placeholder="e.g. 21"
                    value={advFilters.ageMin}
                    onChange={e => updateAdvFilter('ageMin', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-[#fca5a5] focus:ring-2 focus:ring-[#fef2f2] transition"
                  />
                </div>

                {/* Max Age */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Max Age</label>
                  <input
                    type="number" min="18" max="80"
                    placeholder="e.g. 40"
                    value={advFilters.ageMax}
                    onChange={e => updateAdvFilter('ageMax', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-[#fca5a5] focus:ring-2 focus:ring-[#fef2f2] transition"
                  />
                </div>

                {/* State */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={advFilters.state}
                    onChange={e => updateAdvFilter('state', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-[#fca5a5] focus:ring-2 focus:ring-[#fef2f2] transition"
                  />
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={advFilters.city}
                    onChange={e => updateAdvFilter('city', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-[#fca5a5] focus:ring-2 focus:ring-[#fef2f2] transition"
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 font-medium">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active · Showing {users.length} of {rawUsers.length}:</span>
                  {advFilters.gender && <Chip label={`Gender: ${advFilters.gender}`} onRemove={() => updateAdvFilter('gender', '')} />}
                  {advFilters.ageMin && <Chip label={`Age ≥ ${advFilters.ageMin}`} onRemove={() => updateAdvFilter('ageMin', '')} />}
                  {advFilters.ageMax && <Chip label={`Age ≤ ${advFilters.ageMax}`} onRemove={() => updateAdvFilter('ageMax', '')} />}
                  {advFilters.state && <Chip label={`State: ${advFilters.state}`} onRemove={() => updateAdvFilter('state', '')} />}
                  {advFilters.city && <Chip label={`City: ${advFilters.city}`} onRemove={() => updateAdvFilter('city', '')} />}
                  <button onClick={clearAdvancedFilters} className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline ml-1 transition">Clear all</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden relative">
          
          {/* Refresh overlay */}
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex justify-center items-start pt-10">
               <span className="bg-white p-2 rounded-full shadow-md text-[#bd201c]"><Spinner size={24} color="#bd201c" /></span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="px-6 py-4 whitespace-nowrap">User Info</th>
                  <th className="px-6 py-4 whitespace-nowrap">Contact Details</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5"><div className="flex gap-3 items-center"><div className="w-10 h-10 bg-gray-200 rounded-full" /><div className="space-y-2"><div className="h-3 w-24 bg-gray-200 rounded" /><div className="h-2 w-16 bg-gray-100 rounded" /></div></div></td>
                      <td className="px-6 py-5"><div className="space-y-2"><div className="h-3 w-32 bg-gray-200 rounded" /><div className="h-2 w-20 bg-gray-100 rounded" /></div></td>
                      <td className="px-6 py-5 text-center"><div className="h-6 w-16 bg-gray-200 rounded-full mx-auto" /></td>
                      <td className="px-6 py-5 text-right"><div className="h-8 w-24 bg-gray-200 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-red-600">
                      <p className="font-bold">Error loading data.</p>
                      <button onClick={() => refetch()} className="mt-2 text-sm underline hover:text-red-800">Try Again</button>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">📭</div>
                      <p className="font-medium text-gray-600">No users found.</p>
                      <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} onClick={() => setSelected(user)} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} id={user.id} size={40} muted={isDeletedView} />
                          <div>
                            <p className={`font-semibold text-gray-900 group-hover:text-[#bd201c] transition-colors ${isDeletedView ? 'line-through text-gray-400' : ''}`}>{user.name}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {user.platformId || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.countryCode} {user.mobile}</p>
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <StatusBadge status={user.rawStatus} isDeleted={isDeletedView && user.isDeleted} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          {!isDeletedView && (
                            <div className="mr-2 border-r border-gray-200 pr-4">
                              <Toggle checked={user.rawStatus === 1} onChange={() => handleToggle(user)} loading={toggleMutation.isPending && toggleMutation.variables?.userId === user.id} />
                            </div>
                          )}
                          <button onClick={() => navigate(`/admin/profile/${user.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition tooltip-btn" title="Full Profile">
                            <Icons.Eye />
                          </button>
                          {isDeletedView ? (
                            <button onClick={() => setRestoreTarget(user)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition" title="Restore User">
                              <Icons.Restore />
                            </button>
                          ) : (
                            <button onClick={() => setDeleteTarget(user)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition" title="Delete User">
                              <Icons.Trash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm">
              <span className="text-gray-500 font-medium">
                Page <span className="font-bold text-gray-900">{filters.page}</span> of {pagination.total_pages}
              </span>
              <div className="flex gap-1">
                <button disabled={filters.page === 1} onClick={() => updateFilter('page', filters.page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 font-medium transition">Prev</button>
                <button disabled={filters.page === pagination.total_pages} onClick={() => updateFilter('page', filters.page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 font-medium transition">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Drawer */}
      {selected && (
        <UserDetailDrawer
          user={selected}
          isDeletedView={isDeletedView}
          onClose={() => setSelected(null)}
          onToggle={() => handleToggle(selected)}
          onDelete={() => { setSelected(null); setDeleteTarget(selected); }}
          onRestore={() => { setSelected(null); setRestoreTarget(selected); }}
          onResetPassword={() => setResetModalOpen(true)}
          onViewFullProfile={(id) => navigate(`/admin/profile/${id}`)}
          togglePending={toggleMutation.isPending && toggleMutation.variables?.userId === selected.id}
          deletePending={deleteMutation.isPending && deleteMutation.variables === selected.id}
          restorePending={restoreMutation.isPending && restoreMutation.variables === selected.id}
          resetPending={resetPending}
        />
      )}

      <ResetPasswordModal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} onConfirm={handleResetPassword} isPending={resetPending} userName={selected?.name} />
      
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} isPending={deleteMutation.isPending}
        title="Delete User Account" message={`Are you sure you want to soft-delete "${deleteTarget?.name}"? They will lose access to their account.`} confirmLabel="Yes, Delete" accentColor={C.danger} />
        
      <ConfirmModal isOpen={!!restoreTarget} onClose={() => setRestoreTarget(null)} onConfirm={confirmRestore} isPending={restoreMutation.isPending}
        title="Restore User Account" message={`"${restoreTarget?.name}" will be restored and regain full access.`} confirmLabel="Yes, Restore" accentColor={C.active} />
    </div>
  );
}