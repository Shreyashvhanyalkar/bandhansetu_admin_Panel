// pages/admin/ReligionManagement.jsx
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useGetReligions, useAddReligion, useEditReligion, useDeleteReligion,
  useGetCastes, useAddCaste, useEditCaste, useDeleteCaste,
  useGetSubcasts, useAddSubcast, useEditSubcast, useDeleteSubcast,
} from "../../hooks/useReligionCast";

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Generic Name Modal ───────────────────────────────────────────────────────
function NameModal({ isOpen, onClose, title, subtitle, label, placeholder, existing, fieldKey, onSubmit, isPending }) {
  const [name, setName] = useState(existing?.[fieldKey] ?? "");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim(), () => { setName(""); onClose(); });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-scale-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-100 flex items-center justify-center text-lg">
              {existing ? "✏️" : "➕"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label} *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={placeholder}
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <><Spinner /> Saving...</> : existing ? `Update ${label}` : `Add ${label}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Subcast Item ─────────────────────────────────────────────────────────────
function SubcastItem({ subcast, casteId }) {
  const [showEdit, setShowEdit] = useState(false);
  const editMutation = useEditSubcast(casteId);
  const deleteMutation = useDeleteSubcast(casteId);

  const handleDelete = () => {
    if (!window.confirm(`Delete sub-caste "${subcast.subcaste_name}"?`)) return;
    deleteMutation.mutate(subcast.id, { onError: (err) => alert(err.message) });
  };

  return (
    <div className="flex items-center justify-between py-2 pl-4 border-l-2 border-purple-100 ml-4">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-300 shrink-0" />
        <span className="text-sm text-gray-600">{subcast.subcaste_name}</span>
        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700">Active</span>
      </div>
      <div className="flex gap-1">
        <button onClick={() => setShowEdit(true)} className="p-1 text-gray-400 hover:text-fuchsia-600 transition text-xs" title="Edit">✏️</button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="p-1 text-gray-400 hover:text-red-600 transition disabled:opacity-50 text-xs"
          title="Delete"
        >
          {deleteMutation.isPending ? <Spinner className="w-3 h-3" /> : "🗑️"}
        </button>
      </div>

      <NameModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Sub-Caste"
        label="Sub-Caste Name"
        placeholder="e.g., Deshastha, Karhade"
        existing={subcast}
        fieldKey="subcaste_name"
        isPending={editMutation.isPending}
        onSubmit={(subcaste_name, done) =>
          editMutation.mutate(
            { id: subcast.id, subcaste_name },
            { onSuccess: done, onError: (err) => alert(err.message) }
          )
        }
      />
    </div>
  );
}

// ─── Caste Item (with subcasts accordion) ────────────────────────────────────
function CasteItem({ caste, religionId }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddSubcast, setShowAddSubcast] = useState(false);

  const editMutation = useEditCaste(religionId);
  const deleteMutation = useDeleteCaste(religionId);
  const addSubcastMutation = useAddSubcast(caste.id);

  const { data: subcasts = [], isLoading: subcastsLoading } = useGetSubcasts(
    expanded ? caste.id : null
  );

  const handleDelete = () => {
    if (!window.confirm(`Delete caste "${caste.caste_name}"?`)) return;
    deleteMutation.mutate({ id: caste.id }, { onError: (err) => alert(err.message) });
  };

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-2">
      {/* Caste header row */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50/60 hover:bg-gray-50 transition cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📿</span>
          <span className="font-medium text-gray-800 text-sm">{caste.caste_name}</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700">Active</span>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowAddSubcast(true)}
            className="px-2 py-1 text-xs rounded-lg bg-fuchsia-50 text-fuchsia-600 hover:bg-fuchsia-100 transition font-medium"
          >
            + Sub-Caste
          </button>
          <button onClick={() => setShowEdit(true)} className="p-1.5 text-gray-400 hover:text-fuchsia-600 transition text-xs">✏️</button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-1.5 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
          >
            {deleteMutation.isPending ? <Spinner className="w-3 h-3" /> : "🗑️"}
          </button>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Subcasts list */}
      {expanded && (
        <div className="px-4 py-3 bg-white space-y-1">
          {subcastsLoading ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
              <Spinner className="w-3 h-3" /> Loading sub-castes...
            </div>
          ) : subcasts.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">
              No sub-castes yet. Click "+ Sub-Caste" to add one.
            </p>
          ) : (
            subcasts.map((sc) => (
              <SubcastItem key={sc.id} subcast={sc} casteId={caste.id} />
            ))
          )}
        </div>
      )}

      {/* Edit Caste Modal */}
      <NameModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Caste"
        label="Caste Name"
        placeholder="e.g., Brahmin, Rajput"
        existing={caste}
        fieldKey="caste_name"
        isPending={editMutation.isPending}
        onSubmit={(caste_name, done) =>
          editMutation.mutate(
            { id: caste.id, caste_name, religion_id: religionId },
            { onSuccess: done, onError: (err) => alert(err.message) }
          )
        }
      />

      {/* Add Subcast Modal */}
      <NameModal
        isOpen={showAddSubcast}
        onClose={() => setShowAddSubcast(false)}
        title="Add Sub-Caste"
        subtitle={caste.caste_name}
        label="Sub-Caste Name"
        placeholder="e.g., Deshastha, Karhade"
        existing={null}
        fieldKey="subcaste_name"
        isPending={addSubcastMutation.isPending}
        onSubmit={(subcaste_name, done) =>
          addSubcastMutation.mutate(
            { id: uuidv4().replace(/-/g, ""), subcaste_name, caste_id: caste.id },
            { onSuccess: done, onError: (err) => alert(err.message) }
          )
        }
      />
    </div>
  );
}

// ─── Religion Accordion ───────────────────────────────────────────────────────
function ReligionAccordion({ religion }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddCaste, setShowAddCaste] = useState(false);

  const editMutation = useEditReligion();
  const deleteMutation = useDeleteReligion();
  const addCasteMutation = useAddCaste(religion.id);

  const { data: castes = [], isLoading: castesLoading } = useGetCastes(
    expanded ? religion.id : null
  );

  const handleDelete = () => {
    if (!window.confirm(`Delete religion "${religion.religion_name}"?`)) return;
    deleteMutation.mutate(religion.id, { onError: (err) => alert(err.message) });
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Religion header row */}
      <div
        className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">🕉️</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-lg">{religion.religion_name}</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700">Active</span>
            {expanded && castes.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-fuchsia-100 text-fuchsia-600">
                {castes.length} caste{castes.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowAddCaste(true)}
            className="px-3 py-1.5 text-sm rounded-xl bg-fuchsia-50 text-fuchsia-600 hover:bg-fuchsia-100 transition font-medium"
          >
            + Add Caste
          </button>
          <button onClick={() => setShowEdit(true)} className="p-2 text-gray-400 hover:text-fuchsia-600 transition">✏️</button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
          >
            {deleteMutation.isPending ? <Spinner className="w-4 h-4" /> : "🗑️"}
          </button>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Castes list */}
      {expanded && (
        <div className="px-5 pb-5">
          {castesLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
              <Spinner /> Loading castes...
            </div>
          ) : castes.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No castes added yet. Click "+ Add Caste" to create one.
            </div>
          ) : (
            castes.map((caste) => (
              <CasteItem key={caste.id} caste={caste} religionId={religion.id} />
            ))
          )}
        </div>
      )}

      {/* Edit Religion Modal */}
      <NameModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Religion"
        label="Religion Name"
        placeholder="e.g., Hinduism, Islam"
        existing={religion}
        fieldKey="religion_name"
        isPending={editMutation.isPending}
        onSubmit={(religion_name, done) =>
          editMutation.mutate(
            { id: religion.id, religion_name },
            { onSuccess: done, onError: (err) => alert(err.message) }
          )
        }
      />

      {/* Add Caste Modal */}
      <NameModal
        isOpen={showAddCaste}
        onClose={() => setShowAddCaste(false)}
        title="Add New Caste"
        subtitle={`for ${religion.religion_name}`}
        label="Caste Name"
        placeholder="e.g., Brahmin, Rajput"
        existing={null}
        fieldKey="caste_name"
        isPending={addCasteMutation.isPending}
        onSubmit={(caste_name, done) =>
          addCasteMutation.mutate(
            { id: uuidv4().replace(/-/g, ""), caste_name, religion_id: religion.id },
            { onSuccess: done, onError: (err) => alert(err.message) }
          )
        }
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReligionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddReligion, setShowAddReligion] = useState(false);

  const { data: religions = [], isLoading, isError, error } = useGetReligions();
  const addReligionMutation = useAddReligion();

  const filtered = religions.filter((r) =>
    r.religion_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
            <span className="text-xl">🕉️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Religion & Community</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage religions, castes & sub-castes</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddReligion(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:shadow-lg transition-all flex items-center gap-2"
        >
          <span>➕</span> Add Religion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-5">
        <StatCard label="Total Religions" value={isLoading ? "…" : religions.length} icon="🕉️" color="bg-fuchsia-50" />
        <StatCard label="Filtered" value={isLoading ? "…" : filtered.length} icon="🔍" color="bg-blue-50" />
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search religions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 transition"
          />
        </div>
      </div>

      {/* Hierarchy hint */}
      <div className="flex items-center gap-4 text-xs text-gray-400 px-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-fuchsia-200 inline-block" /> Religion</span>
        <span>›</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-200 inline-block" /> Caste</span>
        <span>›</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-200 inline-block" /> Sub-Caste</span>
      </div>

      {/* Religion list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-fuchsia-100 flex items-center justify-center text-sm">📋</div>
          <div>
            <h2 className="font-semibold text-gray-800">Religion Directory</h2>
            <p className="text-xs text-gray-400">{filtered.length} religion{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Spinner className="w-5 h-5" /> Loading religions...
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="font-medium text-red-500">Failed to load religions</p>
            <p className="text-sm text-gray-400 mt-1">{error?.message}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-4xl">🕉️</div>
            <p className="font-medium text-gray-500">No religions found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or add a new religion</p>
          </div>
        ) : (
          filtered.map((religion) => (
            <ReligionAccordion key={religion.id} religion={religion} />
          ))
        )}
      </div>

      {/* Add Religion Modal */}
      <NameModal
        isOpen={showAddReligion}
        onClose={() => setShowAddReligion(false)}
        title="Add New Religion"
        label="Religion Name"
        placeholder="e.g., Hinduism, Islam"
        existing={null}
        fieldKey="religion_name"
        isPending={addReligionMutation.isPending}
        onSubmit={(religion_name, done) =>
          addReligionMutation.mutate(
            { id: uuidv4().replace(/-/g, ""), religion_name },
            { onSuccess: done, onError: (err) => alert(err.message) }
          )
        }
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.25s ease-out forwards; }
      `}</style>
    </div>
  );
}