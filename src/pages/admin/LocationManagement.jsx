// src/pages/admin/LocationManagement.jsx
import { useState, useEffect } from "react";
import {
  useGetCountries,
  useAddCountry,
  useEditCountry,
  useDeleteCountry,
  useGetStates,
  useAddState,
  useEditState,
  useDeleteState,
  useGetCities,
  useAddCity,
  useEditCity,
  useDeleteCity,
} from "../../hooks/useLocationManagement";

// ─── Design Tokens (Premium Burgundy & Hierarchy Colors) ──────────────────────
const C = {
  primary: "#bd201c",        // Red/Burgundy
  primaryDark: "#601000",    // Dark Burgundy
  primaryLight: "#fef2f2",   // Red light background
  primaryBorder: "#fca5a5",  // Red border
  
  state: "#0891b2",          // Cyan for States
  stateBg: "#ecfeff",
  stateBorder: "#a5f3fc",
  
  city: "#059669",           // Emerald for Cities
  cityBg: "#ecfdf5",
  cityBorder: "#a7f3d0",
  
  danger: "#dc2626",
  textPrimary: "#0f172a",    // Slate 900
  textSecondary: "#475569",  // Slate 600
  textMuted: "#94a3b8",      // Slate 400
  border: "#f1f5f9",         // Slate 100
  bg: "#f8fafc",             // Slate 50
};

// ─── SVGs & Icons ─────────────────────────────────────────────────────────────
const Icons = {
  Search: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
    </svg>
  ),
  Map: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  Building: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
};

