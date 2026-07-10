// components/admin/NotificationManagement.jsx
import { useState, useEffect, useRef, useCallback,useMemo  } from "react";
import { useInView } from "react-intersection-observer";
import { useLocation } from "react-router-dom";
import {
  useAllUsers,
  useAllUsersInfinite,
  useReligions,
  useSendNotification,
  useUploadBanner,
} from "../../hooks/useNotificationQueries";
import {
  useGetCountries,
  useGetStates,
  useGetCities,
} from "../../hooks/useLocationManagement";

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

// ─── User Select Component with Infinite Scroll ─────────────────────────────
function UserSelect({ selected, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const scrollContainerRef = useRef(null);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  });

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useAllUsersInfinite(search, 20);

const allUsers = useMemo(
    () => data?.pages?.flatMap(page => page.users) || [],
    [data]
  );  const totalLoaded = allUsers.length;

 

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [search, open, refetch]);

  const toggleUser = (userId) => {
    if (selected.includes(userId)) {
      onChange(selected.filter(id => id !== userId));
    } else {
      onChange([...selected, userId]);
    }
  };

  const selectedUserObjects = allUsers.filter(u => selected.includes(u.id));

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => {
          setOpen(!open);
          if (!open) {
            refetch();
          }
        }}
        className={`border rounded-lg p-1.5 cursor-pointer bg-white min-h-[38px] flex flex-wrap gap-1.5 items-center transition-all ${
          error ? "border-red-300 bg-red-50/10" : open ? "border-[#bd201c] ring-2 ring-[#fef2f2]" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {selectedUserObjects.length === 0 && (
          <span className="text-gray-400 text-sm pl-1">
            {isLoading ? "Loading users..." : "Search and select users..."}
          </span>
        )}
        {selectedUserObjects.slice(0, 3).map(user => (
          <span
            key={user.id}
            className="bg-[#fef2f2] text-[#bd201c] border border-[#fca5a5] rounded px-2 py-0.5 text-xs font-semibold flex items-center gap-1 hover:bg-[#fee2e2] transition-colors"
          >
            {user.firstName} {user.lastName}
            <button
              onClick={(e) => { e.stopPropagation(); toggleUser(user.id); }}
              className="ml-0.5 text-[#bd201c] hover:text-[#601000] font-bold text-sm"
            >
              ×
            </button>
          </span>
        ))}
        {selectedUserObjects.length > 3 && (
          <span className="text-xs text-gray-500 font-semibold">
            +{selectedUserObjects.length - 3} more
          </span>
        )}
        <svg className="ml-auto w-3.5 h-3.5 text-gray-400 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
        </svg>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
          <div className="p-1.5 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#bd201c] focus:ring-1 focus:ring-[#fef2f2] bg-white"
              autoFocus
            />
            {search && (
              <div className="text-xs text-gray-400 mt-0.5">
                {isLoading ? "Searching..." : `${totalLoaded} users found`}
              </div>
            )}
          </div>
          
          <div 
            ref={scrollContainerRef}
            className="overflow-y-auto max-h-48"
          >
            {isLoading ? (
              <div className="p-3 text-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#bd201c] mx-auto mb-2"></div>
                Loading users...
              </div>
            ) : allUsers.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-400">
                {search ? "No users found matching your search" : "No users available"}
              </div>
            ) : (
              <>
                {allUsers.map(user => {
                  const isSelected = selected.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      className={`flex items-center gap-2.5 p-2 cursor-pointer transition-colors ${
                        isSelected ? "bg-[#fef2f2]" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-[#bd201c] border-[#bd201c]" : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#bd201c] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-450 truncate">
                          {user.gender || "N/A"} · {user.cityName || "Unknown"} · {user.religionName || "N/A"}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                <div ref={loadMoreRef} className="p-2 text-center">
                  {isFetchingNextPage ? (
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#bd201c]"></div>
                      <span className="text-xs">Loading more...</span>
                    </div>
                  ) : hasNextPage ? (
                    <span className="text-xs text-gray-400">Scroll for more</span>
                  ) : totalLoaded > 0 && (
                    <span className="text-xs text-gray-400">— All {totalLoaded} users loaded —</span>
                  )}
                </div>
              </>
            )}
          </div>
          
          {selected.length > 0 && (
            <div className="p-1.5 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0 sticky bottom-0">
              <span className="text-xs text-gray-500 font-semibold">{selected.length} selected</span>
              <button onClick={() => onChange([])} className="text-xs text-[#bd201c] hover:text-[#601000] font-bold">
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Banner Image Upload Component ─────────────────────────────────────────────
function BannerImageUpload({ bannerImage, onImageChange, onImageRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_SIZE_MB = 5;

  const processFile = (file) => {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert("Only JPG, PNG, WEBP, or GIF images are allowed.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange({
        file,
        preview: reader.result,
        base64: reader.result,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    processFile(e.target.files[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  if (bannerImage) {
    return (
      <div className="mb-4">
        <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
          <img
            src={bannerImage.preview}
            alt="Banner preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Replace
            </button>
            <button
              type="button"
              onClick={onImageRemove}
              className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
            {bannerImage.name} · {bannerImage.size}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all flex items-center gap-4 ${
          isDragging
            ? "border-[#bd201c] bg-[#fef2f2]"
            : "border-gray-200 hover:border-[#bd201c] hover:bg-[#fef2f2]"
        }`}
      >
        <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
          isDragging ? "bg-[#bd201c]" : "bg-gray-100"
        }`}>
          <svg className={`w-5 h-5 ${isDragging ? "text-white" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-700">
            {isDragging ? "Drop image here" : "Click to upload or drag & drop"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP, GIF · Max 5MB · Recommended 1200×400px</p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}

// ─── User Preview Component ────────────────────────────────────────────────────
function UserPreview({ users, isLoading, filters }) {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#bd201c] mx-auto"></div>
        <p className="text-sm text-gray-500 mt-1">Loading users...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <svg className="w-8 h-8 text-gray-400 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p className="text-sm font-semibold text-gray-700">No matching users found</p>
        <p className="text-xs text-gray-450 mt-0.5">Adjust filters to find recipients</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-all hover:shadow-xs"
        >
          <div className="w-8 h-8 rounded-full bg-[#bd201c] text-white flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.gender || "N/A"} · {user.cityName || "Unknown"} · {user.religionName || "N/A"}
            </p>
          </div>
          <div className="text-xs text-gray-450 font-mono shrink-0">
            {user.platformId || user.id?.slice(-6)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Form Components ───────────────────────────────────────────────────────────
function InputField({ label, required, error, hint, suggestions, onSuggestionClick, ...props }) {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  return (
    <div className="relative mb-3">
      {label && (
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
          {label}{required && <span className="text-[#bd201c] ml-0.5">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-3 py-1.5 text-sm border rounded-lg outline-none transition-all ${
          error ? "border-red-300 bg-red-50/10" : focused ? "border-[#bd201c] ring-2 ring-[#fef2f2]" : "border-gray-200 hover:border-gray-300"
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => {
                onSuggestionClick(suggestion);
                setShowSuggestions(false);
              }}
              className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-sm capitalize"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TextareaField({ label, hint, rows = 2, ...props }) {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="mb-3">
      {label && (
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <textarea
        {...props}
        rows={rows}
        className={`w-full px-3 py-1.5 text-sm border rounded-lg outline-none transition-all resize-none ${
          focused ? "border-[#bd201c] ring-2 ring-[#fef2f2]" : "border-gray-200 hover:border-gray-300"
        }`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function SelectField({ label, options, value, onChange, placeholder = "Select option", disabled = false }) {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="mb-3">
      {label && (
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-1.5 text-sm border rounded-lg outline-none transition-all cursor-pointer bg-white ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${
          focused ? "border-[#bd201c] ring-2 ring-[#fef2f2]" : "border-gray-200 hover:border-gray-300"
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
      className={`flex-1 text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
        selected 
          ? "border-[#bd201c] bg-[#fef2f2]" 
          : hovered ? "border-gray-300 bg-white" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
          selected ? "bg-[#bd201c]" : "bg-gray-100"
        }`}>
          <svg className={`w-4 h-4 ${selected ? "text-white" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold leading-tight ${selected ? "text-[#601000]" : "text-gray-800"}`}>{label}</p>
          <p className={`text-xs mt-0.5 truncate ${selected ? "text-[#bd201c]" : "text-gray-400"}`}>{description}</p>
        </div>
        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
          selected ? "border-[#bd201c] bg-[#bd201c]" : "border-gray-300"
        }`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function NotificationManagement() {
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount - CRITICAL for navigation
  useEffect(() => {
    isMounted.current = true;
    abortControllerRef.current = new AbortController();

    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear all timeouts
      if (window.__fetchTimer) {
        clearTimeout(window.__fetchTimer);
        window.__fetchTimer = null;
      }
      // Clear all intervals
      if (window.__notificationInterval) {
        clearInterval(window.__notificationInterval);
        window.__notificationInterval = null;
      }
    };
  }, []);
  const location = useLocation();
  const [notificationType, setNotificationType] = useState("Admin Personalize");
  const [filterType, setFilterType] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [targetUserIds, setTargetUserIds] = useState([]);
  const [gender, setGender] = useState("");
  const [religionName, setReligionName] = useState("");
  const [cityName, setCityName] = useState("");
  const [previewUsers, setPreviewUsers] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  const [bannerImage, setBannerImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const { data: religionsData, isLoading: religionsLoading } = useReligions();
  const { data: countries = [], isLoading: countriesLoading } = useGetCountries();
  const { data: states = [], isLoading: statesLoading } = useGetStates(selectedCountryId);
  const { data: cities = [], isLoading: citiesLoading } = useGetCities(selectedStateId);
  const sendNotificationMutation = useSendNotification();
  const uploadBannerMutation = useUploadBanner();

  const religions = Array.isArray(religionsData) ? religionsData : religionsData?.data || [];

  const genderOptions = [
    { id: "Male", name: "Male" },
    { id: "Female", name: "Female" },
  ];

  // ✅ FIX: Cleanup on unmount - This fixes the navigation issue
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    return () => {
      isMounted = false;
      abortController.abort();
      // Clear any pending timeouts
      if (window.__fetchTimer) {
        clearTimeout(window.__fetchTimer);
        window.__fetchTimer = null;
      }
    };
  }, []);

  const fetchPreviewUsers = async () => {
    if (notificationType !== "Admin Group") return;
    
    const hasFilters = gender || religionName || cityName;
    if (!hasFilters) {
      setPreviewUsers([]);
      return;
    }
    
    setIsLoadingPreview(true);
    
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      params.set("offset", "0");
      
      if (gender) params.set("gender", gender);
      if (religionName) params.set("religion", religionName);
      if (cityName) params.set("city", cityName);
      
      const url = `${import.meta.env.VITE_BASE_URL}/api/auth/admin/users?${params.toString()}`;
      
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
        let users = [];
        
        if (Array.isArray(data)) {
          users = data;
        } else if (data.users || data.data) {
          users = data.users || data.data || [];
        }
        
        setPreviewUsers(users);
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

  // Debounced filter change with cleanup
  useEffect(() => {
    if (notificationType === "Admin Group") {
      const timer = setTimeout(() => {
        fetchPreviewUsers();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gender, religionName, cityName, notificationType]);

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
    
    try {
      let uploadedFileName = null;
      if (bannerImage && bannerImage.file) {
        const uploadResponse = await uploadBannerMutation.mutateAsync(bannerImage.file);
        if (uploadResponse && uploadResponse.length > 0 && uploadResponse[0].fileName) {
          uploadedFileName = uploadResponse[0].fileName;
        } else {
          throw new Error("Invalid response from upload banner server.");
        }
      }

      const payload = {
        title: title,
        shortDescription: shortDescription,
        notificationType: notificationType,
        notificationCategory: uploadedFileName ? "Image" : "Text",
      };
      
      if (uploadedFileName) {
        payload.imageName = uploadedFileName;
      }
      
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
          setFilterType("");
          setSelectedCountryId("");
          setSelectedStateId("");
          setGender("");
          setReligionName("");
          setCityName("");
          setPreviewUsers([]);
          setBannerImage(null);
          setErrors({});
        },
        onError: (error) => {
          console.error("Send error:", error);
          
          let errorTitle = "Failed to Send Notification";
          let errorMessage = error.message;
          
          if (error.message === "No target users found.") {
            errorTitle = "No Users Found";
            errorMessage = "No users match the selected filters.";
          }
          
          setToast({
            type: "error",
            title: errorTitle,
            message: errorMessage,
          });
        },
      });
    } catch (error) {
      console.error("Upload banner error:", error);
      setToast({
        type: "error",
        title: "Banner Upload Failed",
        message: error.message || "Failed to upload the banner image to the server.",
      });
    }
  };

  const handleReset = () => {
    setTitle("");
    setShortDescription("");
    setLongDescription("");
    setTargetUserIds([]);
    setFilterType("");
    setSelectedCountryId("");
    setSelectedStateId("");
    setGender("");
    setReligionName("");
    setCityName("");
    setPreviewUsers([]);
    setBannerImage(null);
    setErrors({});
  };

  if (religionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bd201c] mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200/60">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-white" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">Send Notification</h1>
            <p className="text-xs text-gray-500 mt-0.5">Compose and deliver push notifications to users</p>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm space-y-4">
            
            {/* Step 1: Delivery Mode */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded-full bg-[#bd201c]/10 text-[#bd201c] flex items-center justify-center text-sm font-bold">1</span>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Delivery Mode</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TypeCard
                  label="Admin Personalize"
                  description="Target specific users by ID"
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
                  description="Broadcast matching filters"
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
              {errors.notificationType && <p className="text-xs text-red-600 mt-1">{errors.notificationType}</p>}
            </div>

            {/* Step 2: Content Details */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded-full bg-[#bd201c]/10 text-[#bd201c] flex items-center justify-center text-sm font-bold">2</span>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Notification Content</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <InputField
                    label="Title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={errors.title}
                    placeholder="e.g., Profile Verification Successful"
                    maxLength={100}
                  />
                  <div className="text-right text-xs text-gray-400 -mt-2.5">{title.length}/100</div>
                </div>

                <div>
                  <InputField
                    label="Short Description"
                    required
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    error={errors.shortDescription}
                    hint="Displays inside the user's notification tray"
                    placeholder="Brief summary of your notification"
                    maxLength={160}
                  />
                  <div className="text-right text-xs text-gray-400 -mt-2.5">{shortDescription.length}/160</div>
                </div>

                <TextareaField
                  label="Long Description"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  hint="Detailed message showing upon expansion (optional)"
                  placeholder="Detailed notification content..."
                  rows={2}
                />

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Banner Image <span className="text-gray-400 font-normal normal-case">(optional)</span>
                  </label>
                  <BannerImageUpload
                    bannerImage={bannerImage}
                    onImageChange={setBannerImage}
                    onImageRemove={() => setBannerImage(null)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm space-y-4">
            
            {/* Step 3: Targeting Controls */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded-full bg-[#bd201c]/10 text-[#bd201c] flex items-center justify-center text-sm font-bold">3</span>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  {notificationType === "Admin Personalize" ? "Select Recipients" : "Audience Filters"}
                </h3>
              </div>

              {notificationType === "Admin Personalize" ? (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Recipients <span className="text-[#bd201c] ml-0.5">*</span>
                  </label>
                  <UserSelect
                    selected={targetUserIds}
                    onChange={setTargetUserIds}
                    error={errors.targetUsers}
                  />
                  {errors.targetUsers && <p className="text-xs text-red-600 mt-1">{errors.targetUsers}</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Select Filter Criteria
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl border border-gray-200/40">
                      {[
                        { id: "", label: "All Users" },
                        { id: "gender", label: "Gender" },
                        { id: "religion", label: "Religion" },
                        { id: "city", label: "City" },
                      ].map((item) => {
                        const isSelected = filterType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setFilterType(item.id);
                              setGender("");
                              setReligionName("");
                              setCityName("");
                              setSelectedCountryId("");
                              setSelectedStateId("");
                              setPreviewUsers([]);
                            }}
                            className={`py-1 px-1.5 text-xs font-bold rounded-lg cursor-pointer text-center transition-all ${
                              isSelected
                                ? "bg-white text-[#bd201c] shadow-xs"
                                : "text-gray-500 hover:text-gray-800"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {filterType === "" && (
                    <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2.5 text-center">
                      <p className="text-xs text-blue-800 leading-normal font-medium">
                        📣 Global Broadcast: No filters selected. This notification will be sent to <strong>ALL</strong> users.
                      </p>
                    </div>
                  )}

                  {filterType === "gender" && (
                    <div className="animate-slide-in">
                      <SelectField
                        label="Target Gender"
                        options={genderOptions}
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        placeholder="Select Gender..."
                      />
                    </div>
                  )}

                  {filterType === "religion" && (
                    <div className="animate-slide-in">
                      <SelectField
                        label="Target Religion"
                        options={religions.map(r => ({ id: r.religion_name, name: r.religion_name }))}
                        value={religionName}
                        onChange={(e) => setReligionName(e.target.value)}
                        placeholder="Select Religion..."
                      />
                    </div>
                  )}

                  {filterType === "city" && (
                    <div className="animate-slide-in grid grid-cols-3 gap-2">
                      <SelectField
                        label="Country"
                        options={countries.map((c) => ({ id: c.id, name: c.country_name }))}
                        value={selectedCountryId}
                        onChange={(e) => {
                          setSelectedCountryId(e.target.value);
                          setSelectedStateId("");
                          setCityName("");
                          setPreviewUsers([]);
                        }}
                        placeholder={countriesLoading ? "Loading Countries..." : "Select Country..."}
                      />
                      <SelectField
                        label="State"
                        options={states.map((s) => ({ id: s.id, name: s.state_name }))}
                        value={selectedStateId}
                        onChange={(e) => {
                          setSelectedStateId(e.target.value);
                          setCityName("");
                          setPreviewUsers([]);
                        }}
                        placeholder={
                          !selectedCountryId
                            ? "Select country first"
                            : statesLoading
                            ? "Loading States..."
                            : "Select State..."
                        }
                        disabled={!selectedCountryId}
                      />
                      <SelectField
                        label="City"
                        options={cities.map((c) => ({ id: c.city_name, name: c.city_name }))}
                        value={cityName}
                        onChange={(e) => {
                          setCityName(e.target.value);
                        }}
                        placeholder={
                          !selectedStateId
                            ? "Select state first"
                            : citiesLoading
                            ? "Loading Cities..."
                            : "Select City..."
                        }
                        disabled={!selectedStateId}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Audience Size */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wider mb-0.5">Estimated Audience Size</span>
                <span className="text-sm sm:text-base font-extrabold text-gray-800">
                  {notificationType === "Admin Personalize" 
                    ? `${targetUserIds.length} recipient(s)` 
                    : !gender && !religionName && !cityName 
                      ? "ALL Users (Global Broadcast)"
                      : `${previewUsers.length} matching recipient(s)`}
                </span>
              </p>
            </div>

            {/* User Preview */}
            {notificationType === "Admin Group" && (gender || religionName || cityName) && (
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Matching Users Preview</span>
                  <span className="text-xs font-semibold text-[#bd201c] bg-[#fef2f2] px-2 py-0.5 rounded-full">
                    {previewUsers.length} found
                  </span>
                </div>
                <div className="p-2 bg-white">
                  <UserPreview 
                    users={previewUsers}
                    isLoading={isLoadingPreview}
                    filters={{ gender, religionName, cityName }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-gray-100">
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-400 transition cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={handleSend}
                disabled={sendNotificationMutation.isPending || uploadBannerMutation.isPending}
                className="flex-2 py-2 rounded-lg bg-[#bd201c] hover:bg-[#601000] text-white font-bold text-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {sendNotificationMutation.isPending || uploadBannerMutation.isPending ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" opacity="0.2" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                    {uploadBannerMutation.isPending ? "Uploading..." : "Sending..."}
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <line x1="22" y1="2" x2="11" y2="13" strokeWidth={2} />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth={2} />
                    </svg>
                    Send Push
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}