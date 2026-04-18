// pages/admin/Notifications.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// ─── Static Data ──────────────────────────────────────────────────────────────
const STATIC_NOTIFICATIONS = [
  { id: 1,  title: "Welcome to BandhanSetu!",       message: "Complete your profile to get better matches and start your journey.",          audience: "all",      scheduledAt: null,             sentAt: "2025-04-01 09:00", sent: 4821, delivered: 4700, read: 3200, status: "sent"      },
  { id: 2,  title: "New Match Found 💍",             message: "You have a new match waiting for your response. Don't miss this opportunity!", audience: "targeted", scheduledAt: null,             sentAt: "2025-04-02 11:30", sent: 312,  delivered: 300,  read: 265,  status: "sent"      },
  { id: 3,  title: "Profile Verification Reminder", message: "Your profile is pending verification. Please upload the required documents.", audience: "targeted", scheduledAt: null,             sentAt: "2025-04-05 14:00", sent: 47,   delivered: 45,   read: 38,   status: "sent"      },
  { id: 4,  title: "Festival Offer – Premium",      message: "Get 3 months premium free this festive season! Limited time offer.",        audience: "all",      scheduledAt: "2025-04-15 10:00",sentAt: null,              sent: 0,    delivered: 0,    read: 0,    status: "scheduled" },
  { id: 5,  title: "Account Security Alert",        message: "Login detected from a new device. Was this you? Verify your account.",       audience: "targeted", scheduledAt: null,             sentAt: "2025-04-08 08:15", sent: 23,   delivered: 23,   read: 20,   status: "sent"      },
  { id: 6,  title: "Weekly Match Digest",           message: "Here are your top 5 compatible profiles this week based on your preferences.", audience: "all",      scheduledAt: "2025-04-20 09:00",sentAt: null,              sent: 0,    delivered: 0,    read: 0,    status: "scheduled" },
  { id: 7,  title: "Profile Photo Approved ✅",     message: "Your profile photo has been approved by our team. Your profile is now live!", audience: "targeted", scheduledAt: null,             sentAt: "2025-04-10 16:45", sent: 89,   delivered: 88,   read: 76,   status: "sent"      },
];

const STATIC_USERS = [
  { id: 1,  name: "Priya Sharma",  email: "priya.sharma@gmail.com",  avatar: "P", location: "Mumbai" },
  { id: 2,  name: "Rahul Mehta",   email: "rahul.mehta@gmail.com",   avatar: "R", location: "Delhi" },
  { id: 3,  name: "Anjali Patel",  email: "anjali.patel@yahoo.com",  avatar: "A", location: "Ahmedabad" },
  { id: 4,  name: "Vikram Singh",  email: "vikram.singh@hotmail.com",avatar: "V", location: "Jaipur" },
  { id: 5,  name: "Neha Gupta",    email: "neha.gupta@gmail.com",    avatar: "N", location: "Pune" },
  { id: 6,  name: "Amit Verma",    email: "amit.verma@gmail.com",    avatar: "A", location: "Bangalore" },
  { id: 7,  name: "Sneha Reddy",   email: "sneha.reddy@yahoo.com",   avatar: "S", location: "Hyderabad" },
  { id: 8,  name: "Karan Joshi",   email: "karan.joshi@gmail.com",   avatar: "K", location: "Chennai" },
];

