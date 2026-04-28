import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function AdminProfile() {
  const { user } = useSelector((s) => s.auth);

  // Static admin data
  const adminData = {
    fullName: user?.name || "Admin User",
    email: "admin@bandhan.com",
    phone: "+91 98765 43210",
    role: "Administrator",
    department: "Admin Management",
    joinDate: "January 15, 2024",
    location: "Mumbai, India",
    avatar: "https://i.pravatar.cc/128?u=laura"
  };

  return (
    <div >
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/admin/dashboard" 
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all hover:opacity-80"
          style={{ color: "#ae63b8" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div 
            className="h-32 relative"
            style={{ 
              background: `linear-gradient(135deg, #c27ccb 0%, #b860c0 100%)` 
            }}
          ></div>

          {/* Profile Content */}
          <div className="relative px-6 pb-8">
            {/* Avatar - Centered */}
            <div className="flex justify-center -mt-16 mb-6">
              <div 
                className="relative w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg"
                style={{ borderColor: "#fdf4ff" }}
              >
                <img
                  src={adminData.avatar}
                  alt={adminData.fullName}
                  className="w-full h-full object-cover"
                />
                {/* Edit Avatar Button */}
                <button 
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                  style={{ color: "#b871c2" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Name and Role */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-1" style={{ color: "#1f2937" }}>
                {adminData.fullName}
              </h1>
              <span 
                className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: "#fae8ff", color: "#ac6ab5" }}
              >
                {adminData.role}
              </span>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Full Name */}
              <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:shadow-md" style={{ backgroundColor: "#fdf4ff" }}>
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#b365be" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0891b2" }}>Full Name</p>
                  <p className="font-semibold" style={{ color: "#374151" }}>{adminData.fullName}</p>
                </div>
              </div>

              {/* Email Address */}
              <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:shadow-md" style={{ backgroundColor: "#fdf4ff" }}>
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#cd79d8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0891b2" }}>Email Address</p>
                  <p className="font-semibold" style={{ color: "#374151" }}>{adminData.email}</p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:shadow-md" style={{ backgroundColor: "#fdf4ff" }}>
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#d17bdd" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0891b2" }}>Phone Number</p>
                  <p className="font-semibold" style={{ color: "#374151" }}>{adminData.phone}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:shadow-md" style={{ backgroundColor: "#fdf4ff" }}>
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#c026d3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0891b2" }}>Role</p>
                  <p className="font-semibold" style={{ color: "#374151" }}>{adminData.role}</p>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:shadow-md" style={{ backgroundColor: "#fdf4ff" }}>
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#c026d3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0891b2" }}>Department</p>
                  <p className="font-semibold" style={{ color: "#374151" }}>{adminData.department}</p>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:shadow-md" style={{ backgroundColor: "#fdf4ff" }}>
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#ba6fc4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0891b2" }}>Join Date</p>
                  <p className="font-semibold" style={{ color: "#374151" }}>{adminData.joinDate}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:shadow-md" style={{ backgroundColor: "#fdf4ff" }}>
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#c269ce" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#0891b2" }}>Location</p>
                  <p className="font-semibold" style={{ color: "#374151" }}>{adminData.location}</p>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="flex justify-center mt-8">
              <button 
                className="px-6 py-2.5 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg"
                style={{ 
                  backgroundColor: "#bd74c7",
                  color: "white"
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for better hover effects */}
      <style jsx>{`
        .info-card:hover {
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}