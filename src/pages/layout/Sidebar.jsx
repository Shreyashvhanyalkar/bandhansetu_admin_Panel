// components/admin/Sidebar.jsx
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLogout } from "../../hooks/useAuthMutations";

// ─── Design Tokens for Sidebar ────────────────────────────────────────────────
const theme = {
  primary: "#bd201c",
  primaryDark: "#601000",
  primaryLight: "#fef2f2",
  textMuted: "#9ca3af",
  textHover: "#bd201c",
};

// ─── Navigation Items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    children: [
      { label: "Overview", to: "/admin/dashboard" },
      { label: "Analytics", to: "/admin/dashboard/analytics" },
      { label: "Performance", to: "/admin/dashboard/performance" },
    ],
  },
  {
    label: "Management & Moderation",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    children: [
      { label: "User Management", to: "/admin/requests" },
      { label: "Location Management", to: "/admin/locations" },
      // { label: "Education Management", to: "/admin/education" },
      // { label: "Currency Management", to: "/admin/currency" },/
      {
        label: "Religion & Community",
        to: "/admin/religion",

      },
    ],
  },

  {
    label: "Sub Admin Management",
    to: "/admin/sub-admins",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "Reports & Moderation",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    badge: "4",
    children: [
      { label: "View Complaints", to: "/admin/reports/complaints", badge: "3" },
      { label: "Warned Users", to: "/admin/reports/warned" },
      { label: "Blocked Users", to: "/admin/reports/blocked" },
      { label: "Ignored Reports", to: "/admin/reports/ignored" },
    ],
  },
  {
    label: "Notifications",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    children: [
      { label: "Send Notification", to: "/admin/notifications/send" },
      { label: "Broadcast All", to: "/admin/notifications/broadcast" },
      { label: "Target Specific", to: "/admin/notifications/target" },
      { label: "Scheduled", to: "/admin/notifications/scheduled" },
      { label: "Read Status", to: "/admin/notifications/status" },
    ],
  },
  {
    label: "Settings",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { label: "General Settings", to: "/admin/settings/general" },
      { label: "Security", to: "/admin/settings/security" },
      { label: "Email Templates", to: "/admin/settings/emails" },
      { label: "API Keys", to: "/admin/settings/api" },
    ],
  },
];

// ─── Chevron ──────────────────────────────────────────────────────────────────
function Chevron({ open }) {
  return (
    <svg
      className="w-3 h-3 shrink-0 transition-all duration-300"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ─── Recursive NavGroup ───────────────────────────────────────────────────────
function NavGroup({ item, onClose, isMobile, depth = 0 }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const isGroupActive = item.children?.some(
      c => location.pathname === c.to || location.pathname.startsWith(c.to + "/")
    );
    if (isGroupActive) setOpen(true);
  }, [location.pathname, item.children]);

  const hasChildren = item.children && item.children.length > 0;
  const isParentActive = hasChildren && item.children.some(
    c => location.pathname === c.to || location.pathname.startsWith(c.to + "/")
  );

  const getPaddingClass = () => {
    if (depth === 0) return "pl-3";
    if (depth === 1) return "pl-10";
    return "pl-14";
  };

  const getActiveBorderColor = () => {
    if (depth === 0) return theme.primary;
    if (depth === 1) return theme.primary;
    return "#fca5a5";
  };

  // ── Direct link (no children) ─────────────────────────────────────────────
  if (!hasChildren) {
    return (
      <NavLink
        to={item.to}
        onClick={() => isMobile && onClose?.()}
        className={({ isActive }) =>
          `flex items-center gap-2 ${getPaddingClass()} py-2 rounded-lg text-sm font-medium transition-all duration-200 my-0.5 ${isActive
            ? "shadow-sm border-l-2"
            : "text-gray-600 hover:bg-gray-100"
          }`
        }
        style={({ isActive }) => ({
          borderColor: isActive ? getActiveBorderColor() : "transparent",
          backgroundColor: isActive ? theme.primaryLight : "",
          color: isActive ? theme.primary : "",
        })}
      >
        {({ isActive }) => (
          <>
            {item.icon && (
              <span className={`transition-all duration-200`} style={{ color: isActive ? theme.primary : theme.textMuted }}>
                {item.icon}
              </span>
            )}
            <span className="flex-1 transition-colors hover:text-[#bd201c]">{item.label}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full" style={{ backgroundColor: "#fecaca", color: theme.primaryDark }}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  }

  // ── Expandable group ──────────────────────────────────────────────────────
  return (
    <div className="my-0.5">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2 ${getPaddingClass()} py-2 rounded-lg text-sm font-medium transition-all duration-200 ${open || isParentActive
          ? "bg-gray-100/80"
          : "text-gray-600 hover:bg-gray-100"
          }`}
        style={{ color: open || isParentActive ? theme.primaryDark : "" }}
      >
        {item.icon && (
          <span className={`transition-all duration-200`} style={{ color: open || isParentActive ? theme.primary : theme.textMuted }}>
            {item.icon}
          </span>
        )}
        <span className="flex-1 text-left font-medium transition-colors hover:text-[#bd201c]">{item.label}</span>
        {item.badge && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white mr-1" style={{ backgroundColor: theme.primary }}>
            {item.badge}
          </span>
        )}
        <span className={`transition-all duration-300 mr-1`} style={{ color: open || isParentActive ? theme.primary : theme.textMuted }}>
          <Chevron open={open} />
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${open ? "max-h-[500px] opacity-100 mt-0.5" : "max-h-0 opacity-0"
          }`}
      >
        <div className="ml-2 space-y-0.5">
          {item.children.map(child => (
            <NavGroup
              key={child.label || child.to}
              item={child}
              onClose={onClose}
              isMobile={isMobile}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────
function SidebarContent({ onClose, isMobile }) {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const logoutMutation = useLogout();

  return (
    <div className="flex flex-col h-full bg-white rounded-t-4xl font-sans">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})` }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-gray-900 font-extrabold text-lg tracking-tight">BandhanSetu</h1>
          <p className="text-xs font-bold mt-0.5" style={{ color: theme.primary }}>Matrimony Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-wider px-3 mb-3" style={{ color: theme.primary }}>
          Main Navigation
        </p>
        {NAV_ITEMS.map(item => (
          <NavGroup key={item.label} item={item} onClose={onClose} isMobile={isMobile} depth={0} />
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="px-3 py-4 border-t border-gray-100 mt-2">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-3" style={{ backgroundColor: theme.primaryLight }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md" style={{ background: `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})` }}>
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-900 text-sm font-bold truncate">{user?.name || "Admin User"}</p>
            <p className="text-xs truncate" style={{ color: theme.primary }}>{user?.email || "admin@bandhan.com"}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200 animate-pulse" />
        </div>
        <button
          onClick={() => { logoutMutation.mutate(null, { onSettled: () => navigate("/login") }); }}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 transition-colors group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-80 min-h-screen shrink-0 bg-white border-r border-gray-100 shadow-lg shadow-gray-100/50 rounded-r-3xl">
        <SidebarContent isMobile={false} />
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
          <aside className="relative w-80 max-w-[85vw] h-full bg-white shadow-2xl z-10 flex flex-col animate-slide-in-right rounded-r-3xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 transition-all z-10 hover:bg-[#fef2f2] hover:text-[#bd201c]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent onClose={onClose} isMobile={true} />
          </aside>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </>
  );
}