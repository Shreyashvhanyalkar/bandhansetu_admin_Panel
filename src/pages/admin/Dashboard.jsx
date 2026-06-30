// pages/admin/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const STATS = { totalUsers: 4821, activeRequests: 318, pendingApprovals: 47, completedMatches: 1204, approvalRate: 78, monthlyGrowth: 12 };

const MONTHLY_DATA = [
  { month: "Jul", requests: 210, approvals: 160 },
  { month: "Aug", requests: 245, approvals: 190 },
  { month: "Sep", requests: 198, approvals: 155 },
  { month: "Oct", requests: 320, approvals: 260 },
  { month: "Nov", requests: 285, approvals: 220 },
  { month: "Dec", requests: 340, approvals: 275 },
  { month: "Jan", requests: 290, approvals: 230 },
  { month: "Feb", requests: 375, approvals: 310 },
  { month: "Mar", requests: 410, approvals: 340 },
  { month: "Apr", requests: 318, approvals: 260 },
];

const RECENT_ACTIVITIES = [
  { id: 1, type: "user", user: "Priya Sharma", action: "registered a new account", time: "2 min ago" },
  { id: 2, type: "approval", user: "Rahul Mehta", action: "match request approved", time: "18 min ago" },
  { id: 3, type: "update", user: "Anjali Patel", action: "updated profile details", time: "45 min ago" },
  { id: 4, type: "request", user: "Vikram Singh", action: "submitted a new request", time: "1 hr ago" },
  { id: 5, type: "verification", user: "Neha Gupta", action: "profile under verification", time: "2 hrs ago" },
];

const C = {
  primary: "#bd201c", primaryDark: "#601000", primaryLight: "#fef2f2", primaryBorder: "#fca5a5",
  green: "#059669", greenBg: "#ecfdf5", greenText: "#065f46",
  amber: "#d97706", amberBg: "#fffbeb", amberText: "#92400E",
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, badge, badgeStyle, barWidth, barColor, iconBg, iconColor, delay }) {
  const [width, setWidth] = useState("0%");
  useEffect(() => { const t = setTimeout(() => setWidth(barWidth), 200 + delay * 1000); return () => clearTimeout(t); }, [barWidth, delay]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
      style={{ animation: `dashFadeUp 0.4s ease-out ${delay}s both` }}>
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs shrink-0" style={{ background: iconBg }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2.2}>{icon}</svg>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0" style={badgeStyle}>{badge}</span>
        </div>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">{value}</p>
        <p className="text-sm text-gray-500 mt-2 font-semibold tracking-wide">{label}</p>
      </div>
      <div className="mt-5">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width, background: barColor }} />
        </div>
      </div>
    </div>
  );
}

