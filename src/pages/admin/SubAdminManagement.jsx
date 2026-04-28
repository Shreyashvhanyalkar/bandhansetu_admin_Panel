// pages/admin/SubAdminManagement.jsx
import { useState, useRef, useEffect } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary:       "#e990e8",
  primaryDark:   "#da0eed",
  primaryLight:  "#fdf4ff",
  primaryMid:    "#fae8ff",
  primaryBorder: "#f0abfc",
  active:        "#44e0ae",
  activeBg:      "#ecfdf5",
  activeBorder:  "#a7f3d0",
  danger:        "#ee5757",
  dangerBg:      "#fef2f2",
  dangerBorder:  "#fecaca",
  warn:          "#d97706",
  warnBg:        "#fffbeb",
  warnBorder:    "#fcd34d",
  info:          "#8b5cf6",
  infoBg:        "#f5f3ff",
  infoBorder:    "#c4b5fd",
  surface:       "#ffffff",
  surfaceMuted:  "#faf9fb",
  border:        "#f1eef2",
  textPrimary:   "#1e1b2e",
  textSecondary: "#5b5266",
  textMuted:     "#a19aa6",
};

const AVATAR_PALETTE = ["#dd6aec","#8c55eb","#0369A1","#0F766E","#B45309","#d22752","#0891B2","#4F46E5"];

const INITIAL_SUB_ADMINS = [
  {
    id: 1, name: "Rahul Sharma", email: "rahul.sharma@bandhan.com", phone: "+91 98765 43210",
    address: "123 Main Street, Mumbai, Maharashtra 400001",
    status: "active", joinedDate: "01 Jan 2025",
    permissions: ["dashboard", "users", "reports"],
    docs: [],
    lastActive: "2 hours ago", avatar: null,
  },
  {
    id: 2, name: "Priya Verma", email: "priya.verma@bandhan.com", phone: "+91 87654 32109",
    address: "456 Oak Avenue, Delhi, Delhi 110001",
    status: "active", joinedDate: "15 Jan 2025",
    permissions: ["dashboard", "religion", "notifications"],
    docs: [],
    lastActive: "1 day ago", avatar: null,
  },
  {
    id: 3, name: "Amit Patel", email: "amit.patel@bandhan.com", phone: "+91 76543 21098",
    address: "789 Pine Road, Ahmedabad, Gujarat 380001",
    status: "inactive", joinedDate: "20 Jan 2025",
    permissions: ["dashboard", "users"],
    docs: [],
    lastActive: "5 days ago", avatar: null,
  },
  {
    id: 4, name: "Sunita Rao", email: "sunita.rao@bandhan.com", phone: "+91 65432 10987",
    address: "101 Elm Street, Bangalore, Karnataka 560001",
    status: "active", joinedDate: "05 Feb 2025",
    permissions: ["dashboard", "users", "reports", "religion", "notifications", "settings"],
    docs: [],
    lastActive: "Just now", avatar: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const avatarColor = (id) => AVATAR_PALETTE[(id - 1) % AVATAR_PALETTE.length];
const initials = (name = "") => name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = C.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color }}>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function Avatar({ name, id, size = 36, src, muted = false }) {
  const bg = avatarColor(id);
  if (src) return <img src={src} alt={name} className={`rounded-xl object-cover shrink-0 ${muted ? "opacity-50" : ""}`} style={{ width: size, height: size }} />;
  return (
    <span className={`rounded-xl flex items-center justify-center font-bold text-white shrink-0 select-none ${muted ? "opacity-50" : ""}`}
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  );
}