// ─── Loading Spinner ──────────────────────────────────────────────────────────
function Spinner({ size = 16, color = C.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path fill="currentColor" opacity="0.9" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ─── Modal Dialog ─────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, placeholder, existing, onSubmit, isPending, accent = C.primary }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(existing?.name || "");
    }
  }, [isOpen, existing]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
    onClose();
  };

  const focusRing = accent === C.primary 
    ? "focus:border-[#bd201c] focus:ring-[#fef2f2]" 
    : accent === C.state 
    ? "focus:border-cyan-500 focus:ring-cyan-50" 
    : "focus:border-emerald-500 focus:ring-emerald-50";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-scale-in">
        <div className="h-1.5 w-full" style={{ background: accent }} />
        <div className="p-6 sm:p-7 space-y-5">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 transition-all text-xs font-semibold text-gray-800 ${focusRing}`}
            autoFocus
          />
          <div className="flex gap-2.5 pt-1.5">
            <button 
              onClick={onClose} 
              className="flex-1 py-2.5 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-250/30 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              className="flex-1 py-2.5 text-xs font-bold text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              style={{ background: accent }}
            >
              {isPending && <Spinner size={14} color="#fff" />}
              {isPending ? "Saving..." : existing ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────
function ConfirmDialog({ isOpen, onClose, onConfirm, message, isPending }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-scale-in">
        <div className="h-1.5 w-full bg-red-600" />
        <div className="p-6 sm:p-7 text-center">
          <div className="w-11 h-11 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3.5">
            <Icons.Trash />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1.5">Delete Confirmation</h3>
          <p className="text-xs text-gray-500 leading-normal mb-6 px-2">{message}</p>
          <div className="flex gap-2.5">
            <button 
              onClick={onClose} 
              className="flex-1 py-2.5 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-250/30 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex justify-center items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isPending ? <Spinner size={14} color="#fff" /> : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Column List Item (Premium Row Card) ──────────────────────────────────────
function ListItem({ label, active, onClick, onEdit, onDelete, themeColor, hasChevron }) {
  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center justify-between py-1.5 px-3 rounded-lg border transition-all duration-200 cursor-pointer ${
        active
          ? "bg-slate-50/70 border-slate-205 shadow-xs"
          : "bg-white border-slate-100 hover:border-slate-150 hover:bg-slate-50/20"
      }`}
      style={{
        borderLeft: active ? `3px solid ${themeColor}` : undefined,
        paddingLeft: active ? "10px" : undefined,
      }}
    >
      <div className="flex items-center min-w-0 flex-1">
        <span className={`text-base truncate ${active ? "font-bold text-gray-950" : "text-gray-600 font-semibold group-hover:text-gray-950 transition-colors"}`}>
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Actions panel - floats on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onEdit}
            title="Edit"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200/50 transition cursor-pointer bg-white/80 shadow-xs"
          >
            <Icons.Edit />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100/50 transition cursor-pointer bg-white/80 shadow-xs"
          >
            <Icons.Trash />
          </button>
        </div>

        {hasChevron && !active && (
          <svg className="w-3 h-3 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  );
}

// ─── Column Search Bar ────────────────────────────────────────────────────────
function ColumnSearch({ value, onChange, placeholder, disabled }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Icons.Search />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 rounded-xl outline-none transition-all disabled:opacity-50"
      />
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function LocationManagement() {
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");

  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  // Modals visibility state
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [deletingCountry, setDeletingCountry] = useState(null);

  const [showAddState, setShowAddState] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [deletingState, setDeletingState] = useState(null);

  const [showAddCity, setShowAddCity] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [deletingCity, setDeletingCity] = useState(null);

  // Load backend location query hooks
  const { data: countries = [], isLoading: countriesLoading, isError: countriesError, refetch: refetchCountries } = useGetCountries();
  const { data: states = [], isLoading: statesLoading } = useGetStates(selectedCountryId);
  const { data: cities = [], isLoading: citiesLoading } = useGetCities(selectedStateId);

  // Mutation hooks
  const addCountryMutation = useAddCountry();
  const editCountryMutation = useEditCountry();
  const deleteCountryMutation = useDeleteCountry();

  const addStateMutation = useAddState();
  const editStateMutation = useEditState();
  const deleteStateMutation = useDeleteState();

  const addCityMutation = useAddCity();
  const editCityMutation = useEditCity();
  const deleteCityMutation = useDeleteCity();

  // Reset active state when parent gets deselected or deleted
  useEffect(() => {
    if (selectedCountryId && countries.length > 0) {
      const exists = countries.some((c) => String(c.id) === String(selectedCountryId));
      if (!exists) {
        setSelectedCountryId("");
        setSelectedStateId("");
      }
    }
  }, [countries, selectedCountryId]);

  useEffect(() => {
    if (selectedStateId && states.length > 0) {
      const exists = states.some((s) => String(s.id) === String(selectedStateId));
      if (!exists) {
        setSelectedStateId("");
      }
    }
  }, [states, selectedStateId]);

  // Filters
  const filteredCountries = countries.filter((c) =>
    c.country_name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredStates = states.filter((s) =>
    s.state_name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredCities = cities.filter((c) =>
    c.city_name.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Retrieve current active names for headers/labels
  const activeCountry = countries.find((c) => String(c.id) === String(selectedCountryId));
  const activeState = states.find((s) => String(s.id) === String(selectedStateId));

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans p-4 sm:p-8">
      {/* Global CSS keyframes for loading and fades */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.15s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Location System</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage countries, states, and cities in a clean three-tier layout</p>
          </div>
        </div>

        {/* Hierarchy Stats Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Country Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#bd201c]">
              <Icons.Globe />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Country</p>
              <p className="text-sm sm:text-base font-extrabold text-gray-900 truncate mt-0.5">
                {activeCountry ? activeCountry.country_name : "Select Country"}
              </p>
            </div>
          </div>

          {/* State Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Icons.Map />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active State</p>
              <p className="text-sm sm:text-base font-extrabold text-gray-900 truncate mt-0.5">
                {activeState ? activeState.state_name : "Select State"}
              </p>
            </div>
          </div>

          {/* City Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Icons.Building />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Cities</p>
              <p className="text-sm sm:text-base font-extrabold text-gray-900 truncate mt-0.5">
                {activeState ? `${cities.length} Cities` : "Select State First"}
              </p>
            </div>
          </div>
        </div>

        {/* 3-Column Split View Board */}
        {countriesError ? (
          <div className="text-center py-12 bg-red-50/40 rounded-2xl border border-red-100 max-w-xl mx-auto">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-900 font-bold text-sm mt-2">Failed to load locations</p>
            <p className="text-red-600 text-xs mt-1">Please verify server configuration and connection.</p>
            <button 
              onClick={() => refetchCountries()} 
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Countries Column */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-[500px]">
              {/* Card Header */}
              <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Countries</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Global region level</p>
                </div>
                <button
                  onClick={() => setShowAddCountry(true)}
                  className="p-1.5 bg-[#bd201c] hover:bg-[#601000] text-white rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center cursor-pointer"
                  title="Add New Country"
                >
                  <Icons.Plus />
                </button>
              </div>

              {/* Toolbar */}
              <div className="p-2.5 bg-slate-50/40 border-b border-slate-100">
                <ColumnSearch 
                  value={countrySearch} 
                  onChange={setCountrySearch} 
                  placeholder="Search countries..." 
                />
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-none bg-white">
                {countriesLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 text-xs">
                    <Spinner size={20} color={C.primary} />
                    <span>Loading countries...</span>
                  </div>
                ) : filteredCountries.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-red-50/50 flex items-center justify-center text-[#bd201c] mb-3 border border-red-100/50">
                      <Icons.Globe />
                    </div>
                    <p className="text-xs font-bold text-slate-850">No Countries Found</p>
                    <p className="text-[10px] text-slate-450 mt-1">Click the "+" icon above to create one</p>
                  </div>
                ) : (
                  filteredCountries.map((c) => (
                    <ListItem
                      key={c.id}
                      label={c.country_name}
                      active={String(selectedCountryId) === String(c.id)}
                      themeColor={C.primary}
                      hasChevron={true}
                      onClick={() => {
                        setSelectedCountryId(c.id);
                        setSelectedStateId(""); // Reset state Selection
                        setStateSearch("");
                        setCitySearch("");
                      }}
                      onEdit={() => setEditingCountry(c)}
                      onDelete={() => setDeletingCountry(c)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 2. States Column */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-[500px]">
              {/* Card Header */}
              <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">States</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeCountry ? `Within ${activeCountry.country_name}` : "Region level 2"}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddState(true)}
                  disabled={!selectedCountryId}
                  className="p-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg transition-all shadow-sm disabled:shadow-none flex items-center justify-center cursor-pointer"
                  title={selectedCountryId ? "Add New State" : "Select a country first"}
                >
                  <Icons.Plus />
                </button>
              </div>

              {/* Toolbar */}
              <div className="p-2.5 bg-slate-50/40 border-b border-slate-100">
                <ColumnSearch 
                  value={stateSearch} 
                  onChange={setStateSearch} 
                  placeholder={selectedCountryId ? "Search states..." : "Select country first"}
                  disabled={!selectedCountryId}
                />
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-none bg-white">
                {!selectedCountryId ? (
                  <div className="flex flex-col justify-center items-center h-full text-center p-6 text-slate-400 animate-fade-in">
                    <div className="w-14 h-14 rounded-full bg-cyan-50/60 flex items-center justify-center text-cyan-600 mb-3.5 shadow-sm border border-cyan-100/50">
                      <Icons.Map />
                    </div>
                    <p className="text-xs font-bold text-slate-800">No Country Selected</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-normal">
                      Please select a country from the left column to view its states.
                    </p>
                  </div>
                ) : statesLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 text-xs">
                    <Spinner size={20} color={C.state} />
                    <span>Loading states...</span>
                  </div>
                ) : filteredStates.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-50/50 flex items-center justify-center text-cyan-600 mb-3 border border-cyan-100/50">
                      <Icons.Map />
                    </div>
                    <p className="text-xs font-bold text-slate-850">No States Found</p>
                    <p className="text-[10px] text-slate-450 mt-1">Click the "+" icon to add a new state</p>
                  </div>
                ) : (
                  filteredStates.map((s) => (
                    <ListItem
                      key={s.id}
                      label={s.state_name}
                      active={String(selectedStateId) === String(s.id)}
                      themeColor={C.state}
                      hasChevron={true}
                      onClick={() => {
                        setSelectedStateId(s.id);
                        setCitySearch("");
                      }}
                      onEdit={() => setEditingState(s)}
                      onDelete={() => setDeletingState(s)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 3. Cities Column */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-[500px]">
              {/* Card Header */}
              <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Cities</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeState ? `Within ${activeState.state_name}` : "Local level"}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCity(true)}
                  disabled={!selectedStateId}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg transition-all shadow-sm disabled:shadow-none flex items-center justify-center cursor-pointer"
                  title={selectedStateId ? "Add New City" : "Select a state first"}
                >
                  <Icons.Plus />
                </button>
              </div>

              {/* Toolbar */}
              <div className="p-2.5 bg-slate-50/40 border-b border-slate-100">
                <ColumnSearch 
                  value={citySearch} 
                  onChange={setCitySearch} 
                  placeholder={selectedStateId ? "Search cities..." : "Select state first"}
                  disabled={!selectedStateId}
                />
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-none bg-white">
                {!selectedStateId ? (
                  <div className="flex flex-col justify-center items-center h-full text-center p-6 text-slate-400 animate-fade-in">
                    <div className="w-14 h-14 rounded-full bg-emerald-50/60 flex items-center justify-center text-emerald-600 mb-3.5 shadow-sm border border-emerald-100/50">
                      <Icons.Building />
                    </div>
                    <p className="text-xs font-bold text-slate-800">No State Selected</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-normal">
                      Please select a state from the middle column to view its cities.
                    </p>
                  </div>
                ) : citiesLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 text-xs">
                    <Spinner size={20} color={C.city} />
                    <span>Loading cities...</span>
                  </div>
                ) : filteredCities.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50/50 flex items-center justify-center text-emerald-600 mb-3 border border-emerald-100/50">
                      <Icons.Building />
                    </div>
                    <p className="text-xs font-bold text-slate-850">No Cities Found</p>
                    <p className="text-[10px] text-slate-450 mt-1">Click the "+" icon to add a new city</p>
                  </div>
                ) : (
                  filteredCities.map((c) => (
                    <ListItem
                      key={c.id}
                      label={c.city_name}
                      active={false} // leaf nodes don't trigger sub-selection
                      themeColor={C.city}
                      hasChevron={false}
                      onClick={() => {}} // no-op on leaf click
                      onEdit={() => setEditingCity(c)}
                      onDelete={() => setDeletingCity(c)}
                    />
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ─── Modals and Dialogs ────────────────────────────────────────────────── */}

      {/* Country Modals */}
      <Modal
        isOpen={showAddCountry}
        onClose={() => setShowAddCountry(false)}
        title="Add Country"
        placeholder="e.g. India, United States"
        onSubmit={(name) => addCountryMutation.mutate({ country_name: name })}
        isPending={addCountryMutation.isPending}
        accent={C.primary}
      />
      <Modal
        isOpen={!!editingCountry}
        onClose={() => setEditingCountry(null)}
        title="Edit Country"
        placeholder="Country Name"
        existing={editingCountry ? { name: editingCountry.country_name } : null}
        onSubmit={(name) => {
          if (editingCountry) {
            editCountryMutation.mutate({ id: editingCountry.id, country_name: name });
          }
        }}
        isPending={editCountryMutation.isPending}
        accent={C.primary}
      />
      <ConfirmDialog
        isOpen={!!deletingCountry}
        onClose={() => setDeletingCountry(null)}
        onConfirm={() => {
          if (deletingCountry) {
            deleteCountryMutation.mutate(deletingCountry.id);
            setDeletingCountry(null);
          }
        }}
        message={`Are you sure you want to delete "${deletingCountry?.country_name}"? All associated states and cities will be permanently deleted.`}
        isPending={deleteCountryMutation.isPending}
      />

      {/* State Modals */}
      <Modal
        isOpen={showAddState}
        onClose={() => setShowAddState(false)}
        title={`Add State to ${activeCountry?.country_name}`}
        placeholder="e.g. Maharashtra, California"
        onSubmit={(name) => addStateMutation.mutate({ state_name: name, country_id: selectedCountryId })}
        isPending={addStateMutation.isPending}
        accent={C.state}
      />
      <Modal
        isOpen={!!editingState}
        onClose={() => setEditingState(null)}
        title="Edit State"
        placeholder="State Name"
        existing={editingState ? { name: editingState.state_name } : null}
        onSubmit={(name) => {
          if (editingState) {
            editStateMutation.mutate({ id: editingState.id, state_name: name });
          }
        }}
        isPending={editStateMutation.isPending}
        accent={C.state}
      />
      <ConfirmDialog
        isOpen={!!deletingState}
        onClose={() => setDeletingState(null)}
        onConfirm={() => {
          if (deletingState) {
            deleteStateMutation.mutate(deletingState.id);
            setDeletingState(null);
          }
        }}
        message={`Are you sure you want to delete "${deletingState?.state_name}"? All cities within this state will be permanently deleted.`}
        isPending={deleteStateMutation.isPending}
      />

      {/* City Modals */}
      <Modal
        isOpen={showAddCity}
        onClose={() => setShowAddCity(false)}
        title={`Add City to ${activeState?.state_name}`}
        placeholder="e.g. Pune, Mumbai, Los Angeles"
        onSubmit={(name) => addCityMutation.mutate({ city_name: name, state_id: selectedStateId })}
        isPending={addCityMutation.isPending}
        accent={C.city}
      />
      <Modal
        isOpen={!!editingCity}
        onClose={() => setEditingCity(null)}
        title="Edit City"
        placeholder="City Name"
        existing={editingCity ? { name: editingCity.city_name } : null}
        onSubmit={(name) => {
          if (editingCity) {
            editCityMutation.mutate({ id: editingCity.id, city_name: name });
          }
        }}
        isPending={editCityMutation.isPending}
        accent={C.city}
      />
      <ConfirmDialog
        isOpen={!!deletingCity}
        onClose={() => setDeletingCity(null)}
        onConfirm={() => {
          if (deletingCity) {
            deleteCityMutation.mutate(deletingCity.id);
            setDeletingCity(null);
          }
        }}
        message={`Are you sure you want to delete the city "${deletingCity?.city_name}"? This action cannot be undone.`}
        isPending={deleteCityMutation.isPending}
      />
    </div>
  );
}