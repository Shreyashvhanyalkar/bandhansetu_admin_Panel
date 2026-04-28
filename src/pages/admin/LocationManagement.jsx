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

const C = {
  primary: "#c026d3",
  primaryDark: "#a21caf",
  primaryLight: "#fdf4ff",
  primaryBorder: "#f0abfc",
  state: "#0891b2",
  stateBg: "#ecfeff",
  stateBorder: "#a5f3fc",
  city: "#059669",
  cityBg: "#ecfdf5",
  cityBorder: "#a7f3d0",
  danger: "#ef4444",
  textPrimary: "#1e1b2e",
  textSecondary: "#5b5266",
  textMuted: "#a19aa6",
  border: "#f1eef2",
};

const initials = (name = "") =>
  name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

// Reusable Components
function Spinner({ size = 16, color = C.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color }}>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function IconBtn({ onClick, disabled, danger, title, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40
        ${danger ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-fuchsia-700 hover:bg-fuchsia-50"}`}
    >
      {children}
    </button>
  );
}

function Avatar({ name, size = 36, bg = C.primary }) {
  return (
    <span
      className="rounded-xl flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}

function Badge({ children, variant = "default" }) {
  const variants = {
    primary: "bg-fuchsia-50 text-fuchsia-700",
    state: "bg-cyan-50 text-cyan-700",
    city: "bg-emerald-50 text-emerald-700",
  };
  return <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${variants[variant] || "bg-gray-100 text-gray-600"}`}>{children}</span>;
}

function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      className="transition-transform" style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const EditIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>;
const PlusIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>;

// Modal Component
function Modal({ isOpen, onClose, title, placeholder, existing, onSubmit, isPending, accent = C.primary }) {
  const [name, setName] = useState(existing?.name || "");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
        <div className="h-1 w-full" style={{ background: accent }} />
        <div className="p-6 space-y-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-fuchsia-500"
            autoFocus
          />
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-lg font-medium">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              className="flex-1 py-3 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-xl">
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-lg">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-3 text-white rounded-lg"
            style={{ background: C.danger }}
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== COUNTRY CARD (Fixed - Edit & Delete visible) ====================
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
    <div className="rounded-xl border bg-white overflow-hidden shadow-sm group" style={{ borderColor: expanded ? C.primaryBorder : C.border }}>
      <div 
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-fuchsia-50/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <ChevronIcon open={expanded} />
        <Avatar name={country.country_name} size={42} bg={C.primary} />
        <div className="flex-1">
          <span className="text-lg font-semibold">{country.country_name}</span>
        </div>
        <Badge variant="primary">Country</Badge>

        {/* Edit & Delete Buttons - Now always visible on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setShowAddState(true)} 
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-white"
            style={{ borderColor: C.primaryBorder, color: C.primary }}
          >
            <PlusIcon /> State
          </button>
          <IconBtn onClick={() => setShowEdit(true)} title="Edit Country"><EditIcon /></IconBtn>
          <IconBtn danger onClick={() => setShowDelete(true)} title="Delete Country"><TrashIcon /></IconBtn>
        </div>
      </div>

      {/* States List */}
      {expanded && (
        <div className="border-t px-5 py-4 space-y-3" style={{ background: C.stateBg }}>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading states...</p>
          ) : states.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No states added yet</p>
          ) : (
            states.map((state) => <StateRow key={state.id} state={state} />)
          )}
        </div>
      )}

      {/* Country Modals */}
      <Modal 
        isOpen={showEdit} 
        onClose={() => setShowEdit(false)} 
        title="Edit Country" 
        placeholder="Country Name" 
        existing={{ name: country.country_name }} 
        onSubmit={(name) => editMutation.mutate({ id: country.id, country_name: name })} 
        isPending={editMutation.isPending} 
      />

      <ConfirmDialog 
        isOpen={showDelete} 
        onClose={() => setShowDelete(false)} 
        onConfirm={() => deleteMutation.mutate(country.id)} 
        message={`Are you sure you want to delete "${country.country_name}"?`} 
        isPending={deleteMutation.isPending} 
      />

      <Modal 
        isOpen={showAddState} 
        onClose={() => setShowAddState(false)} 
        title="Add New State" 
        placeholder="State Name" 
        onSubmit={(name) => addStateMutation.mutate({ state_name: name, country_id: country.id })} 
        isPending={addStateMutation.isPending} 
      />
    </div>
  );
}

// StateRow and Main Component remain the same as previous version
// (I'm keeping them short here to focus on the fix)

function StateRow({ state }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddCity, setShowAddCity] = useState(false);
  const [editingCity, setEditingCity] = useState(null);

  const editMutation = useEditState();
  const deleteMutation = useDeleteState();
  const addCityMutation = useAddCity();
  const editCityMutation = useEditCity();
  const deleteCityMutation = useDeleteCity();

  const { data: cities = [], isLoading } = useGetCities(expanded ? state.id : null);

  const handleEditState = (state_name) => editMutation.mutate({ id: state.id, state_name });
  const handleDeleteState = () => deleteMutation.mutate(state.id);
  const handleAddCity = (city_name) => addCityMutation.mutate({ city_name, state_id: state.id });
  const handleEditCity = (city_name) => {
    if (editingCity) editCityMutation.mutate({ id: editingCity.id, city_name });
    setEditingCity(null);
  };

  return (
    <div className="rounded-lg border bg-white" style={{ borderColor: C.stateBorder }}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-cyan-50/50" onClick={() => setExpanded(!expanded)}>
        <ChevronIcon open={expanded} />
        <Avatar name={state.state_name} size={34} bg={C.state} />
        <span className="font-medium flex-1">{state.state_name}</span>
        <Badge variant="state">State</Badge>

        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setShowAddCity(true)} className="text-xs px-3 py-1 border rounded" style={{ color: C.state }}>+ City</button>
          <IconBtn onClick={() => setShowEdit(true)}><EditIcon /></IconBtn>
          <IconBtn danger onClick={() => setShowDelete(true)}><TrashIcon /></IconBtn>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4" style={{ background: C.cityBg }}>
          {isLoading ? <p>Loading cities...</p> : cities.map((city) => (
            <div key={city.id} className="flex items-center justify-between bg-white border rounded-lg px-4 py-3 mb-2" style={{ borderColor: C.cityBorder }}>
              <div className="flex items-center gap-3">
                <Avatar name={city.city_name} size={28} bg={C.city} />
                <span className="font-medium">{city.city_name}</span>
              </div>
              <div className="flex gap-1">
                <IconBtn onClick={() => setEditingCity(city)}><EditIcon /></IconBtn>
                <IconBtn danger onClick={() => deleteCityMutation.mutate(city.id)}><TrashIcon /></IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit State" placeholder="State Name" existing={{ name: state.state_name }} onSubmit={(name) => handleEditState(name)} isPending={editMutation.isPending} />
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDeleteState} message={`Delete "${state.state_name}"?`} isPending={deleteMutation.isPending} />
      <Modal isOpen={showAddCity} onClose={() => setShowAddCity(false)} title="Add New City" placeholder="City Name" onSubmit={(name) => handleAddCity(name)} isPending={addCityMutation.isPending} />
      <Modal isOpen={!!editingCity} onClose={() => setEditingCity(null)} title="Edit City" placeholder="City Name" existing={editingCity ? { name: editingCity.city_name } : null} onSubmit={(name) => handleEditCity(name)} isPending={editCityMutation.isPending} />
    </div>
  );
}

// Main Component
export default function LocationManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCountry, setShowAddCountry] = useState(false);

  const { data: countries = [], isLoading, isError, refetch } = useGetCountries();
  const addCountryMutation = useAddCountry();

  const filtered = countries.filter((c) => c.country_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: "#faf9fc" }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
          <p className="text-gray-500">Country → State → City Hierarchy</p>
        </div>
        <button onClick={() => setShowAddCountry(true)} className="px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-semibold flex items-center gap-2">+ Add Country</button>
      </div>

      <input
        type="text"
        placeholder="Search countries..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg focus:outline-none"
      />

      {isLoading ? <p>Loading...</p> : isError ? <p>Error loading data</p> : filtered.map((country) => <CountryCard key={country.id} country={country} />)}

      <Modal isOpen={showAddCountry} onClose={() => setShowAddCountry(false)} title="Add New Country" placeholder="Country Name" onSubmit={(name) => addCountryMutation.mutate({ country_name: name })} isPending={addCountryMutation.isPending} />
    </div>
  );
}