function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-100 text-gray-600",
    primary: "bg-fuchsia-50 text-fuchsia-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    error: "bg-red-50 text-red-700",
    info: "bg-purple-50 text-purple-700",
  };
  return <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full tracking-wide ${variants[variant]} ${className}`}>{children}</span>;
}

function StatusBadge({ status }) {
  return status === "active"
    ? <Badge variant="success"><span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />Active</Badge>
    : <Badge variant="default"><span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />Inactive</Badge>;
}

function StatCard({ label, value, initText, color }) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200" style={{ borderColor: C.border }}>
      <span className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shrink-0 text-base"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>{initText}</span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</p>
        <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, isPending, title, message, confirmLabel, accentColor = C.danger }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(30,20,35,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden" style={{ animation: "modalIn .2s cubic-bezier(.34,1.56,.64,1) both" }}>
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${accentColor},${accentColor}88)` }} />
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accentColor + "12" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.8">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: C.textPrimary }}>{title}</p>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: C.textSecondary }}>{message}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={onConfirm} disabled={isPending}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:shadow-md"
              style={{ background: `linear-gradient(135deg,${accentColor},${accentColor}cc)` }}>
              {isPending ? <><Spinner size={14} color="#fff" /> Processing…</> : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ show, message, type, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  
  if (!show) return null;
  
  const config = {
    success: { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0", icon: "✓" },
    error: { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: "✕" },
    info: { bg: "#fefce8", text: "#854d0e", border: "#fde047", icon: "ℹ" },
  };
  const cfg = config[type] || config.success;
  
  return (
    <div className="fixed right-6 top-6 z-[70] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border backdrop-blur-sm"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border, animation: "slideIn .3s ease both" }}>
      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: cfg.text + "20", color: cfg.text }}>{cfg.icon}</span>
      {message}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ADD / EDIT SUB ADMIN MODAL (WITH ADDRESS, NO ROLE)
