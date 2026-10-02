// src/pages/admin/ReligionManagement.jsx
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useGetReligions,
  useAddReligion,
  useEditReligion,
  useDeleteReligion,
  useGetCastes,
  useAddCaste,
  useEditCaste,
  useDeleteCaste,
  useGetSubcasts,
  useAddSubcast,
  useEditSubcast,
  useDeleteSubcast,
} from "../../hooks/useReligionCast";

// ─── Design Tokens (Premium Burgundy & Hierarchy Colors) ──────────────────────
const C = {
  primary: "#bd201c",        // Red/Burgundy
  primaryDark: "#601000",    // Dark Burgundy
  primaryLight: "#fef2f2",   // Red light background
  primaryBorder: "#fca5a5",  // Red border

  caste: "#0891b2",          // Cyan for Castes
  casteBg: "#ecfeff",
  casteBorder: "#a5f3fc",

  sub: "#059669",            // Emerald for Sub-castes
  subBg: "#ecfdf5",
  subBorder: "#a7f3d0",

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
  BookOpen: () => (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  UserGroup: () => (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
    : accent === C.caste
      ? "focus:border-cyan-500 focus:ring-cyan-50"
      : "focus:border-emerald-500 focus:ring-emerald-50";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
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

// ─── Column List Item ──────────────────────────────────────────────────────────
function ListItem({ label, active, onClick, onEdit, onDelete, themeColor, hasChevron }) {
  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center justify-between py-1.5 px-3 rounded-lg border transition-all duration-200 cursor-pointer ${active
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
export default function ReligionManagement() {
  const [selectedReligionId, setSelectedReligionId] = useState("");
  const [selectedCasteId, setSelectedCasteId] = useState("");

  const [religionSearch, setReligionSearch] = useState("");
  const [casteSearch, setCasteSearch] = useState("");
  const [subcasteSearch, setSubcasteSearch] = useState("");

  // Modals visibility state
  const [showAddReligion, setShowAddReligion] = useState(false);
  const [editingReligion, setEditingReligion] = useState(null);
  const [deletingReligion, setDeletingReligion] = useState(null);

  const [showAddCaste, setShowAddCaste] = useState(false);
  const [editingCaste, setEditingCaste] = useState(null);
  const [deletingCaste, setDeletingCaste] = useState(null);

  const [showAddSubcast, setShowAddSubcast] = useState(false);
  const [editingSubcast, setEditingSubcast] = useState(null);
  const [deletingSubcast, setDeletingSubcast] = useState(null);

  // Load backend query hooks
  const { data: religions = [], isLoading: religionsLoading, isError: religionsError, refetch: refetchReligions } = useGetReligions();
  const { data: castes = [], isLoading: castesLoading } = useGetCastes(selectedReligionId);
  const { data: subcasts = [], isLoading: subcastsLoading } = useGetSubcasts(selectedCasteId);

  // Mutation hooks
  const addReligionMutation = useAddReligion();
  const editReligionMutation = useEditReligion();
  const deleteReligionMutation = useDeleteReligion();

  const addCasteMutation = useAddCaste(selectedReligionId);
  const editCasteMutation = useEditCaste(selectedReligionId);
  const deleteCasteMutation = useDeleteCaste(selectedReligionId);

  const addSubcastMutation = useAddSubcast(selectedCasteId);
  const editSubcastMutation = useEditSubcast(selectedCasteId);
  const deleteSubcastMutation = useDeleteSubcast(selectedCasteId);

  // Reset active state when parent gets deselected or deleted
  useEffect(() => {
    if (selectedReligionId && religions.length > 0) {
      const exists = religions.some((r) => String(r.id) === String(selectedReligionId));
      if (!exists) {
        setSelectedReligionId("");
        setSelectedCasteId("");
      }
    }
  }, [religions, selectedReligionId]);

  useEffect(() => {
    if (selectedCasteId && castes.length > 0) {
      const exists = castes.some((c) => String(c.id) === String(selectedCasteId));
      if (!exists) {
        setSelectedCasteId("");
      }
    }
  }, [castes, selectedCasteId]);

  // Filters
  const filteredReligions = religions.filter((r) =>
    (r.religion_name ?? "").toLowerCase().includes(religionSearch.toLowerCase())
  );

  const filteredCastes = castes.filter((c) =>
    c.caste_name.toLowerCase().includes(casteSearch.toLowerCase())
  );

  const filteredSubcasts = subcasts.filter((s) =>
    s.subcaste_name.toLowerCase().includes(subcasteSearch.toLowerCase())
  );

  // Retrieve current active names for headers/labels
  const activeReligion = religions.find((r) => String(r.id) === String(selectedReligionId));
  const activeCaste = castes.find((c) => String(c.id) === String(selectedCasteId));

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
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Religion & Community</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage Religion → Caste → Sub-caste hierarchy</p>
          </div>
        </div>

        {/* Hierarchy Stats Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Religion Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#bd201c]">
              <Icons.BookOpen />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Religion</p>
              <p className="text-sm sm:text-base font-extrabold text-gray-900 truncate mt-0.5">
                {activeReligion ? activeReligion.religion_name : "Select Religion"}
              </p>
            </div>
          </div>

          {/* Caste Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Icons.Users />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Caste</p>
              <p className="text-sm sm:text-base font-extrabold text-gray-900 truncate mt-0.5">
                {activeCaste ? activeCaste.caste_name : "Select Caste"}
              </p>
            </div>
          </div>

          {/* Sub-caste Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Icons.UserGroup />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Sub-castes</p>
              <p className="text-sm sm:text-base font-extrabold text-gray-900 truncate mt-0.5">
                {activeCaste ? `${subcasts.length} Sub-castes` : "Select Caste First"}
              </p>
            </div>
          </div>
        </div>

        {/* 3-Column Split View Board */}
        {religionsError ? (
          <div className="text-center py-12 bg-red-50/40 rounded-2xl border border-red-100 max-w-xl mx-auto">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-900 font-bold text-sm mt-2">Failed to load religions</p>
            <p className="text-red-600 text-xs mt-1">Please verify server configuration and connection.</p>
            <button
              onClick={() => refetchReligions()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* 1. Religions Column */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-[500px]">
              {/* Card Header */}
              <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Religions</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Community level</p>
                </div>
                <button
                  onClick={() => setShowAddReligion(true)}
                  className="p-1.5 bg-[#bd201c] hover:bg-[#601000] text-white rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center cursor-pointer"
                  title="Add New Religion"
                >
                  <Icons.Plus />
                </button>
              </div>

              {/* Toolbar */}
              <div className="p-2.5 bg-slate-50/40 border-b border-slate-100">
                <ColumnSearch
                  value={religionSearch}
                  onChange={setReligionSearch}
                  placeholder="Search religions..."
                />
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-none bg-white">
                {religionsLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 text-xs">
                    <Spinner size={20} color={C.primary} />
                    <span>Loading religions...</span>
                  </div>
                ) : filteredReligions.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-red-50/50 flex items-center justify-center text-[#bd201c] mb-3 border border-red-100/50">
                      <Icons.BookOpen />
                    </div>
                    <p className="text-xs font-bold text-slate-850">No Religions Found</p>
                    <p className="text-[10px] text-slate-450 mt-1">Click the "+" icon above to create one</p>
                  </div>
                ) : (
                  filteredReligions.map((r) => (
                    <ListItem
                      key={r.id}
                      label={r.religion_name}
                      active={String(selectedReligionId) === String(r.id)}
                      themeColor={C.primary}
                      hasChevron={true}
                      onClick={() => {
                        setSelectedReligionId(r.id);
                        setSelectedCasteId(""); // Reset caste selection
                        setCasteSearch("");
                        setSubcasteSearch("");
                      }}
                      onEdit={() => setEditingReligion(r)}
                      onDelete={() => setDeletingReligion(r)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 2. Castes Column */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-[500px]">
              {/* Card Header */}
              <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Castes</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeReligion ? `Within ${activeReligion.religion_name}` : "Region level 2"}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCaste(true)}
                  disabled={!selectedReligionId}
                  className="p-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg transition-all shadow-sm disabled:shadow-none flex items-center justify-center cursor-pointer"
                  title={selectedReligionId ? "Add New Caste" : "Select a religion first"}
                >
                  <Icons.Plus />
                </button>
              </div>

              {/* Toolbar */}
              <div className="p-2.5 bg-slate-50/40 border-b border-slate-100">
                <ColumnSearch
                  value={casteSearch}
                  onChange={setCasteSearch}
                  placeholder={selectedReligionId ? "Search castes..." : "Select religion first"}
                  disabled={!selectedReligionId}
                />
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-none bg-white">
                {!selectedReligionId ? (
                  <div className="flex flex-col justify-center items-center h-full text-center p-6 text-slate-400 animate-fade-in">
                    <div className="w-14 h-14 rounded-full bg-cyan-50/60 flex items-center justify-center text-cyan-600 mb-3.5 shadow-sm border border-cyan-100/50">
                      <Icons.Users />
                    </div>
                    <p className="text-xs font-bold text-slate-800">No Religion Selected</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-normal">
                      Please select a religion from the left column to view its castes.
                    </p>
                  </div>
                ) : castesLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 text-xs">
                    <Spinner size={20} color={C.caste} />
                    <span>Loading castes...</span>
                  </div>
                ) : filteredCastes.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-50/50 flex items-center justify-center text-cyan-600 mb-3 border border-cyan-100/50">
                      <Icons.Users />
                    </div>
                    <p className="text-xs font-bold text-slate-850">No Castes Found</p>
                    <p className="text-[10px] text-slate-450 mt-1">Click the "+" icon to add a new caste</p>
                  </div>
                ) : (
                  filteredCastes.map((c) => (
                    <ListItem
                      key={c.id}
                      label={c.caste_name}
                      active={String(selectedCasteId) === String(c.id)}
                      themeColor={C.caste}
                      hasChevron={true}
                      onClick={() => {
                        setSelectedCasteId(c.id);
                        setSubcasteSearch("");
                      }}
                      onEdit={() => setEditingCaste(c)}
                      onDelete={() => setDeletingCaste(c)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 3. Sub-castes Column */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-[500px]">
              {/* Card Header */}
              <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sub-castes</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeCaste ? `Within ${activeCaste.caste_name}` : "Local level"}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSubcast(true)}
                  disabled={!selectedCasteId}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg transition-all shadow-sm disabled:shadow-none flex items-center justify-center cursor-pointer"
                  title={selectedCasteId ? "Add New Sub-caste" : "Select a caste first"}
                >
                  <Icons.Plus />
                </button>
              </div>

              {/* Toolbar */}
              <div className="p-2.5 bg-slate-50/40 border-b border-slate-100">
                <ColumnSearch
                  value={subcasteSearch}
                  onChange={setSubcasteSearch}
                  placeholder={selectedCasteId ? "Search sub-castes..." : "Select caste first"}
                  disabled={!selectedCasteId}
                />
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-none bg-white">
                {!selectedCasteId ? (
                  <div className="flex flex-col justify-center items-center h-full text-center p-6 text-slate-400 animate-fade-in">
                    <div className="w-14 h-14 rounded-full bg-emerald-50/60 flex items-center justify-center text-emerald-600 mb-3.5 shadow-sm border border-emerald-100/50">
                      <Icons.UserGroup />
                    </div>
                    <p className="text-xs font-bold text-slate-800">No Caste Selected</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-normal">
                      Please select a caste from the middle column to view its sub-castes.
                    </p>
                  </div>
                ) : subcastsLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 text-xs">
                    <Spinner size={20} color={C.sub} />
                    <span>Loading sub-castes...</span>
                  </div>
                ) : filteredSubcasts.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50/50 flex items-center justify-center text-emerald-600 mb-3 border border-emerald-100/50">
                      <Icons.UserGroup />
                    </div>
                    <p className="text-xs font-bold text-slate-850">No Sub-castes Found</p>
                    <p className="text-[10px] text-slate-450 mt-1">Click the "+" icon to add a new sub-caste</p>
                  </div>
                ) : (
                  filteredSubcasts.map((s) => (
                    <ListItem
                      key={s.id}
                      label={s.subcaste_name}
                      active={false} // leaf nodes don't trigger sub-selection
                      themeColor={C.sub}
                      hasChevron={false}
                      onClick={() => { }} // no-op on leaf click
                      onEdit={() => setEditingSubcast(s)}
                      onDelete={() => setDeletingSubcast(s)}
                    />
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ─── Modals and Dialogs ────────────────────────────────────────────────── */}

      {/* Religion Modals */}
      <Modal
        isOpen={showAddReligion}
        onClose={() => setShowAddReligion(false)}
        title="Add Religion"
        placeholder="e.g. Hinduism, Islam, Christianity"
        onSubmit={(name) => addReligionMutation.mutate({ id: uuidv4().replace(/-/g, ""), religion_name: name })}
        isPending={addReligionMutation.isPending}
        accent={C.primary}
      />
      <Modal
        isOpen={!!editingReligion}
        onClose={() => setEditingReligion(null)}
        title="Edit Religion"
        placeholder="Religion Name"
        existing={editingReligion ? { name: editingReligion.religion_name } : null}
        onSubmit={(name) => {
          if (editingReligion) {
            editReligionMutation.mutate({ id: editingReligion.id, religion_name: name });
          }
        }}
        isPending={editReligionMutation.isPending}
        accent={C.primary}
      />
      <ConfirmDialog
        isOpen={!!deletingReligion}
        onClose={() => setDeletingReligion(null)}
        onConfirm={() => {
          if (deletingReligion) {
            deleteReligionMutation.mutate(deletingReligion.id);
            setDeletingReligion(null);
          }
        }}
        message={`Are you sure you want to delete "${deletingReligion?.religion_name}"? All associated castes and sub-castes will be permanently deleted.`}
        isPending={deleteReligionMutation.isPending}
      />

      {/* Caste Modals */}
      <Modal
        isOpen={showAddCaste}
        onClose={() => setShowAddCaste(false)}
        title={`Add Caste to ${activeReligion?.religion_name}`}
        placeholder="e.g. Brahmin, Rajput"
        onSubmit={(name) => addCasteMutation.mutate({ id: uuidv4().replace(/-/g, ""), caste_name: name, religion_id: selectedReligionId })}
        isPending={addCasteMutation.isPending}
        accent={C.caste}
      />
      <Modal
        isOpen={!!editingCaste}
        onClose={() => setEditingCaste(null)}
        title="Edit Caste"
        placeholder="Caste Name"
        existing={editingCaste ? { name: editingCaste.caste_name } : null}
        onSubmit={(name) => {
          if (editingCaste) {
            editCasteMutation.mutate({ id: editingCaste.id, caste_name: name, religion_id: selectedReligionId });
          }
        }}
        isPending={editCasteMutation.isPending}
        accent={C.caste}
      />
      <ConfirmDialog
        isOpen={!!deletingCaste}
        onClose={() => setDeletingCaste(null)}
        onConfirm={() => {
          if (deletingCaste) {
            deleteCasteMutation.mutate({ id: deletingCaste.id });
            setDeletingCaste(null);
          }
        }}
        message={`Are you sure you want to delete "${deletingCaste?.caste_name}"? All sub-castes within this caste will be permanently deleted.`}
        isPending={deleteCasteMutation.isPending}
      />

      {/* Sub-caste Modals */}
      <Modal
        isOpen={showAddSubcast}
        onClose={() => setShowAddSubcast(false)}
        title={`Add Sub-caste to ${activeCaste?.caste_name}`}
        placeholder="e.g. Deshastha, Kokanastha"
        onSubmit={(name) => addSubcastMutation.mutate({ id: uuidv4().replace(/-/g, ""), subcaste_name: name, caste_id: selectedCasteId })}
        isPending={addSubcastMutation.isPending}
        accent={C.sub}
      />
      <Modal
        isOpen={!!editingSubcast}
        onClose={() => setEditingSubcast(null)}
        title="Edit Sub-caste"
        placeholder="Sub-caste Name"
        existing={editingSubcast ? { name: editingSubcast.subcaste_name } : null}
        onSubmit={(name) => {
          if (editingSubcast) {
            editSubcastMutation.mutate({ id: editingSubcast.id, subcaste_name: name });
          }
        }}
        isPending={editSubcastMutation.isPending}
        accent={C.sub}
      />
      <ConfirmDialog
        isOpen={!!deletingSubcast}
        onClose={() => setDeletingSubcast(null)}
        onConfirm={() => {
          if (deletingSubcast) {
            deleteSubcastMutation.mutate(deletingSubcast.id);
            setDeletingSubcast(null);
          }
        }}
        message={`Are you sure you want to delete the sub-caste "${deletingSubcast?.subcaste_name}"? This action cannot be undone.`}
        isPending={deleteSubcastMutation.isPending}
      />
    </div>
  );
}