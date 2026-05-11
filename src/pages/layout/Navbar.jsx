import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const pageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/dashboard/analytics": "Analytics",
  "/admin/dashboard/performance": "Performance",
  "/admin/requests": "User Requests",
  "/admin/requests/pending": "Pending Approvals",
  "/admin/requests/approved": "Approved Requests",
  "/admin/requests/rejected": "Rejected Requests",
  "/admin/reports/complaints": "View Complaints",
  "/admin/reports/warned": "Warned Users",
  "/admin/reports/blocked": "Blocked Users",
  "/admin/reports/ignored": "Ignored Reports",
  "/admin/notifications/send": "Send Notification",
  "/admin/notifications/broadcast": "Broadcast All",
  "/admin/notifications/target": "Target Specific Users",
  "/admin/notifications/scheduled": "Scheduled Notifications",
  "/admin/notifications/status": "Read Status",
  "/admin/admin-profile": "My Profile",
};

export default function Navbar({ onMenuClick }) {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/admin/reports") ? "Reports" :
     location.pathname.startsWith("/admin/notifications") ? "Notifications" :
     location.pathname.startsWith("/admin/requests") ? "User Requests" :
     "Dashboard");

  const handleProfileClick = () => {
    navigate("/admin/admin-profile");
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm font-[Inter,sans-serif]">
      {/* Left Side - Logo + Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-[#fef2f2] hover:text-[#bd201c] transition-colors"
          aria-label="Open sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page Title */}
        <div className="hidden sm:block pl-6 border-l border-gray-200">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 w-56 lg:w-72 focus-within:border-[#fca5a5] focus-within:ring-4 focus-within:ring-[#fef2f2] transition-all focus-within:bg-white group">
          <svg className="w-4 h-4 text-gray-400 group-focus-within:text-[#bd201c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="ml-3 bg-transparent text-sm outline-none placeholder-gray-400 w-full font-medium"
          />
        </div>

        {/* Icons */}
        <button className="p-2.5 rounded-2xl text-gray-500 hover:bg-[#fef2f2] hover:text-[#bd201c] transition-colors relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#bd201c] rounded-full ring-2 ring-white"></span>
        </button>

        <button className="p-2.5 rounded-2xl text-gray-500 hover:bg-[#fef2f2] hover:text-[#bd201c] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2" />
          </svg>
        </button>

        {/* User Profile - Made clickable */}
        <div 
          className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group"
          onClick={handleProfileClick}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-none group-hover:text-[#bd201c] transition-colors">{user?.name || "Admin"}</p>
            <p className="text-xs font-semibold text-gray-400 mt-1">Administrator</p>
          </div>

          <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-[#fef2f2] group-hover:ring-[#fca5a5] transition-all shadow-sm">
            <img
              src="https://i.pravatar.cc/128?u=laura" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}