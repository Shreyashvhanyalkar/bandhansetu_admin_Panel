// src/pages/admin/LocationManagement.jsx
import { useState } from "react";
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

// ─── Design Tokens (Updated to Burgundy/Red theme) ────────────────────────────
const C = {
  primary: "#bd201c",        // Red 600
  primaryDark: "#601000",    // Burgundy
  primaryLight: "#fef2f2",   // red-50
  primaryBorder: "#fca5a5",  // red-300
  state: "#0891b2",          // Keep cyan for states to distinguish hierarchy
  stateBg: "#ecfeff",        
  stateBorder: "#a5f3fc",    
  city: "#059669",           // Keep emerald for cities
  cityBg: "#ecfdf5",         
  cityBorder: "#a7f3d0",     
  danger: "#dc2626",         
  textPrimary: "#111827",    
  textSecondary: "#4b5563",  
  textMuted: "#9ca3af",      
  border: "#e5e7eb",         
  bg: "#f8fafc",             
};

const initials = (name = "") =>
  name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

// ─── SVGs ─────────────────────────────────────────────────────────────────────
const Icons = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>,
};

// ─── Shared Components ───────────────────────────────────────────────────────
function Spinner({ size = 16, color = C.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path fill="currentColor" opacity="0.9" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function IconBtn({ onClick, disabled, danger, title, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shadow-sm border
        ${danger ? "border-red-100 text-red-500 bg-white hover:bg-red-50 hover:border-red-200" : "border-gray-100 text-gray-500 bg-white hover:text-[#bd201c] hover:bg-[#fef2f2] hover:border-[#fca5a5]"}`}
    >
      {children}
    </button>
  );
}

function Avatar({ name, size = 36, bg = C.primary, src }) {
  if (src) {
    return <img src={src} alt={name} className="rounded-xl object-cover shrink-0 shadow-sm" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm"
      style={{ width: size, height: size, background: bg === C.primary ? `linear-gradient(135deg, ${bg}, ${C.primaryDark})` : bg, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}

function Badge({ children, variant = "country" }) {
  const map = {
    country: "bg-[#fef2f2] text-[#bd201c] border border-[#fca5a5]",
    state: "bg-cyan-50 text-cyan-700 border border-cyan-200",
    city: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${map[variant] || "bg-gray-100 text-gray-600 border border-gray-200"}`}>
      {children}
    </span>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      className={`transition-transform duration-300 text-gray-400 shrink-0 ${open ? "rotate-90" : "rotate-0"}`}>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

// ─── Modals ───────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, placeholder, existing, onSubmit, isPending, accent = C.primary }) {
  const [name, setName] = useState(existing?.name || "");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
    onClose();
  };

  const gradient = accent === C.primary ? `linear-gradient(90deg, ${accent}, ${C.primaryDark})` : `linear-gradient(90deg, ${accent}, ${accent}dd)`;
  const focusRing = accent === C.primary ? "focus:border-[#bd201c] focus:ring-[#fef2f2]" : accent === C.state ? "focus:border-cyan-500 focus:ring-cyan-50" : "focus:border-emerald-500 focus:ring-emerald-50";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        <div className="h-1.5 w-full" style={{ background: gradient }} />
        <div className="p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={placeholder}
            className={`w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 transition-all text-gray-800 font-medium ${focusRing}`}
            autoFocus
          />
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              className="flex-1 py-3 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
              style={{ background: accent }}
            >
              {isPending && <Spinner size={16} color="#fff" />}
              {isPending ? "Saving..." : existing ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ isOpen, onClose, onConfirm, message, isPending }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        <div className="h-1.5 w-full bg-red-600" />
        <div className="p-6 sm:p-8">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
            <TrashIcon />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Item</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">{message}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-md"
            >
              {isPending ? <Spinner size={16} color="#fff" /> : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── State Row (Middle Node) & City Row (Leaf Node) ───────────────────────────

function StateRow({ state }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddCity, setShowAddCity] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [deletingCity, setDeletingCity] = useState(null);

  const editMutation = useEditState();
  const deleteMutation = useDeleteState();
  const addCityMutation = useAddCity();
  const editCityMutation = useEditCity();
  const deleteCityMutation = useDeleteCity();

  const { data: cities = [], isLoading } = useGetCities(expanded ? state.id : null);

  return (
    <div className={`rounded-xl border bg-white overflow-hidden shadow-sm transition-all duration-300 ${expanded ? "border-cyan-300 ring-2 ring-cyan-50" : "border-gray-200 hover:border-gray-300"} group/state`}>
      <div className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${expanded ? 'bg-cyan-50/20' : 'hover:bg-slate-50'}`} onClick={() => setExpanded(!expanded)}>
        <ChevronIcon open={expanded} />
        <Avatar name={state.state_name} size={38} bg={C.state} />
        <span className={`text-base font-bold flex-1 transition-colors ${expanded || 'group-hover/state:text-cyan-700'}`}>{state.state_name}</span>
        
        <div className="hidden sm:block">
          <Badge variant="state">State</Badge>
        </div>

        <div className={`flex gap-2 transition-opacity`} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setShowAddCity(true)} className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-gray-200 rounded-xl bg-white text-gray-700 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm">
            <PlusIcon /> Add City
          </button>
          <button onClick={() => setShowAddCity(true)} className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-emerald-100 text-emerald-600 bg-emerald-50">
            <PlusIcon />
          </button>
          <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block self-center" />
          <IconBtn onClick={() => setShowEdit(true)} title="Edit State"><EditIcon /></IconBtn>
          <IconBtn danger onClick={() => setShowDelete(true)} title="Delete State"><TrashIcon /></IconBtn>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-slate-50/50">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-gray-500 text-sm font-medium">
              <Spinner size={16} color={C.city} /> Loading cities...
            </div>
          ) : cities.length === 0 ? (
             <div className="text-center py-6 bg-white border border-dashed border-gray-200 rounded-xl">
               <p className="text-gray-500 text-sm font-medium">No cities added yet.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cities.map((city) => (
                <div key={city.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:border-emerald-300 transition-colors group/city">
                  <div className="flex items-center gap-3">
                    <Avatar name={city.city_name} size={30} bg={C.city} />
                    <span className="text-sm font-semibold text-gray-800">{city.city_name}</span>
                  </div>
                  <div className="flex gap-2 transition-opacity">
                    <IconBtn onClick={() => setEditingCity(city)}><EditIcon /></IconBtn>
                    <IconBtn danger onClick={() => setDeletingCity(city)}><TrashIcon /></IconBtn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals for State/City */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit State" placeholder="State Name" existing={{ name: state.state_name }} onSubmit={(name) => editMutation.mutate({ id: state.id, state_name: name })} isPending={editMutation.isPending} accent={C.state} />
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => deleteMutation.mutate(state.id)} message={`Are you sure you want to delete "${state.state_name}"?`} isPending={deleteMutation.isPending} />
      <Modal isOpen={showAddCity} onClose={() => setShowAddCity(false)} title="Add New City" placeholder="City Name" onSubmit={(name) => addCityMutation.mutate({ city_name: name, state_id: state.id }, { onSuccess: () => setShowAddCity(false) })} isPending={addCityMutation.isPending} accent={C.city} />
      <Modal isOpen={!!editingCity} onClose={() => setEditingCity(null)} title="Edit City" placeholder="City Name" existing={editingCity ? { name: editingCity.city_name } : null} onSubmit={(name) => { if (editingCity) editCityMutation.mutate({ id: editingCity.id, city_name: name }); setEditingCity(null); }} isPending={editCityMutation.isPending} accent={C.city} />
      <ConfirmDialog isOpen={!!deletingCity} onClose={() => setDeletingCity(null)} onConfirm={() => { if (deletingCity) deleteCityMutation.mutate(deletingCity.id); setDeletingCity(null); }} message={`Delete "${deletingCity?.city_name}"?`} isPending={deleteCityMutation.isPending} />
    </div>
  );
}

// ─── Country Card (expandable) ──────────────────────────────────────────────────
function CountryCard({ country }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddState, setShowAddState] = useState(false);

  const editMutation = useEditCountry();
  const deleteMutation = useDeleteCountry();
  const addStateMutation = useAddState();

  const { data: states = [], isLoading } = useGetStates(expanded ? country.id : null);

  return (
    <div className={`rounded-2xl border bg-white overflow-hidden shadow-sm transition-all duration-300 ${expanded ? "border-[#fca5a5] ring-2 ring-[#fef2f2]" : "border-gray-200 hover:border-gray-300 hover:shadow-md"}`}>
      
      {/* Country Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-4 px-6 py-5 cursor-pointer transition-colors ${expanded ? 'bg-slate-50/50' : 'hover:bg-slate-50'} group`}
      >
        <ChevronIcon open={expanded} />
        <Avatar name={country.country_name} size={48} bg={C.primary} />
        
        <div className="flex-1">
          <span className={`text-lg font-bold transition-colors ${expanded || 'group-hover:text-[#bd201c]'} text-gray-900`}>
            {country.country_name}
          </span>
        </div>
        
        <div className="hidden sm:block">
          <Badge variant="country">Country</Badge>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex gap-2 transition-opacity`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowAddState(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-gray-200 rounded-xl bg-white text-gray-700 hover:text-cyan-600 hover:border-cyan-300 hover:bg-cyan-50 transition-all shadow-sm"
          >
            <PlusIcon /> Add State
          </button>
          <button onClick={() => setShowAddState(true)} className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-cyan-100 text-cyan-600 bg-cyan-50">
            <PlusIcon />
          </button>

          <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block self-center" />
          <IconBtn onClick={() => setShowEdit(true)} title="Edit Country"><EditIcon /></IconBtn>
          <IconBtn danger onClick={() => setShowDelete(true)} title="Delete Country"><TrashIcon /></IconBtn>
        </div>
      </div>

      {/* States List */}
      {expanded && (
        <div className="border-t border-gray-100 p-6 bg-slate-50/50">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-sm font-medium">
              <Spinner size={16} color={C.state} /> Loading states...
            </div>
          ) : states.length === 0 ? (
            <div className="text-center py-8 bg-white border border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 text-sm font-medium">No states added yet.</p>
              <button onClick={() => setShowAddState(true)} className="mt-2 text-sm text-cyan-600 font-bold hover:underline">
                + Add a State
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {states.map((state) => <StateRow key={state.id} state={state} />)}
            </div>
          )}
        </div>
      )}

      {/* Country Modals */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Country" placeholder="Country Name" existing={{ name: country.country_name }} onSubmit={(name) => editMutation.mutate({ id: country.id, country_name: name })} isPending={editMutation.isPending} accent={C.primary} />
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => deleteMutation.mutate(country.id)} message={`Are you sure you want to delete "${country.country_name}"? All associated states and cities will be permanently removed.`} isPending={deleteMutation.isPending} />
      <Modal isOpen={showAddState} onClose={() => setShowAddState(false)} title="Add New State" placeholder="State Name" onSubmit={(name) => addStateMutation.mutate({ state_name: name, country_id: country.id }, { onSuccess: () => setShowAddState(false) })} isPending={addStateMutation.isPending} accent={C.state} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LocationManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCountry, setShowAddCountry] = useState(false);

  const { data: countries = [], isLoading, isError, refetch } = useGetCountries();
  const addCountryMutation = useAddCountry();

  const filtered = countries.filter((c) =>
    c.country_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,sans-serif] p-4 sm:p-8">
      {/* Global CSS for animations */}
      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scaleIn { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Location Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage the global Country → State → City hierarchy</p>
          </div>
          <button
            onClick={() => setShowAddCountry(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#601000] to-[#bd201c] hover:from-[#4a0c00] hover:to-[#9C0425] text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <PlusIcon /> Add Country
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#bd201c] transition-colors">
              <Icons.Search />
            </span>
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-[#fca5a5] focus:ring-4 focus:ring-[#fef2f2]"
            />
          </div>

          {/* Stats Badge */}
          {!isLoading && !isError && countries.length > 0 && (
            <div className="shrink-0 flex items-center gap-2 border-l border-gray-200 pl-4 hidden sm:flex">
              <div className="px-4 py-2 bg-[#fef2f2] text-[#bd201c] rounded-xl text-xs font-bold border border-[#fca5a5]">
                Total: {countries.length}
              </div>
              {searchTerm && (
                <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold border border-gray-200">
                  Matches: {filtered.length}
                </div>
              )}
            </div>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                 <div className="flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="h-6 w-48 bg-gray-200 rounded" />
                 </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200 shadow-sm">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-800 font-bold text-lg mb-1">Failed to load locations</p>
            <p className="text-red-600 text-sm mb-4">Please check your connection and try again.</p>
            <button onClick={() => refetch()} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md transition">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🌍</div>
            <p className="text-gray-900 font-bold text-lg">
              {searchTerm ? `No countries matching "${searchTerm}"` : "No countries yet"}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm ? "Try adjusting your search keyword." : "Click 'Add Country' to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((country) => (
              <CountryCard key={country.id} country={country} />
            ))}
          </div>
        )}
      </div>

      {/* Add Country Modal */}
      <Modal
        isOpen={showAddCountry}
        onClose={() => setShowAddCountry(false)}
        title="Add Country"
        placeholder="e.g. India, United States"
        onSubmit={(name) => addCountryMutation.mutate({ country_name: name }, { onSuccess: () => setShowAddCountry(false) })}
        isPending={addCountryMutation.isPending}
        accent={C.primary}
      />
    </div>
  );
}