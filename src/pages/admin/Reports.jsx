// pages/admin/Reports.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ─── Static Data ──────────────────────────────────────────────────────────────
const STATIC_COMPLAINTS = [
  { id: 1,  reporter: "Priya Sharma",   reportedUser: "Karan Joshi",   reason: "Harassment",       description: "Sending repeated offensive messages.",                  status: "pending",  date: "2024-03-15" },
  { id: 2,  reporter: "Rahul Mehta",    reportedUser: "Suresh Pillai", reason: "Fake Profile",     description: "Profile photo and details appear to be fake.",          status: "warned",   date: "2024-03-14" },
  { id: 3,  reporter: "Anjali Patel",   reportedUser: "Rohit Bansal",  reason: "Spam",             description: "Spamming multiple users with promotional content.",      status: "pending",  date: "2024-03-13" },
  { id: 4,  reporter: "Vikram Singh",   reportedUser: "Sneha Reddy",   reason: "Inappropriate",    description: "Sending inappropriate images without consent.",          status: "blocked",  date: "2024-03-12" },
  { id: 5,  reporter: "Neha Gupta",     reportedUser: "Amit Verma",    reason: "Scam",             description: "Asking for money under false pretenses.",               status: "pending",  date: "2024-03-11" },
  { id: 6,  reporter: "Pooja Iyer",     reportedUser: "Divya Nair",    reason: "Harassment",       description: "Persistent unwanted contact after being asked to stop.", status: "ignored",  date: "2024-03-10" },
  { id: 7,  reporter: "Rohit Bansal",   reportedUser: "Priya Sharma",  reason: "Misrepresentation","description": "Claims to be employed but verification failed.",       status: "warned",   date: "2024-03-09" },
  { id: 8,  reporter: "Karan Joshi",    reportedUser: "Pooja Iyer",    reason: "Abusive Language", description: "Used abusive language during chat.",                    status: "blocked",  date: "2024-03-08" },
  { id: 9,  reporter: "Sneha Reddy",    reportedUser: "Vikram Singh",  reason: "Fake Profile",     description: "Multiple inconsistencies found in profile data.",       status: "ignored",  date: "2024-03-07" },
  { id: 10, reporter: "Amit Verma",     reportedUser: "Neha Gupta",    reason: "Spam",             description: "Mass messaging users with unrelated advertisements.",   status: "pending",  date: "2024-03-06" },
];

const REASON_CONFIG = {
  Harassment:       { bg: "#fee2e2", text: "#dc2626", icon: "😠", lightBg: "#fef2f2" },
  "Fake Profile":   { bg: "#fef3c7", text: "#b45309", icon: "🎭", lightBg: "#fffbeb" },
  Spam:             { bg: "#ede9fe", text: "#7c3aed", icon: "📧", lightBg: "#f5f3ff" },
  Inappropriate:    { bg: "#fce7f3", text: "#be185d", icon: "🔞", lightBg: "#fdf2f8" },
  Scam:             { bg: "#ffedd5", text: "#c2410c", icon: "💰", lightBg: "#fff7ed" },
  Misrepresentation:{ bg: "#dbeafe", text: "#1d4ed8", icon: "📝", lightBg: "#eff6ff" },
  "Abusive Language":{ bg: "#fee2e2", text: "#dc2626", icon: "💬", lightBg: "#fef2f2" },
};