function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function StatCard({ label, value, icon, trend, trendValue, delay }) {
  return (
    <div 
      className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      style={{ animation: `fadeSlideUp 0.4s ease-out ${delay}s forwards`, opacity: 0 }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}%
              </span>
              <span className="text-xs text-gray-400">vs last week</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TabNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: "send", label: "Send Notification", icon: "✏️", path: "/admin/notifications/send" },
    { id: "broadcast", label: "Broadcast All", icon: "📢", path: "/admin/notifications/broadcast" },
    { id: "target", label: "Target Users", icon: "🎯", path: "/admin/notifications/target" },
    { id: "scheduled", label: "Scheduled", icon: "📅", path: "/admin/notifications/scheduled" },
    { id: "status", label: "Read Status", icon: "📊", path: "/admin/notifications/status" },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id, tab.path)}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 flex items-center gap-2 ${
            activeTab === tab.id
              ? "bg-white text-fuchsia-600 border-b-2 border-fuchsia-500 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span className="text-base">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Compose Form Component ───────────────────────────────────────────────────
function ComposeForm({ mode, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: mode === "broadcast" ? "all" : mode === "target" ? "targeted" : "all",
    selectedUsers: [],
    schedule: false,
    scheduledAt: "",
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(form.message.length);
  }, [form.message]);

  const handleSend = () => {
    if (!form.title.trim() || !form.message.trim()) return;
    if (form.schedule && !form.scheduledAt) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      setForm({ title: "", message: "", audience: form.audience, selectedUsers: [], schedule: false, scheduledAt: "" });
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 3000);
    }, 1200);
  };

  const toggleUser = (id) => {
    setForm((f) => ({
      ...f,
      selectedUsers: f.selectedUsers.includes(id)
        ? f.selectedUsers.filter((u) => u !== id)
        : [...f.selectedUsers, id],
    }));
  };

  const getAudienceText = () => {
    if (mode === "broadcast") return "All registered users will receive this notification.";
    if (mode === "target") return `Selected ${form.selectedUsers.length} user(s) will receive this notification.`;
    if (form.audience === "all") return "All registered users will receive this notification.";
    return `${form.selectedUsers.length} selected user(s) will receive this notification.`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-scale-in">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-fuchsia-50/30 to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-fuchsia-100 flex items-center justify-center">
            {mode === "broadcast" ? "📢" : mode === "target" ? "🎯" : "✏️"}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">
              {mode === "broadcast" ? "Broadcast to All Users" :
               mode === "target"    ? "Target Specific Users"  :
               "Send Notification"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{getAudienceText()}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 animate-slide-down">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Notification {form.schedule ? "scheduled" : "sent"} successfully!
          </div>
        )}

        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
            Notification Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., New match found for you!"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 transition-all"
          />
        </div>

        {/* Message Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            placeholder="Write your notification message here…"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 transition-all resize-none"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">{charCount} characters</p>
            {charCount > 0 && charCount < 20 && <p className="text-xs text-amber-600">Tip: Add more details for better engagement</p>}
          </div>
        </div>

        {/* Audience Selector (only for send mode) */}
        {mode === "send" && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Audience</label>
            <div className="flex gap-3">
              {[
                { id: "all", label: "🌍 All Users", desc: "Send to everyone" },
                { id: "targeted", label: "🎯 Specific Users", desc: "Choose recipients" }
              ].map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setForm((f) => ({ ...f, audience: id, selectedUsers: id === "all" ? [] : f.selectedUsers }))}
                  className={`flex-1 p-3 rounded-xl text-left transition-all duration-200 ${
                    form.audience === id
                      ? "bg-fuchsia-50 border-2 border-fuchsia-400 shadow-sm"
                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Picker for targeted */}
        {(mode === "target" || (mode === "send" && form.audience === "targeted")) && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center justify-between">
              <span>Select Users</span>
              <span className="text-fuchsia-600">{form.selectedUsers.length} selected</span>
            </label>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {STATIC_USERS.map((u) => {
                const isSelected = form.selectedUsers.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleUser(u.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${
                      isSelected ? "bg-fuchsia-50/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? "bg-fuchsia-500 border-fuchsia-500" : "border-gray-300"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold">
                      {u.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <div className="text-xs text-gray-400">{u.location}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Schedule Toggle */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Schedule for Later</label>
              <p className="text-xs text-gray-400 mt-0.5">Set a future date and time</p>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, schedule: !f.schedule, scheduledAt: "" }))}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form.schedule ? "bg-fuchsia-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                  form.schedule ? "left-6" : "left-0.5"
                }`}
              />
            </button>
          </div>
          {form.schedule && (
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 transition-all"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setForm({ title: "", message: "", audience: form.audience, selectedUsers: [], schedule: false, scheduledAt: "" })}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
          >
            Clear Form
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !form.title.trim() || !form.message.trim() || (form.schedule && !form.scheduledAt)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:from-fuchsia-700 hover:to-fuchsia-600 shadow-md hover:shadow-lg"
          >
            {sending ? (
              <><Spinner /> {form.schedule ? "Scheduling..." : "Sending..."}</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {form.schedule ? "Schedule Notification" : mode === "broadcast" ? "Broadcast Now" : "Send Notification"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Notification History Table ───────────────────────────────────────────────
function NotificationHistory({ filterStatus }) {
  const [expandedId, setExpandedId] = useState(null);
  
  const filtered = filterStatus
    ? STATIC_NOTIFICATIONS.filter((n) => n.status === filterStatus)
    : STATIC_NOTIFICATIONS;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-scale-in">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-fuchsia-100 flex items-center justify-center text-sm">
            {filterStatus === "scheduled" ? "📅" : "📬"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {filterStatus === "scheduled" ? "Scheduled Notifications" : "Notification History"}
            </h3>
            <p className="text-xs text-gray-400">{filtered.length} notifications</p>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-4xl">
            📭
          </div>
          <p className="font-medium text-gray-500">No notifications found</p>
          <p className="text-sm text-gray-400 mt-1">Create your first notification using the form above</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filtered.map((n, idx) => {
            const deliveryRate = n.sent > 0 ? Math.round((n.delivered / n.sent) * 100) : 0;
            const readRate = n.delivered > 0 ? Math.round((n.read / n.delivered) * 100) : 0;
            const isExpanded = expandedId === n.id;
            
            return (
              <div 
                key={n.id} 
                className="hover:bg-gray-50 transition-all duration-200"
                style={{ animation: `slideUp 0.3s ease-out ${idx * 0.05}s forwards`, opacity: 0 }}
              >
                <div className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ background: n.audience === "all" ? "#fdf4ff" : "#eff6ff" }}>
                      {n.audience === "all" ? "📢" : "🎯"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-800">{n.title}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          n.status === "sent" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {n.status === "sent" ? "Sent" : "Scheduled"}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          n.audience === "all" ? "bg-fuchsia-50 text-fuchsia-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {n.audience === "all" ? "All users" : "Targeted"}
                        </span>
                      </div>
                      
                      <p className={`text-sm text-gray-500 ${!isExpanded ? 'line-clamp-1' : ''}`}>
                        {n.message}
                      </p>
                      
                      {n.status === "sent" && n.sent > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">📤 Sent:</span>
                            <span className="text-xs font-semibold text-gray-700">{n.sent.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">📬 Delivered:</span>
                            <span className="text-xs font-semibold text-blue-600">{n.delivered.toLocaleString()} ({deliveryRate}%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">👁️ Read:</span>
                            <span className="text-xs font-semibold text-green-600">{n.read.toLocaleString()} ({readRate}%)</span>
                          </div>
                        </div>
                      )}

                      {n.status === "scheduled" && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-blue-600 font-medium">📅 Scheduled for {n.scheduledAt}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-gray-400">{n.sentAt || n.scheduledAt}</div>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : n.id)}
                        className="mt-2 text-xs text-fuchsia-600 hover:text-fuchsia-700 transition"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Read Status Page ─────────────────────────────────────────────────────────
function ReadStatus() {
  const totalSent = STATIC_NOTIFICATIONS.filter((n) => n.status === "sent").reduce((s, n) => s + n.sent, 0);
  const totalDelivered = STATIC_NOTIFICATIONS.filter((n) => n.status === "sent").reduce((s, n) => s + n.delivered, 0);
  const totalRead = STATIC_NOTIFICATIONS.filter((n) => n.status === "sent").reduce((s, n) => s + n.read, 0);
  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
  const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Total Sent" value={totalSent.toLocaleString()} icon="📤" trend="up" trendValue="12" delay={0} />
        <StatCard label="Total Delivered" value={totalDelivered.toLocaleString()} icon="📬" trend="up" trendValue="8" delay={0.05} />
        <StatCard label="Total Read" value={totalRead.toLocaleString()} icon="👁️" trend="up" trendValue="15" delay={0.1} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Delivery Rate</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{deliveryRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-xl">📬</div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000" style={{ width: `${deliveryRate}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-3">{totalDelivered.toLocaleString()} of {totalSent.toLocaleString()} delivered successfully</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Read Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{readRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-xl">👁️</div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000" style={{ width: `${readRate}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-3">{totalRead.toLocaleString()} of {totalDelivered.toLocaleString()} users opened the notification</p>
        </div>
      </div>

      <NotificationHistory filterStatus={null} />
    </div>
  );
}

// ─── Main Notifications Component ─────────────────────────────────────────────
export default function Notifications() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes("/broadcast")) return "broadcast";
    if (location.pathname.includes("/target")) return "target";
    if (location.pathname.includes("/scheduled")) return "scheduled";
    if (location.pathname.includes("/status")) return "status";
    return "send";
  });

  useEffect(() => {
    if (location.pathname.includes("/broadcast")) setActiveTab("broadcast");
    else if (location.pathname.includes("/target")) setActiveTab("target");
    else if (location.pathname.includes("/scheduled")) setActiveTab("scheduled");
    else if (location.pathname.includes("/status")) setActiveTab("status");
    else setActiveTab("send");
  }, [location.pathname]);

  const handleTabChange = (tabId, path) => {
    setActiveTab(tabId);
    navigate(path);
  };

  const totalStats = {
    sent: STATIC_NOTIFICATIONS.filter((n) => n.status === "sent").length,
    scheduled: STATIC_NOTIFICATIONS.filter((n) => n.status === "scheduled").length,
    totalSent: STATIC_NOTIFICATIONS.filter((n) => n.status === "sent").reduce((s, n) => s + n.sent, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className=" -mx-6 -mt-6 px-6 pt-8 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
            <span className="text-xl">🔔</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-500 text-sm mt-0.5">Send, broadcast, schedule and track notification performance</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <StatCard label="Sent" value={totalStats.sent} icon="📤" trend="up" trendValue="8" delay={0} />
        <StatCard label="Scheduled" value={totalStats.scheduled} icon="📅" trend="down" trendValue="3" delay={0.05} />
        <StatCard label="Total Pushes" value={totalStats.totalSent.toLocaleString()} icon="📢" trend="up" trendValue="12" delay={0.1} />
        <StatCard label="Active Users" value="4,821" icon="👥" trend="up" trendValue="5" delay={0.15} />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-4">
          <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div className="p-6">
          {(activeTab === "send" || activeTab === "broadcast" || activeTab === "target") && (
            <ComposeForm mode={activeTab} />
          )}
          {activeTab === "scheduled" && <NotificationHistory filterStatus="scheduled" />}
          {activeTab === "status" && <ReadStatus />}
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeSlideUp 0.4s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}