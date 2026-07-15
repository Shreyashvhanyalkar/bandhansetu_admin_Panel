import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/admin/admin-profile");
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm font-sans">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-[#fef2f2] hover:text-[#bd201c] transition-colors"
          aria-label="Open sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div
          className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group"
          onClick={handleProfileClick}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-none group-hover:text-[#bd201c] transition-colors">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs font-semibold text-gray-400 mt-1">
              Administrator
            </p>
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