const STATUS_CONFIG = {
  pending:  { label: "Pending",  bg: "#fef3c7", text: "#b45309", dot: "#f59e0b", icon: "⏳" },
  warned:   { label: "Warned",   bg: "#fde8d8", text: "#c2410c", dot: "#f97316", icon: "⚠️" },
  blocked:  { label: "Blocked",  bg: "#fee2e2", text: "#dc2626", dot: "#ef4444", icon: "🚫" },
  ignored:  { label: "Ignored",  bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af", icon: "👁️" },
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #C026D3 0%, #a21caf 100%)",
  "linear-gradient(135deg, #0f5132 0%, #0a3a24 100%)",
  "linear-gradient(135deg, #084298 0%, #062c6e 100%)",
  "linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)",
  "linear-gradient(135deg, #b5460f 0%, #8a3508 100%)",
  "linear-gradient(135deg, #0a4a5a 0%, #073a46 100%)",
];

function getAvatarGradient(id) {
  return AVATAR_GRADIENTS[(id - 1) % AVATAR_GRADIENTS.length];
}

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ─── Action Modal ─────────────────────────────────────────────────────────────
function ActionModal({ complaint, action, onConfirm, onClose, loading }) {
  const config = {
    warn:   { title: "Send Warning",    color: "#f97316", bg: "#fde8d8", icon: "⚠️", msg: `This will send a formal warning to ${complaint?.reportedUser}. They will be notified via email.` },
    block:  { title: "Block User",      color: "#dc2626", bg: "#fee2e2", icon: "🚫", msg: `This will permanently block ${complaint?.reportedUser} from the platform. All their data will be archived.` },
    ignore: { title: "Dismiss Report",  color: "#6b7280", bg: "#f3f4f6", icon: "👁️", msg: `This report will be marked as reviewed and no action will be taken against ${complaint?.reportedUser}.` },
  }[action] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-scale-up">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-lg"
            style={{ background: config.bg }}>
            {config.icon}
          </div>
          <h3 className="font-bold text-gray-800 text-xl">{config.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{config.msg}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: config.color }}>
            {loading ? <><Spinner /> Processing...</> : "Confirm Action"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Complaint Row Component ──────────────────────────────────────────────────
function ComplaintRow({ complaint, onAction, index }) {
  const status = STATUS_CONFIG[complaint.status];
  const reason = REASON_CONFIG[complaint.reason] || { bg: "#f3f4f6", text: "#374151", icon: "📌", lightBg: "#f9fafb" };
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative bg-white hover:bg-gradient-to-r hover:from-fuchsia-50/30 hover:to-transparent transition-all duration-300 border-b border-gray-100 last:border-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animation: `slideUp 0.3s ease-out ${index * 0.03}s forwards`, opacity: 0 }}
    >
      <div className="px-6 py-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform duration-300 group-hover:scale-105"
              style={{ background: getAvatarGradient(complaint.id) }}>
              {getInitials(complaint.reportedUser)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
              style={{ background: status.dot }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-semibold text-gray-800 text-sm">{complaint.reportedUser}</span>
              <span className="text-xs text-gray-400">reported by</span>
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                {complaint.reporter}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">{formatDate(complaint.date)}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: reason.bg, color: reason.text }}>
                <span>{reason.icon}</span>
                <span>{complaint.reason}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: status.bg, color: status.text }}>
                <span>{status.icon}</span>
                <span>{status.label}</span>
              </span>
            </div>
            
            <p className="text-sm text-gray-500 leading-relaxed">{complaint.description}</p>
          </div>

          {/* Actions */}
          {complaint.status === "pending" && (
            <div className={`flex gap-2 shrink-0 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
              <button
                onClick={() => onAction(complaint, "warn")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:shadow-md transition-all duration-200"
              >
                ⚠️ Warn
              </button>
              <button
                onClick={() => onAction(complaint, "block")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:shadow-md transition-all duration-200"
              >
                🚫 Block
              </button>
              <button
                onClick={() => onAction(complaint, "ignore")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-md transition-all duration-200"
              >
                👁️ Ignore
              </button>
            </div>
          )}
          
          {complaint.status !== "pending" && (
            <div className="shrink-0">
              <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Resolved
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({ label, count, bg, icon, trend, trendValue, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{count}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}%
              </span>
              <span className="text-xs text-gray-400">vs last week</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          style={{ background: bg }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Tab Navigation ──────────────────────────────────────────────────────────
function TabNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: "complaints", label: "All Complaints", icon: "📋", path: "/admin/reports/complaints" },
    { id: "warned", label: "Warned Users", icon: "⚠️", path: "/admin/reports/warned" },
    { id: "blocked", label: "Blocked Users", icon: "🚫", path: "/admin/reports/blocked" },
    { id: "ignored", label: "Ignored Reports", icon: "👁️", path: "/admin/reports/ignored" },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id, tab.path)}
          className={`px-6 py-3 text-sm font-medium rounded-t-2xl transition-all duration-200 flex items-center gap-2 ${
            activeTab === tab.id
              ? "bg-white text-fuchsia-600 border-b-2 border-fuchsia-500 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span className="text-base">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Reports Component ───────────────────────────────────────────────────
export default function Reports() {
  const location = useLocation();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState(STATIC_COMPLAINTS);
  const [search, setSearch] = useState("");
  const [actionTarget, setActionTarget] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes("/warned")) return "warned";
    if (location.pathname.includes("/blocked")) return "blocked";
    if (location.pathname.includes("/ignored")) return "ignored";
    return "complaints";
  });

  // Sync active tab with URL path
  useEffect(() => {
    if (location.pathname.includes("/warned")) setActiveTab("warned");
    else if (location.pathname.includes("/blocked")) setActiveTab("blocked");
    else if (location.pathname.includes("/ignored")) setActiveTab("ignored");
    else setActiveTab("complaints");
  }, [location.pathname]);

  const handleTabChange = (tabId, path) => {
    setActiveTab(tabId);
    navigate(path);
  };

  const handleStatClick = (tabId, path) => {
    setActiveTab(tabId);
    navigate(path);
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchTab =
      activeTab === "complaints" ? true :
      activeTab === "warned"     ? c.status === "warned"  :
      activeTab === "blocked"    ? c.status === "blocked" :
      activeTab === "ignored"    ? c.status === "ignored" : true;

    const matchSearch =
      c.reporter.toLowerCase().includes(search.toLowerCase()) ||
      c.reportedUser.toLowerCase().includes(search.toLowerCase()) ||
      c.reason.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    return matchTab && matchSearch;
  });

  const counts = {
    total:   complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    warned:  complaints.filter((c) => c.status === "warned").length,
    blocked: complaints.filter((c) => c.status === "blocked").length,
    ignored: complaints.filter((c) => c.status === "ignored").length,
  };

  const handleAction = (complaint, action) => {
    setActionTarget({ complaint, action });
  };

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      const newStatus = actionTarget.action === "warn" ? "warned"
        : actionTarget.action === "block" ? "blocked"
        : "ignored";
      setComplaints((prev) =>
        prev.map((c) => c.id === actionTarget.complaint.id ? { ...c, status: newStatus } : c)
      );
      setProcessing(false);
      setActionTarget(null);
    }, 800);
  };

  const pageTitle = {
    complaints: "All Complaints",
    warned: "Warned Users",
    blocked: "Blocked Users",
    ignored: "Ignored Reports",
  }[activeTab];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className=" px-6 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Reports & Moderation</h1>
              <p className="text-gray-500 text-sm mt-0.5">Manage user complaints, take action against violations, and maintain platform safety.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid - Clickable for navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <StatCard 
          label="Total Reports" 
          count={counts.total} 
          bg="#fdf4ff" 
          icon="📋" 
          trend="up" 
          trendValue="12"
          onClick={() => handleStatClick("complaints", "/admin/reports/complaints")}
        />
        <StatCard 
          label="Pending Review" 
          count={counts.pending} 
          bg="#fef3c7" 
          icon="⏳" 
          trend="up" 
          trendValue="8"
          onClick={() => handleStatClick("complaints", "/admin/reports/complaints")}
        />
        <StatCard 
          label="Warned Users" 
          count={counts.warned} 
          bg="#fde8d8" 
          icon="⚠️" 
          trend="down" 
          trendValue="5"
          onClick={() => handleStatClick("warned", "/admin/reports/warned")}
        />
        <StatCard 
          label="Blocked Users" 
          count={counts.blocked} 
          bg="#fee2e2" 
          icon="🚫" 
          trend="up" 
          trendValue="3"
          onClick={() => handleStatClick("blocked", "/admin/reports/blocked")}
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="px-6 pt-4">
          <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-800">{pageTitle}</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-600">
                {filteredComplaints.length}
              </span>
            </div>
            <div className="relative w-full sm:w-80">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by user, reporter, reason, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 transition-all outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <p className="font-medium text-gray-500 text-lg">No reports found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredComplaints.map((complaint, idx) => (
              <ComplaintRow
                key={complaint.id}
                complaint={complaint}
                onAction={handleAction}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionTarget && (
        <ActionModal
          complaint={actionTarget.complaint}
          action={actionTarget.action}
          onConfirm={handleConfirm}
          onClose={() => setActionTarget(null)}
          loading={processing}
        />
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}