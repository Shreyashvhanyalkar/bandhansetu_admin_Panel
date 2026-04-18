// pages/admin/Dashboard.jsx
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const STATS = {
  totalUsers: 4821,
  activeRequests: 318,
  pendingApprovals: 47,
  completedMatches: 1204,
  approvalRate: 78,
  monthlyGrowth: 12,
};

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
  { id: 1, type: "user", user: "Priya Sharma", action: "registered a new account", time: "2 minutes ago" },
  { id: 2, type: "approval", user: "Rahul Mehta", action: "match request approved", time: "18 minutes ago" },
  { id: 3, type: "update", user: "Anjali Patel", action: "updated profile details", time: "45 minutes ago" },
  { id: 4, type: "request", user: "Vikram Singh", action: "submitted a new request", time: "1 hour ago" },
  { id: 5, type: "verification", user: "Neha Gupta", action: "profile under verification", time: "2 hours ago" },
];

const COLOR = {
  primary: "#C026D3",
  primaryHover: "#a21caf",
  primaryBg: "#fdf4ff",
  primaryText: "#86198f",
  primaryLight: "#e879f9",
  green: "#639922",
  greenBg: "#EAF3DE",
  greenText: "#27500A",
  amber: "#F59E0B",
  amberBg: "#FEF3C7",
  amberText: "#92400E",
};

function StatCard({ icon, value, label, badge, badgeColor, barWidth, barColor, iconBg, iconColor, delay }) {
  const [width, setWidth] = useState("0%");
  useEffect(() => {
    setTimeout(() => setWidth(barWidth), 100);
  }, [barWidth]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group" style={{ animation: `fadeSlideUp 0.4s ease-out ${delay}s forwards`, opacity: 0 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md" style={{ background: iconBg }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={iconColor}>{icon}</svg>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: badgeColor.bg, color: badgeColor.text }}>{badge}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width, background: barColor }} />
      </div>
    </div>
  );
}