// ─── Activity Icon ──────────────────────────────────────────────────────────────
function ActivityDot({ type }) {
  const map = {
    user: { bg: C.primaryLight, color: C.primary, icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    )},
    approval: { bg: C.greenBg, color: C.green, icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    update: { bg: C.primaryLight, color: C.primary, icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    )},
    request: { bg: C.amberBg, color: C.amber, icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    )},
    verification: { bg: C.primaryLight, color: C.primary, icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
      </svg>
    )},
  };
  const cfg = map[type] || map.user;
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs border border-white" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.icon}
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [chartType, setChartType] = useState("bar");
  const [downloading, setDownloading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setAnimate(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    const s = document.createElement("style");
    s.id = "dash-anim";
    s.textContent = `
      @keyframes dashFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      @keyframes dashScaleIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
    `;
    if (!document.getElementById("dash-anim")) document.head.appendChild(s);
    return () => { 
      clearInterval(timer);
      const el = document.getElementById("dash-anim"); 
      if (el) el.remove(); 
    };
  }, []);

  const redBadge = { background: C.primaryLight, color: C.primary };
  const greenBadge = { background: C.greenBg, color: C.greenText };
  const amberBadge = { background: C.amberBg, color: C.amberText };

  const statCards = [
    { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />, value: STATS.totalUsers.toLocaleString(), label: "Total Users", badge: `+${STATS.monthlyGrowth}% this month`, badgeStyle: redBadge, barWidth: "75%", barColor: C.primary, iconBg: C.primaryLight, iconColor: C.primary, delay: 0 },
    { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />, value: STATS.activeRequests, label: "Active Requests", badge: "+5% this week", badgeStyle: amberBadge, barWidth: "50%", barColor: C.amber, iconBg: C.amberBg, iconColor: C.amber, delay: 0.05 },
    { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />, value: STATS.pendingApprovals, label: "Pending Approvals", badge: "Needs review", badgeStyle: redBadge, barWidth: "25%", barColor: "#fca5a5", iconBg: C.primaryLight, iconColor: C.primary, delay: 0.1 },
    { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />, value: STATS.completedMatches.toLocaleString(), label: "Completed Matches", badge: "+18% all time", badgeStyle: greenBadge, barWidth: "80%", barColor: C.green, iconBg: C.greenBg, iconColor: C.green, delay: 0.15 },
    { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />, value: `${STATS.approvalRate}%`, label: "Approval Rate", badge: "Above average", badgeStyle: redBadge, barWidth: `${STATS.approvalRate}%`, barColor: C.primary, iconBg: C.primaryLight, iconColor: C.primary, delay: 0.2 },
  ];

  const ChartComponent = chartType === "line" ? Line : Bar;

  const chartData = {
    labels: MONTHLY_DATA.map(d => d.month),
    datasets: [
      { 
        label: "Requests", 
        data: MONTHLY_DATA.map(d => d.requests), 
        backgroundColor: chartType === "line" ? "rgba(189, 32, 28, 0.12)" : "rgba(189, 32, 28, 0.85)", 
        borderColor: C.primary, 
        borderWidth: 2.5, 
        borderRadius: 6, 
        tension: 0.4, 
        pointRadius: chartType === "line" ? 5 : 0, 
        pointBackgroundColor: C.primary, 
        fill: chartType === "line" 
      },
      { 
        label: "Approvals", 
        data: MONTHLY_DATA.map(d => d.approvals), 
        backgroundColor: chartType === "line" ? "rgba(5, 150, 105, 0.12)" : "rgba(5, 150, 105, 0.85)", 
        borderColor: C.green, 
        borderWidth: 2.5, 
        borderRadius: 6, 
        tension: 0.4, 
        pointRadius: chartType === "line" ? 5 : 0, 
        pointBackgroundColor: C.green, 
        fill: chartType === "line" 
      },
    ],
  };

  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { font: { size: 12, weight: "600" }, boxWidth: 10, usePointStyle: true, padding: 20 } },
      tooltip: { backgroundColor: "#1f2937", titleColor: "#f9fafb", bodyColor: "#d1d5db", padding: 12, cornerRadius: 10, borderColor: "#374151", borderWidth: 1 },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
    animation: { duration: animate ? 700 : 0 },
  };

  const pieData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [{ data: [STATS.completedMatches, STATS.pendingApprovals, STATS.activeRequests - STATS.pendingApprovals], backgroundColor: [C.green, C.amber, "#fca5a5"], borderWidth: 0, hoverOffset: 10, cutout: "68%" }],
  };

  const pieOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1f2937", titleColor: "#f9fafb", bodyColor: "#d1d5db", padding: 10, cornerRadius: 10 } },
    animation: { duration: animate ? 900 : 0 },
  };

  const quickActions = [
    { label: "Manage Staff", emoji: "👤", bg: C.primaryLight, color: C.primary, onClick: () => navigate("/admin/sub-admins") },
    { label: "Verify Requests", emoji: "✅", bg: C.greenBg, color: C.green, onClick: () => navigate("/admin/requests") },
    { label: "Send Push", emoji: "📢", bg: C.primaryLight, color: C.primary, onClick: () => navigate("/admin/notifications") },
    { label: "Admin Settings", emoji: "⚙️", bg: "#f1f5f9", color: "#475569", onClick: () => navigate("/admin/admin-profile") },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans min-h-screen bg-slate-50">

      {/* Welcome Banner */}
      <div 
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl bg-gradient-to-r from-red-950 via-[#bd201c] to-[#601000]"
        style={{ animation: "dashFadeUp 0.4s ease-out both" }}
      >
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Glowing radial accent light */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-red-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-red-200 border border-white/10 uppercase tracking-widest">
              System Console
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              Welcome Back, Admin
            </h1>
            <p className="text-red-100 text-sm max-w-md font-medium leading-relaxed">
              Here is your BandhanSetu platform activity overview. Check request queues, pending verifications, and system growth metrics below.
            </p>
          </div>
          
          <div className="flex items-center gap-4.5 bg-black/15 backdrop-blur-md border border-white/10 rounded-2xl p-4 self-start md:self-auto shadow-inner">
            <div className="text-right">
              <p className="text-xs text-red-200 font-bold uppercase tracking-wider">Server Status</p>
              <p className="text-lg font-black font-mono">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-[10px] text-red-300 font-medium">
                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-400/20 shrink-0"></div>
          </div>
        </div>
      </div>

      {/* Control Actions / Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md border border-gray-200/60 rounded-2xl p-4 shadow-sm" style={{ animation: "dashFadeUp 0.4s ease-out both" }}>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Platform Analytics</h2>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">Configure date ranges and download CSV reports.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 outline-none focus:border-[#fca5a5] focus:ring-2 focus:ring-[#fef2f2] cursor-pointer shadow-xs font-semibold">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 3 months</option>
          </select>
          <button
            onClick={() => { setDownloading(true); setTimeout(() => setDownloading(false), 1500); }}
            disabled={downloading}
            className="px-5 py-2 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-60 flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer active:translate-y-0"
            style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})` }}
          >
            {downloading
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Exporting…</>
              : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> Export Report</>}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar/Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 hover:shadow-md transition-all flex flex-col justify-between" style={{ animation: "dashScaleIn 0.5s ease-out 0.2s both" }}>
          <div>
            <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Requests Analytics</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-semibold">Monthly comparison — requests vs approvals</p>
              </div>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {["bar", "line"].map(t => (
                  <button key={t} onClick={() => setChartType(t)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${chartType === t ? "bg-white text-[#bd201c] shadow-xs" : "text-gray-500 hover:text-gray-700"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72"><ChartComponent data={chartData} options={chartOptions} /></div>
          </div>
        </div>

        {/* Doughnut */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 hover:shadow-md transition-all flex flex-col justify-between" style={{ animation: "dashScaleIn 0.5s ease-out 0.3s both" }}>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-0.5">Distribution</h3>
            <p className="text-xs text-gray-500 mb-5 font-semibold">Request status breakdown</p>
            <div className="h-48 relative flex items-center justify-center">
              <Doughnut data={pieData} options={pieOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-gray-400">Total</span>
                <span className="text-2xl font-black text-gray-800">{(STATS.completedMatches + STATS.pendingApprovals + (STATS.activeRequests - STATS.pendingApprovals)).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { label: "Approved", value: STATS.completedMatches.toLocaleString(), color: C.green },
              { label: "Pending", value: STATS.pendingApprovals, color: C.amber },
              { label: "Rejected", value: STATS.activeRequests - STATS.pendingApprovals, color: "#fca5a5" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-gray-600 font-semibold">{item.label}</span>
                </div>
                <span className="font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between" style={{ animation: "dashScaleIn 0.5s ease-out 0.35s both" }}>
          <div>
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Recent Activity</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-semibold">Latest platform events</p>
              </div>
              <button className="text-xs font-bold px-3 py-1.5 rounded-xl transition hover:bg-[#fef2f2] cursor-pointer" style={{ color: C.primary }}>
                View All →
              </button>
            </div>
            <div className="p-6 relative">
              {/* Vertical timeline connector */}
              <div className="absolute left-[34px] top-6 bottom-6 w-[2px] bg-gray-100" />
              
              <div className="space-y-5">
                {RECENT_ACTIVITIES.map((a, i) => (
                  <div key={a.id} className="relative flex items-start gap-4 hover:bg-slate-50/50 p-1.5 rounded-xl transition-all"
                    style={{ animation: `dashFadeUp 0.3s ease ${i * 0.06 + 0.2}s both` }}>
                    <div className="z-10 shrink-0">
                      <ActivityDot type={a.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">
                        <span className="font-bold text-gray-900">{a.user}</span>{" "}
                        <span className="text-gray-600 font-medium">{a.action}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between" style={{ animation: "dashScaleIn 0.5s ease-out 0.4s both" }}>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-0.5">Quick Actions</h3>
            <p className="text-xs text-gray-500 mb-5 font-semibold">Common admin shortcuts</p>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
                <button 
                  key={action.label}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-[#fca5a5] hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer bg-slate-50/30 hover:bg-white"
                  style={{ animation: `dashFadeUp 0.3s ease ${i * 0.07 + 0.3}s both` }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-xs" style={{ background: action.bg }}>
                    {action.emoji}
                  </div>
                  <span className="text-sm font-bold text-gray-700">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mini KPI strip */}
          <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Today's Joins", value: "24", color: C.primary, bg: C.primaryLight },
              { label: "Verified", value: "186", color: C.green, bg: C.greenBg },
              { label: "Flagged", value: "3", color: C.amber, bg: C.amberBg },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl p-3 border border-gray-50 transition-all hover:scale-[1.03]" style={{ background: kpi.bg }}>
                <p className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
                <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider leading-none">{kpi.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">© 2026 BandhanSetu Admin · Data refreshed in real-time</p>
    </div>
  );
}