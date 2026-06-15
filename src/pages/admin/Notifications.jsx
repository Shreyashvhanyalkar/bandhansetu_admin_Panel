// components/admin/NotificationManagement.jsx - Using simple filter APIs

import { useState, useEffect, useRef } from "react";
import {
  useAllUsers,
  useReligions,
  useSendNotification,
} from "../../hooks/useNotificationQueries";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#bd201c",
  primaryDark: "#601000",
  primaryLight: "#fef2f2",
  primaryBorder: "#fca5a5",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  white: "#ffffff",
  green50: "#f0fdf4",
  greenText: "#15803d",
  greenBorder: "#86efac",
};

// Common city names from your data
const COMMON_CITIES = [
  "Pune", "Mumbai", "Delhi", "Ahmedabad", "Bangalore", 
  "Hyderabad", "Chennai", "Jaipur", "Lucknow", "Kochi", 
  "Aurangabad", "Panaji", "Bengaluru", "Nashik"
];

function getInitials(firstName, lastName) {
  return `${(firstName || "U")[0]}${(lastName || "")[0] || ""}`.toUpperCase();
}

// ─── Toast Component ───────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className={`rounded-lg shadow-lg p-4 min-w-[300px] max-w-md ${
        toast.type === "success" ? "bg-green-50 border-l-4 border-green-500" : "bg-red-50 border-l-4 border-red-500"
      }`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className={`font-semibold ${toast.type === "success" ? "text-green-800" : "text-red-800"}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className="text-sm mt-1 text-gray-600">{toast.message}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Preview Component (Read-only for Group mode) ─────────────────────────