function ActivityIcon({ type }) {
  const map = {
    user: { bg: COLOR.primaryBg, stroke: COLOR.primary, path: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
    approval: { bg: COLOR.greenBg, stroke: COLOR.green, path: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    update: { bg: COLOR.primaryBg, stroke: COLOR.primary, path: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /> },
    request: { bg: COLOR.amberBg, stroke: "#B45309", path: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
    verification: { bg: COLOR.primaryBg, stroke: COLOR.primary, path: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> },
  };
  const cfg = map[type] || map.user;
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={cfg.stroke}>{cfg.path}</svg>
    </div>
  );
}

export default function Dashboard() {
  const [chartType, setChartType] = useState("bar");
  const [downloading, setDownloading] = useState(false);
  const [animateCharts, setAnimateCharts] = useState(false);

  useEffect(() => setAnimateCharts(true), []);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1500);
  };

  const barData = {
    labels: MONTHLY_DATA.map(d => d.month),
    datasets: [
      { label: "Requests", data: MONTHLY_DATA.map(d => d.requests), backgroundColor: chartType === "line" ? "transparent" : "rgba(192,38,211,0.75)", borderColor: COLOR.primary, borderWidth: 2, borderRadius: 8, tension: 0.4, pointRadius: chartType === "line" ? 4 : 0, pointBackgroundColor: COLOR.primary },
      { label: "Approvals", data: MONTHLY_DATA.map(d => d.approvals), backgroundColor: chartType === "line" ? "transparent" : "rgba(99,153,34,0.7)", borderColor: COLOR.green, borderWidth: 2, borderRadius: 8, tension: 0.4, pointRadius: chartType === "line" ? 4 : 0, pointBackgroundColor: COLOR.green },
    ],
  };

  const pieData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [{ data: [STATS.completedMatches, STATS.pendingApprovals, STATS.activeRequests - STATS.pendingApprovals], backgroundColor: [COLOR.green, COLOR.amber, COLOR.primaryLight], borderWidth: 0, hoverOffset: 8, cutout: "65%" }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 12, usePointStyle: true } }, tooltip: { backgroundColor: COLOR.primaryText, titleColor: "#fdf4ff", bodyColor: "#f0abfc", padding: 8, cornerRadius: 8 } },
    scales: { y: { beginAtZero: true, grid: { color: "rgba(192,38,211,0.08)" } }, x: { grid: { display: false } } },
    animation: { duration: animateCharts ? 800 : 0, easing: "easeOutQuart" },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: COLOR.primaryText, titleColor: "#fdf4ff", bodyColor: "#f0abfc" } },
    animation: { duration: animateCharts ? 1000 : 0, easing: "easeOutBounce" },
  };

  const ChartComponent = chartType === "line" ? Line : Bar;
  const fuchsiaBadge = { bg: COLOR.primaryBg, text: COLOR.primaryText };
  const greenBadge = { bg: COLOR.greenBg, text: COLOR.greenText };
  const amberBadge = { bg: COLOR.amberBg, text: COLOR.amberText };

  const statCards = [
    { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />, value: STATS.totalUsers.toLocaleString(), label: "Total Users", badge: `+${STATS.monthlyGrowth}%`, badgeColor: fuchsiaBadge, barWidth: "75%", barColor: COLOR.primary, iconBg: COLOR.primaryBg, iconColor: COLOR.primary, delay: 0 },
    { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />, value: STATS.activeRequests, label: "Active Requests", badge: "+5%", badgeColor: amberBadge, barWidth: "50%", barColor: COLOR.amber, iconBg: COLOR.amberBg, iconColor: "#B45309", delay: 0.03 },
    { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />, value: STATS.pendingApprovals, label: "Pending Approvals", badge: `+${STATS.pendingApprovals}`, badgeColor: fuchsiaBadge, barWidth: "25%", barColor: COLOR.primaryLight, iconBg: COLOR.primaryBg, iconColor: COLOR.primary, delay: 0.06 },
    { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />, value: STATS.completedMatches.toLocaleString(), label: "Completed Matches", badge: "+18%", badgeColor: greenBadge, barWidth: "80%", barColor: COLOR.green, iconBg: COLOR.greenBg, iconColor: COLOR.green, delay: 0.09 },
    { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />, value: `${STATS.approvalRate}%`, label: "Approval Rate", badge: "+5%", badgeColor: fuchsiaBadge, barWidth: `${STATS.approvalRate}%`, barColor: COLOR.primary, iconBg: COLOR.primaryBg, iconColor: COLOR.primary, delay: 0.12 },
  ];

  const quickActions = [
    { label: "Add User", iconBg: COLOR.primaryBg, iconColor: COLOR.primary, path: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /> },
    { label: "Verify Requests", iconBg: COLOR.greenBg, iconColor: COLOR.green, path: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { label: "Generate Report", iconBg: COLOR.primaryBg, iconColor: COLOR.primary, path: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    { label: "Settings", iconBg: COLOR.primaryBg, iconColor: COLOR.primary, path: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></> },
  ];

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
      @keyframes scaleIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
      .animate-fade-up { animation: fadeSlideUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards; }
      .animate-scale-in { animation: scaleIn 0.4s ease-out forwards; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, Laura! Here's what's happening with your matrimony platform.</p>
        </div>
        <div className="flex gap-3">
          <select className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-300 transition-all cursor-pointer shadow-sm">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 3 months</option>
          </select>
          <button onClick={handleDownload} disabled={downloading} className="px-5 py-2 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:from-fuchsia-700 hover:to-fuchsia-600">
            {downloading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Downloading...</> : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Download Report</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statCards.map((card, idx) => <StatCard key={idx} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 hover:shadow-md transition-all duration-300 animate-scale-in">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div><h3 className="font-semibold text-gray-800 text-lg">Requests Analytics</h3><p className="text-xs text-gray-400 mt-0.5">Monthly comparison</p></div>
            <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
              {["bar", "line"].map(type => <button key={type} onClick={() => setChartType(type)} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${chartType === type ? "bg-fuchsia-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>)}
            </div>
          </div>
          <div className="h-80"><ChartComponent data={barData} options={chartOptions} /></div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 hover:shadow-md transition-all duration-300 animate-scale-in">
          <h3 className="font-semibold text-gray-800 text-lg mb-3">Request Distribution</h3>
          <div className="h-56 flex items-center justify-center"><Doughnut data={pieData} options={pieOptions} /></div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: COLOR.green }} /><span className="text-gray-600">Approved</span></div><span className="font-semibold text-gray-800">{STATS.completedMatches.toLocaleString()}</span></div>
            <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: COLOR.amber }} /><span className="text-gray-600">Pending</span></div><span className="font-semibold text-gray-800">{STATS.pendingApprovals}</span></div>
            <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: COLOR.primaryLight }} /><span className="text-gray-600">Rejected</span></div><span className="font-semibold text-gray-800">{STATS.activeRequests - STATS.pendingApprovals}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 animate-scale-in">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/60 to-white flex items-center justify-between">
            <div><h3 className="font-semibold text-gray-800">Recent Activities</h3><p className="text-xs text-gray-400 mt-0.5">Latest platform updates</p></div>
            <button className="text-xs font-medium px-3 py-1 rounded-full transition-all hover:bg-fuchsia-50" style={{ color: COLOR.primary }}>View All</button>
          </div>
          <div className="divide-y divide-gray-100">
            {RECENT_ACTIVITIES.map((activity, idx) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-all duration-200 flex items-start gap-3 group" style={{ animation: `fadeSlideUp 0.3s ease ${idx * 0.05}s forwards`, opacity: 0 }}>
                <ActivityIcon type={activity.type} />
                <div className="flex-1 min-w-0"><p className="text-sm text-gray-800"><span className="font-semibold">{activity.user}</span> <span className="text-gray-600">{activity.action}</span></p><p className="text-xs text-gray-400 mt-0.5">{activity.time}</p></div>
                <button className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-300 animate-scale-in">
          <h3 className="font-semibold text-gray-800 mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-5">
            {quickActions.map((action, idx) => (
              <button key={action.label} className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 group bg-gray-50 hover:bg-fuchsia-50 hover:scale-[1.02] active:scale-98" style={{ animation: `fadeSlideUp 0.3s ease ${idx * 0.05 + 0.2}s forwards`, opacity: 0 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: action.iconBg }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={action.iconColor}>{action.path}</svg></div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100 mt-2 animate-fade-up">© 2025 Matrimony Analytics — Insights dashboard | Data updated in real-time</div>
    </div>
  );
}