// ═══════════════════════════════════════════════════════════════════════════════
function SubAdminFormModal({ isOpen, onClose, existing, onSave }) {
  const isEdit = !!existing;
  const fileRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(existing?.avatar ?? null);
  const [form, setForm] = useState({
    name:        existing?.name        ?? "",
    email:       existing?.email       ?? "",
    phone:       existing?.phone       ?? "",
    address:     existing?.address     ?? "",
    status:      existing?.status      ?? "active",
   
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.address.trim()) e.address = "Address is required";
    return e;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    setTimeout(() => {
      onSave({ ...form, avatar: avatarPreview });
      setSaving(false);
      onClose();
    }, 600);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(30,20,35,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ animation: "modalIn .2s cubic-bezier(.34,1.56,.64,1) both" }}>
        <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg,${C.primary},${C.primary}88)` }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: C.border, background: C.surfaceMuted }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: C.primaryLight }}>
              <span className="text-lg" style={{ color: C.primary }}>{isEdit ? "✎" : "+"}</span>
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: C.textPrimary }}>{isEdit ? "Edit Sub Admin" : "Add New Sub Admin"}</p>
              <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>Fill in the details and set permissions</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Avatar upload */}
          <div className="flex items-center gap-5 pb-4 border-b" style={{ borderColor: C.border }}>
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-20 h-20 rounded-xl object-cover ring-2 ring-offset-2" style={{ ringColor: C.primary }} />
                : <span className="w-20 h-20 rounded-xl flex items-center justify-center font-bold text-white text-2xl"
                    style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDark})` }}>
                    {form.name ? initials(form.name) : "SA"}
                  </span>
              }
              <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                </svg>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>Profile Photo</p>
              <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>Click avatar to upload</p>
              <button onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                style={{ borderColor: C.border, color: C.primary }}>
                Choose File
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} placeholder="Rahul Sharma"
                onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((e2) => ({ ...e2, name: "" })); }}
                className={`w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-lg outline-none transition-all focus:bg-white ${errors.name ? "border-red-400 ring-1 ring-red-400" : "border-gray-200 focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200"}`} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} placeholder="admin@bandhan.com"
                onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((e2) => ({ ...e2, email: "" })); }}
                className={`w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-lg outline-none transition-all focus:bg-white ${errors.email ? "border-red-400 ring-1 ring-red-400" : "border-gray-200 focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200"}`} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>Phone <span className="text-red-500">*</span></label>
              <input type="text" value={form.phone} placeholder="+91 98765 43210"
                onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setErrors((e2) => ({ ...e2, phone: "" })); }}
                className={`w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-lg outline-none transition-all focus:bg-white ${errors.phone ? "border-red-400 ring-1 ring-red-400" : "border-gray-200 focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200"}`} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>Status</label>
              <div className="flex gap-2">
                {["active", "inactive"].map((s) => (
                  <button key={s} onClick={() => setForm((f) => ({ ...f, status: s }))}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                      form.status === s
                        ? "text-white shadow-sm"
                        : "bg-white text-gray-600 border hover:bg-gray-50"
                    }`}
                    style={form.status === s ? { background: C.primary, borderColor: C.primary } : { borderColor: C.border }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Address Field - Full Width */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>Address <span className="text-red-500">*</span></label>
            <textarea
              value={form.address}
              placeholder="Full address with street, city, state, pin code"
              onChange={(e) => { setForm((f) => ({ ...f, address: e.target.value })); setErrors((e2) => ({ ...e2, address: "" })); }}
              rows="3"
              className={`w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-lg outline-none transition-all focus:bg-white resize-none ${errors.address ? "border-red-400 ring-1 ring-red-400" : "border-gray-200 focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200"}`}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          {/* Permissions */}
          
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3 shrink-0" style={{ borderColor: C.border, background: C.surfaceMuted }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all hover:shadow-md disabled:opacity-60"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDark})` }}>
            {saving ? <><Spinner size={14} color="#fff" /> Saving…</> : isEdit ? "Update Sub Admin" : "Add Sub Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DETAIL MODAL (WITH ADDRESS, NO ROLE)
// ═══════════════════════════════════════════════════════════════════════════════
function DetailModal({ admin, onClose, onEdit, onDelete, onToggleStatus }) {
  const [tab, setTab] = useState("details");

  const TABS = [
    { key: "details", label: "Details", icon: "👤" },
  ];

  const PERMISSION_LABELS = {
    dashboard: "Dashboard",
    users: "Users",
    reports: "Reports",
    religion: "Religion",
    notifications: "Notifications",
    settings: "Settings",
  };

  const PERMISSION_ICONS = {
    dashboard: "📊",
    users: "👥",
    reports: "📋",
    religion: "🕉️",
    notifications: "🔔",
    settings: "⚙️",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(30,20,35,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ animation: "modalIn .2s cubic-bezier(.34,1.56,.64,1) both" }}>
        <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg,${C.primary},${C.primary}88)` }} />

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b" style={{ borderColor: C.border, background: C.surfaceMuted }}>
          <Avatar name={admin.name} id={admin.id} size={56} src={admin.avatar} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-lg font-bold" style={{ color: C.textPrimary }}>{admin.name}</p>
              <StatusBadge status={admin.status} />
            </div>
            <p className="text-sm mt-0.5" style={{ color: C.textSecondary }}>{admin.email}</p>
            <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: C.textMuted }}>
              <span>📅 Joined {admin.joinedDate}</span>
              <span>🕐 Last active {admin.lastActive}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b px-6 shrink-0" style={{ borderColor: C.border }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="relative py-3.5 px-4 text-sm font-medium transition-colors flex items-center gap-1.5"
              style={{ color: tab === t.key ? C.primary : C.textMuted }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: C.primary }} />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {/* DETAILS TAB */}
          {tab === "details" && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: C.surfaceMuted }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Full Name</p>
                  <p className="text-sm font-medium mt-1" style={{ color: C.textPrimary }}>{admin.name}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: C.surfaceMuted }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Email</p>
                  <p className="text-sm font-medium mt-1 break-all" style={{ color: C.textPrimary }}>{admin.email}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: C.surfaceMuted }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Phone</p>
                  <p className="text-sm font-medium mt-1" style={{ color: C.textPrimary }}>{admin.phone}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: C.surfaceMuted }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Joined</p>
                  <p className="text-sm font-medium mt-1" style={{ color: C.textPrimary }}>{admin.joinedDate}</p>
                </div>
                <div className="col-span-2 p-3 rounded-lg" style={{ background: C.surfaceMuted }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Address</p>
                  <p className="text-sm font-medium mt-1" style={{ color: C.textPrimary }}>{admin.address || "Not provided"}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: C.surfaceMuted }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Last Active</p>
                  <p className="text-sm font-medium mt-1" style={{ color: C.textPrimary }}>{admin.lastActive}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: C.surfaceMuted }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Status</p>
                  <p className="text-sm font-medium mt-1 capitalize" style={{ color: admin.status === "active" ? C.active : C.textMuted }}>{admin.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* PERMISSIONS TAB */}
          {tab === "permissions" && (
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>Assigned Modules ({admin.permissions.length})</p>
              <div className="flex flex-wrap gap-2">
                {admin.permissions.map((perm) => (
                  <span key={perm} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: C.primaryLight, color: C.primary }}>
                    <span>{PERMISSION_ICONS[perm] || "📦"}</span>
                    <span>{PERMISSION_LABELS[perm] || perm}</span>
                  </span>
                ))}
                {admin.permissions.length === 0 && (
                  <div className="text-center w-full py-8">
                    <p className="text-sm" style={{ color: C.textSecondary }}>No permissions assigned</p>
                    <p className="text-xs mt-1" style={{ color: C.textMuted }}>Edit this admin to grant access</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3 shrink-0" style={{ borderColor: C.border, background: C.surfaceMuted }}>
          <button onClick={onToggleStatus}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border flex items-center justify-center gap-2 transition-all"
            style={admin.status === "active"
              ? { borderColor: C.warnBorder, color: C.warn, background: C.warnBg }
              : { borderColor: C.activeBorder, color: C.active, background: C.activeBg }}>
            {admin.status === "active" ? "🔒 Deactivate" : "🔓 Activate"}
          </button>
          <button onClick={onEdit}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all hover:shadow-md"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDark})` }}>
            ✎ Edit Details
          </button>
          <button onClick={onDelete}
            className="py-2.5 px-5 rounded-lg text-sm font-medium border flex items-center gap-1.5 transition-all"
            style={{ borderColor: C.dangerBorder, color: C.danger, background: C.dangerBg }}>
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub Admin Row (WITHOUT ROLE) ─────────────────────────────────────────────
function SubAdminRow({ admin, onView, onEdit, onDelete, onToggleStatus, index }) {
  return (
    <div
      className="group flex items-center gap-4 px-6 py-4 border-b last:border-0 transition-colors cursor-pointer"
      style={{ borderColor: C.border, animation: "rowIn .2s ease both", animationDelay: `${index * 30}ms` }}
      onClick={onView}
    >
      <div className="w-0.5 h-10 rounded-full bg-transparent group-hover:bg-fuchsia-400 transition-colors" />
      <Avatar name={admin.name} id={admin.id} size={44} src={admin.avatar} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>{admin.name}</span>
          <StatusBadge status={admin.status} />
        </div>
        <p className="text-xs truncate mt-0.5" style={{ color: C.textSecondary }}>{admin.email}</p>
        <div className="flex items-center gap-3 text-xs mt-1" style={{ color: C.textMuted }}>
          <span>{admin.phone}</span>
          <span>•</span>
          <span>{admin.address?.split(",")[0] || "No address"}</span>
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button onClick={onEdit}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: C.textMuted }}
          title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button onClick={onDelete}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: C.textMuted }}
          title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" strokeLinecap="round" />
            <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" />
            <path d="M10 11v6M14 11v6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function SubAdminManagement() {
  const [admins, setAdmins] = useState(INITIAL_SUB_ADMINS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewAdmin, setViewAdmin] = useState(null);
  const [editAdmin, setEditAdmin] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => setToast({ show: false, message: "", type: "" });

  const filtered = admins.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                        a.email.toLowerCase().includes(search.toLowerCase()) ||
                        (a.address && a.address.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (data, id = null) => {
    if (id) {
      setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, ...data } : a));
      showToast(`${data.name} updated successfully`, "success");
    } else {
      const newAdmin = { 
        ...data, 
        id: Date.now(), 
        joinedDate: formatDate(new Date()), 
        lastActive: "Just now", 
        docs: [],
        permissions: data.permissions || ["dashboard"],
      };
      setAdmins((prev) => [...prev, newAdmin]);
      showToast(`${data.name} added as Sub Admin`, "success");
    }
  };

  const handleDelete = () => {
    setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    showToast(`${deleteTarget.name} removed`, "info");
    setDeleteTarget(null);
    setViewAdmin(null);
  };

  const handleToggleStatus = (admin) => {
    const next = admin.status === "active" ? "inactive" : "active";
    setAdmins((prev) => prev.map((a) => a.id === admin.id ? { ...a, status: next } : a));
    if (viewAdmin?.id === admin.id) setViewAdmin((v) => ({ ...v, status: next }));
    showToast(`${admin.name} ${next === "active" ? "activated" : "deactivated"}`, "success");
  };

  const total = admins.length;
  const active = admins.filter((a) => a.status === "active").length;
  const inactive = admins.filter((a) => a.status === "inactive").length;

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: "#faf9fc" }}>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDark})` }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: C.textPrimary }}>Sub Admin Management</h1>
            <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>Manage sub admins, permissions & addresses</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDark})` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
          Add Sub Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Admins" value={total} initText="SA" color={C.primary} />
        <StatCard label="Active" value={active} initText="AC" color={C.active} />
        <StatCard label="Inactive" value={inactive} initText="IN" color={C.textMuted} />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input type="text" placeholder="Search by name, email or address…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-lg outline-none shadow-sm transition-all focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-100"
            style={{ borderColor: C.border }} />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {["all", "active", "inactive"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-5 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                statusFilter === s
                  ? "text-white shadow-sm"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
              style={statusFilter === s ? { background: C.primary } : { borderColor: C.border }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Admin List */}
      <div className="rounded-xl bg-white border shadow-sm overflow-hidden" style={{ borderColor: C.border }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border, background: C.surfaceMuted }}>
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-5 rounded-full" style={{ background: C.primary }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>Sub Admin Directory</p>
              <p className="text-xs" style={{ color: C.textMuted }}>{filtered.length} admin{filtered.length !== 1 ? "s" : ""} found</p>
            </div>
          </div>
          <span className="text-xs" style={{ color: C.textMuted }}>Click a row to view details</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 text-3xl" style={{ background: C.primaryLight, color: C.primary }}>🛡️</div>
            <p className="font-semibold" style={{ color: C.textSecondary }}>No sub admins found</p>
            <p className="text-sm mt-1" style={{ color: C.textMuted }}>Try adjusting search or filters</p>
            {(search || statusFilter !== "all") && (
              <button onClick={() => { setSearch(""); setStatusFilter("all"); }}
                className="mt-4 text-sm font-medium hover:underline" style={{ color: C.primary }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filtered.map((admin, i) => (
            <SubAdminRow key={admin.id} admin={admin} index={i}
              onView={() => setViewAdmin(admin)}
              onEdit={(e) => { e?.stopPropagation?.(); setEditAdmin(admin); }}
              onDelete={(e) => { e?.stopPropagation?.(); setDeleteTarget(admin); }}
              onToggleStatus={() => handleToggleStatus(admin)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <SubAdminFormModal isOpen onClose={() => setShowAdd(false)} existing={null}
          onSave={(data) => { handleSave(data); setShowAdd(false); }} />
      )}

      {editAdmin && (
        <SubAdminFormModal isOpen onClose={() => setEditAdmin(null)} existing={editAdmin}
          onSave={(data) => { handleSave(data, editAdmin.id); setEditAdmin(null); if (viewAdmin?.id === editAdmin.id) setViewAdmin((v) => ({ ...v, ...data })); }} />
      )}

      {viewAdmin && !editAdmin && (
        <DetailModal
          admin={admins.find((a) => a.id === viewAdmin.id) ?? viewAdmin}
          onClose={() => setViewAdmin(null)}
          onEdit={() => { setEditAdmin(admins.find((a) => a.id === viewAdmin.id) ?? viewAdmin); }}
          onDelete={() => { setViewAdmin(null); setDeleteTarget(admins.find((a) => a.id === viewAdmin.id) ?? viewAdmin); }}
          onToggleStatus={() => handleToggleStatus(admins.find((a) => a.id === viewAdmin.id) ?? viewAdmin)}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} isPending={false}
        title="Remove Sub Admin?"
        message={`"${deleteTarget?.name}" will be permanently removed from the system. This action cannot be undone.`}
        confirmLabel="Yes, Remove" accentColor={C.danger}
      />

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}