function UserPreview({ users, isLoading, filters }) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bd201c] mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Loading users...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p className="text-sm text-gray-500">No users found matching the selected filters</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#bd201c] text-white flex items-center justify-center text-sm font-bold">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {user.gender || "N/A"} • {user.cityName || "Unknown"} • {user.religionName || "N/A"}
            </p>
          </div>
          <div className="text-xs text-gray-400">
            {user.platformId || user.id?.slice(-6)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── User Select Component (For Personalize mode) ─────────────────────────────
function UserSelect({ selected, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const { data: usersData, isLoading, isFetching } = useAllUsers(search, 1, 50);
  const users = usersData?.users || usersData || [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedUsers = users.filter(u => selected.includes(u.id));

  const toggleUser = (userId) => {
    if (selected.includes(userId)) {
      onChange(selected.filter(id => id !== userId));
    } else {
      onChange([...selected, userId]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className={`border rounded-lg p-2 cursor-pointer bg-white min-h-[46px] flex flex-wrap gap-2 items-center transition-all ${
          error ? "border-red-300" : open ? "border-[#bd201c] ring-2 ring-[#fef2f2]" : "border-gray-200"
        }`}
      >
        {selectedUsers.length === 0 && (
          <span className="text-gray-400 text-sm">Search and select users...</span>
        )}
        {selectedUsers.map(user => (
          <span
            key={user.id}
            className="bg-[#fef2f2] text-[#bd201c] border border-[#fca5a5] rounded-md px-2 py-1 text-xs font-semibold flex items-center gap-1"
          >
            {user.firstName} {user.lastName}
            <button
              onClick={(e) => { e.stopPropagation(); toggleUser(user.id); }}
              className="ml-1 text-[#bd201c] hover:text-[#601000]"
            >
              ×
            </button>
          </span>
        ))}
        <svg className="ml-auto w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
        </svg>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#bd201c]"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-80">
            {isLoading || isFetching ? (
              <div className="p-4 text-center text-gray-500">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No users found</div>
            ) : (
              users.map(user => {
                const isSelected = selected.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      isSelected ? "bg-[#fef2f2]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? "bg-[#bd201c] border-[#bd201c]" : "border-gray-300"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#bd201c] text-white flex items-center justify-center text-xs font-bold">
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {user.gender || "N/A"} · {user.cityName || "Unknown"} · {user.religionName || "N/A"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {selected.length > 0 && (
            <div className="p-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="text-xs text-gray-600">{selected.length} user(s) selected</span>
              <button onClick={() => onChange([])} className="text-xs text-[#bd201c] hover:text-[#601000] font-semibold">
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Form Components ───────────────────────────────────────────────────────────
function InputField({ label, required, error, hint, suggestions, onSuggestionClick, ...props }) {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  return (
    <div className="relative mb-4">
      {label && (
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
          {label}{required && <span className="text-[#bd201c] ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${
          error ? "border-red-300" : focused ? "border-[#bd201c] ring-2 ring-[#fef2f2]" : "border-gray-200"
        }`}
        onFocus={() => {
          setFocused(true);
          if (suggestions && suggestions.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => {
          setFocused(false);
          setTimeout(() => setShowSuggestions(false), 200);
        }}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => {
                onSuggestionClick(suggestion);
                setShowSuggestions(false);
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm capitalize"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TextareaField({ label, hint, rows = 3, ...props }) {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
          {label}
        </label>
      )}
      <textarea
        {...props}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-lg outline-none transition-all resize-y ${
          focused ? "border-[#bd201c] ring-2 ring-[#fef2f2]" : "border-gray-200"
        }`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function SelectField({ label, options, value, onChange, placeholder = "Select option" }) {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg outline-none transition-all cursor-pointer ${
          focused ? "border-[#bd201c] ring-2 ring-[#fef2f2]" : "border-gray-200"
        }`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>
            {opt.religion_name || opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function TypeCard({ label, description, icon, selected, onClick }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex-1 text-left p-4 rounded-xl border-2 transition-all ${
        selected 
          ? "border-[#bd201c] bg-[#fef2f2]" 
          : hovered ? "border-gray-300 bg-white" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          selected ? "bg-[#bd201c]" : "bg-gray-100"
        }`}>
          <svg className={`w-5 h-5 ${selected ? "text-white" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <div className="flex-1">
          <p className={`text-sm font-bold ${selected ? "text-[#601000]" : "text-gray-800"}`}>{label}</p>
          <p className={`text-xs mt-1 ${selected ? "text-[#bd201c]" : "text-gray-400"}`}>{description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-[#bd201c] bg-[#bd201c]" : "border-gray-300"
        }`}>
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function NotificationManagement() {
  const [notificationType, setNotificationType] = useState("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [targetUserIds, setTargetUserIds] = useState([]);
  const [gender, setGender] = useState("");
  const [religionName, setReligionName] = useState("");
  const [cityName, setCityName] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [previewUsers, setPreviewUsers] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const { data: religionsData, isLoading: religionsLoading } = useReligions();
  const sendNotificationMutation = useSendNotification();

  const religions = Array.isArray(religionsData) ? religionsData : religionsData?.data || [];

  const genderOptions = [
    { id: "Male", name: "Male" },
    { id: "Female", name: "Female" },
  ];

  // Fetch users based on filters using the simple APIs
  const fetchPreviewUsers = async () => {
    if (notificationType !== "Admin Group") return;
    
    const hasFilters = gender || religionName || cityName;
    if (!hasFilters) {
      setPreviewUsers([]);
      return;
    }
    
    setIsLoadingPreview(true);
    
    try {
      let url = `${import.meta.env.VITE_BASE_URL}/api/auth/admin/users?`;
      const params = [];
      
      if (gender) params.push(`gender=${gender}`);
      if (religionName) params.push(`religion=${religionName}`);
      if (cityName) params.push(`city=${cityName}`);
      
      url += params.join('&');
      
      console.log("Fetching users from:", url);
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "x-app-type": "admin",
          "Accept-Language": "en",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const users = data.users || data || [];
        setPreviewUsers(users);
        console.log(`Found ${users.length} users`);
      } else {
        setPreviewUsers([]);
      }
    } catch (error) {
      console.error("Error fetching preview users:", error);
      setPreviewUsers([]);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Debounced filter change
  useEffect(() => {
    if (notificationType === "Admin Group") {
      const timer = setTimeout(() => {
        fetchPreviewUsers();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gender, religionName, cityName, notificationType]);

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCityName(value);
    
    if (value.length > 0) {
      const filtered = COMMON_CITIES.filter(city => 
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setCitySuggestions(filtered);
    } else {
      setCitySuggestions([]);
    }
  };

  const selectCity = (city) => {
    setCityName(city);
    setCitySuggestions([]);
  };

  const validate = () => {
    const newErrors = {};
    
    if (!notificationType) newErrors.notificationType = "Please select a notification type";
    if (!title.trim()) newErrors.title = "Title is required";
    if (!shortDescription.trim()) newErrors.shortDescription = "Short description is required";
    
    if (notificationType === "Admin Personalize" && targetUserIds.length === 0) {
      newErrors.targetUsers = "Please select at least one user";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    
    const payload = {
      title: title,
      shortDescription: shortDescription,
      notificationType: notificationType,
    };
    
    if (longDescription && longDescription.trim()) {
      payload.longDescription = longDescription;
    }
    
    if (notificationType === "Admin Personalize") {
      payload.targetUserIds = targetUserIds;
    } else if (notificationType === "Admin Group") {
      if (gender) payload.gender = gender;
      if (religionName) payload.religion = religionName;
      if (cityName && cityName.trim()) {
        payload.city = cityName.trim();
      }
    }
    
    console.log("Sending payload:", JSON.stringify(payload, null, 2));
    
    sendNotificationMutation.mutate(payload, {
      onSuccess: (data) => {
        let message = `✅ ${data.successfulPushes || data.totalAttempted || 0} users notified`;
        if (data.failedPushes > 0) {
          message += ` • ${data.failedPushes} failed`;
        }
        
        setToast({
          type: "success",
          title: "Notification Sent Successfully!",
          message: message,
        });
        
        setTitle("");
        setShortDescription("");
        setLongDescription("");
        setTargetUserIds([]);
        setGender("");
        setReligionName("");
        setCityName("");
        setPreviewUsers([]);
        setErrors({});
      },
      onError: (error) => {
        console.error("Send error:", error);
        
        let errorTitle = "Failed to Send Notification";
        let errorMessage = error.message;
        
        if (error.message === "No target users found.") {
          errorTitle = "No Users Found";
          errorMessage = "No users match the selected filters.\n\nSuggestions:\n• Make sure city name has correct capitalization (e.g., 'Pune' not 'pune')\n• Try removing some filters\n• Select different gender, religion, or city";
        }
        
        setToast({
          type: "error",
          title: errorTitle,
          message: errorMessage,
        });
      },
    });
  };

  const handleReset = () => {
    setTitle("");
    setShortDescription("");
    setLongDescription("");
    setTargetUserIds([]);
    setGender("");
    setReligionName("");
    setCityName("");
    setPreviewUsers([]);
    setErrors({});
  };

  if (religionsLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bd201c]"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Send Notification</h1>
          <p className="text-sm text-gray-500 mt-1">Compose and deliver push notifications to users</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#bd201c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h2 className="text-sm font-semibold text-gray-700">Notification Details</h2>
              </div>
            </div>

            <div className="p-6">
              {/* Notification Type */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                  Notification Type <span className="text-[#bd201c] ml-1">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TypeCard
                    label="Admin Personalize"
                    description="Send to specific users by ID"
                    selected={notificationType === "Admin Personalize"}
                    onClick={() => {
                      setNotificationType("Admin Personalize");
                      setPreviewUsers([]);
                    }}
                    icon={
                      <>
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </>
                    }
                  />
                  <TypeCard
                    label="Admin Group"
                    description="Broadcast to all users matching filters"
                    selected={notificationType === "Admin Group"}
                    onClick={() => {
                      setNotificationType("Admin Group");
                      setTargetUserIds([]);
                    }}
                    icon={
                      <>
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </>
                    }
                  />
                </div>
                {errors.notificationType && <p className="text-xs text-red-600 mt-2">{errors.notificationType}</p>}
              </div>

              {/* Content Section */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#bd201c] text-white flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Content</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <InputField
                  label="Title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={errors.title}
                  placeholder="e.g., Profile Incomplete"
                  maxLength={100}
                />
                <div className="text-right text-xs text-gray-400 -mt-3 mb-4">{title.length}/100</div>

                <InputField
                  label="Short Description"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  error={errors.shortDescription}
                  hint="Appears in the notification tray"
                  placeholder="Brief summary of your notification"
                  maxLength={160}
                />
                <div className="text-right text-xs text-gray-400 -mt-3 mb-4">{shortDescription.length}/160</div>

                <TextareaField
                  label="Long Description"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  hint="Full message when expanded (optional)"
                  placeholder="Detailed message content..."
                  rows={4}
                />
              </div>

              {/* Audience Section */}
              {notificationType && (
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full bg-[#bd201c] text-white flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      {notificationType === "Admin Personalize" ? "Select Recipients" : "Audience Filters"}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {notificationType === "Admin Personalize" && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Select Users <span className="text-[#bd201c] ml-1">*</span>
                      </label>
                      <UserSelect
                        selected={targetUserIds}
                        onChange={setTargetUserIds}
                        error={errors.targetUsers}
                      />
                      {errors.targetUsers && <p className="text-xs text-red-600 mt-1">{errors.targetUsers}</p>}
                      <p className="text-xs text-gray-400 mt-2">Search by name to find and select users</p>
                    </div>
                  )}

                  {notificationType === "Admin Group" && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-800">
                          ⚠️ All filters are optional. Leave all empty to send to ALL users.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <SelectField
                          label="Gender"
                          options={genderOptions}
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          placeholder="All Genders"
                        />

                        <SelectField
                          label="Religion"
                          options={religions.map(r => ({ id: r.religion_name, name: r.religion_name }))}
                          value={religionName}
                          onChange={(e) => setReligionName(e.target.value)}
                          placeholder="All Religions"
                        />

                        <InputField
                          label="City"
                          value={cityName}
                          onChange={handleCityChange}
                          onSuggestionClick={selectCity}
                          suggestions={citySuggestions}
                          placeholder="Enter city name (e.g., Pune, Mumbai)"
                          hint="Use exact capitalization - 'Pune' not 'pune'"
                        />
                      </div>
                    </>
                  )}

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">📨 Will be sent to:</span>{' '}
                      {notificationType === "Admin Personalize" 
                        ? `${targetUserIds.length} specific user(s)` 
                        : !gender && !religionName && !cityName 
                          ? "ALL users (Global Broadcast)"
                          : `${previewUsers.length} user(s) matching filters`}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleReset}
                  className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition"
                >
                  Reset Form
                </button>
                <button
                  onClick={handleSend}
                  disabled={sendNotificationMutation.isPending}
                  className="flex-1 px-5 py-2 rounded-lg bg-[#bd201c] hover:bg-[#601000] text-white font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendNotificationMutation.isPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - User Preview (Group Mode Only) */}
          {notificationType === "Admin Group" && (gender || religionName || cityName) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#bd201c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <h2 className="text-sm font-semibold text-gray-700">User Preview</h2>
                  <span className="ml-auto text-xs font-semibold text-[#bd201c] bg-[#fef2f2] px-2 py-1 rounded-full">
                    {previewUsers.length} users found
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {gender && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      Gender: {gender}
                    </span>
                  )}
                  {religionName && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      Religion: {religionName}
                    </span>
                  )}
                  {cityName && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                      City: {cityName}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mb-3">
                  These users will receive the notification
                </p>
                
                <UserPreview 
                  users={previewUsers}
                  isLoading={isLoadingPreview}
                  filters={{ gender, religionName, cityName }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}