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
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-[Inter,sans-serif]">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/admin/dashboard" 
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:bg-white hover:shadow-sm"
          style={{ color: "#601000" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header with gradient */}
          <div 
            className="h-40 relative"
            style={{ 
              background: `linear-gradient(135deg, #601000 0%, #bd201c 100%)` 
            }}
          >
            {/* Subtle background pattern could go here */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-10">
            {/* Avatar - Centered */}
            <div className="flex justify-center -mt-20 mb-6">
              <div 
                className="relative w-36 h-36 rounded-full overflow-hidden border-[6px] shadow-xl"
                style={{ borderColor: "#ffffff" }}
              >
                <img
                  src={adminData.avatar}
                  alt={adminData.fullName}
                  className="w-full h-full object-cover"
                />
                {/* Edit Avatar Button */}
                <button 
                  className="absolute bottom-1 right-1 p-2.5 bg-white rounded-full shadow-lg hover:scale-110 transition-transform border border-gray-100"
                  style={{ color: "#bd201c" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Name and Role */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: "#111827" }}>
                {adminData.fullName}
              </h1>
              <span 
                className="inline-block px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase shadow-sm border"
                style={{ backgroundColor: "#fef2f2", color: "#bd201c", borderColor: "#fca5a5" }}
              >
                {adminData.role}
              </span>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              
              {/* Full Name */}
              <div className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#fca5a5] hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-[#fef2f2] transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-[#bd201c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Full Name</p>
                  <p className="font-bold text-gray-900 text-base">{adminData.fullName}</p>
                </div>
              </div>

              {/* Email Address */}
              <div className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#fca5a5] hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-[#fef2f2] transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-[#bd201c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</p>
                  <p className="font-bold text-gray-900 text-base">{adminData.email}</p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#fca5a5] hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-[#fef2f2] transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-[#bd201c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Phone Number</p>
                  <p className="font-bold text-gray-900 text-base">{adminData.phone}</p>
                </div>
              </div>

              {/* Role */}
              <div className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#fca5a5] hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-[#fef2f2] transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-[#bd201c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Role</p>
                  <p className="font-bold text-gray-900 text-base">{adminData.role}</p>
                </div>
              </div>

              {/* Department */}
              <div className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#fca5a5] hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-[#fef2f2] transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-[#bd201c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Department</p>
                  <p className="font-bold text-gray-900 text-base">{adminData.department}</p>
                </div>
              </div>

              {/* Join Date */}
              <div className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#fca5a5] hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-[#fef2f2] transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-[#bd201c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Join Date</p>
                  <p className="font-bold text-gray-900 text-base">{adminData.joinDate}</p>
                </div>
              </div>

              {/* Location */}
              <div className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#fca5a5] hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-[#fef2f2] transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-[#bd201c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Location</p>
                  <p className="font-bold text-gray-900 text-base">{adminData.location}</p>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="flex justify-center mt-10">
              <button 
                className="px-8 py-3.5 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                style={{ background: `linear-gradient(135deg, #601000 0%, #bd201c 100%)` }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}