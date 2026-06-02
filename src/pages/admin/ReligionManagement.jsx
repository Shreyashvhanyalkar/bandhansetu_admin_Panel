// pages/admin/ReligionManagement.jsx
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useGetReligions, useAddReligion, useEditReligion, useDeleteReligion,
  useGetCastes, useAddCaste, useEditCaste, useDeleteCaste,
  useGetSubcasts, useAddSubcast, useEditSubcast, useDeleteSubcast,
} from "../../hooks/useReligionCast";

// ─── Design Tokens (Updated to Burgundy/Red Theme) ────────────────────────────
const C = {
  primary: "#bd201c",      // Red 600
  primaryDark: "#601000",      // Burgundy
  primaryLight: "#fef2f2",      // red-50
  primaryMid: "#fca5a5",      // red-300
  primaryBorder: "#fca5a5",      // red-300
  caste: "#0891b2",      // Cyan
  casteBg: "#ecfeff",
  casteBorder: "#a5f3fc",
  sub: "#059669",      // Emerald
  subBg: "#ecfdf5",
  subBorder: "#a7f3d0",
  danger: "#dc2626",      // red-600
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  textPrimary: "#111827",
  textSecondary: "#4b5563",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  surfaceMuted: "#f8fafc",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name = "") =>
  name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = C.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color }}>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ─── Icon Button ──────────────────────────────────────────────────────────────
function IconBtn({ onClick, disabled, danger, title, children }) {
  return (
    <button
      onClick={onClick} disabled={disabled} title={title}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shadow-sm border
        ${danger ? "border-red-100 text-red-500 bg-white hover:bg-red-50 hover:border-red-200" : "border-gray-100 text-gray-500 bg-white hover:text-[#bd201c] hover:bg-[#fef2f2] hover:border-[#fca5a5]"}`}
    >
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-100 text-gray-600 border border-gray-200",
    primary: "bg-[#fef2f2] text-[#bd201c] border border-[#fca5a5]",
    cyan: "bg-cyan-50 text-cyan-700 border border-cyan-200",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Initials Avatar ──────────────────────────────────────────────────────────
function Avatar({ name, size = 36, bg = C.primary }) {
  const letters = initials(name) || "?";
  return (
    <span
      className="rounded-xl flex items-center justify-center font-bold text-white shrink-0 select-none shadow-sm"
      style={{ width: size, height: size, background: bg === C.primary ? `linear-gradient(135deg, ${bg}, ${C.primaryDark})` : bg, fontSize: size * 0.36 }}
    >
      {letters}
    </span>
  );
}

// ─── Professional Modal Component (Used for ALL adds/edits) ───────────────────
function Modal({ isOpen, onClose, title, subtitle, label, placeholder, existing, fieldKey, onSubmit, isPending, accent = C.primary }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  const isEdit = !!existing;

  useEffect(() => {
    if (isOpen) {
      setName(existing?.[fieldKey] ?? "");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, existing, fieldKey]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim(), () => { setName(""); onClose(); });
  };

  if (!isOpen) return null;

  const gradient = accent === C.primary ? `linear-gradient(90deg, ${accent}, ${C.primaryDark})` : `linear-gradient(90deg, ${accent}, ${accent}dd)`;
  const focusRing = accent === C.primary ? "focus:border-[#bd201c] focus:ring-[#fef2f2]" : accent === C.caste ? "focus:border-cyan-500 focus:ring-cyan-50" : "focus:border-emerald-500 focus:ring-emerald-50";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: gradient }} />

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={existing?.[fieldKey] || label} size={42} bg={accent} />
              <div>
                <h2 className="text-xl font-bold tracking-tight" style={{ color: C.textPrimary }}>{title}</h2>
                {subtitle && <p className="text-sm mt-0.5" style={{ color: C.textSecondary }}>{subtitle}</p>}
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>{label}</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onClose(); }}
              placeholder={placeholder}
              className={`w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl outline-none transition-all focus:ring-4 font-medium ${focusRing}`}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md"
              style={{ background: gradient }}
            >
              {isPending ? <><Spinner size={16} color="#fff" /><span>Saving…</span></> : <span>{isEdit ? "Update" : "Add"}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
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
          <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">{message}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
              Cancel
            </button>
            <button
              onClick={onConfirm} disabled={isPending}
              className="flex-1 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-md"
            >
              {isPending ? <><Spinner size={16} color="#fff" /> Deleting…</> : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SVGs ─────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlusIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);
const ChevronIcon = ({ open, color = "#94A3B8" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"
    className="shrink-0 transition-transform duration-300"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Sub-Caste Row ────────────────────────────────────────────────────────────
function SubcastRow({ subcast, casteId, religionName, casteName }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const editMutation = useEditSubcast(casteId);
  const deleteMutation = useDeleteSubcast(casteId);

  return (
    <>
      <div className="group/sub flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl mb-2 shadow-sm hover:border-emerald-300 transition-colors">
        <div className="flex items-center gap-3">
          <Avatar name={subcast.subcaste_name} size={30} bg={C.sub} />
          <span className="text-sm font-semibold text-gray-800">{subcast.subcaste_name}</span>
        </div>
        <div className="flex gap-2 transition-opacity">
          <IconBtn onClick={() => setShowEdit(true)} title="Edit sub-caste"><EditIcon /></IconBtn>
          <IconBtn danger onClick={() => setShowConfirm(true)} title="Delete sub-caste"><TrashIcon /></IconBtn>
        </div>
      </div>

      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Sub-Caste"
        subtitle={`${religionName} → ${casteName}`}
        label="Sub-Caste Name"
        placeholder="e.g., Deshastha, Karhade"
        existing={subcast}
        fieldKey="subcaste_name"
        accent={C.sub}
        isPending={editMutation.isPending}
        onSubmit={(subcaste_name, done) =>
          editMutation.mutate(
            { id: subcast.id, subcaste_name },
            { onSuccess: () => { done(); setShowEdit(false); }, onError: (e) => alert(e.message) }
          )
        }
      />

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        message={`"${subcast.subcaste_name}" will be permanently removed from ${casteName}.`}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(subcast.id, {
          onSuccess: () => setShowConfirm(false),
          onError: (e) => alert(e.message)
        })}
      />
    </>
  );
}

// ─── Caste Row ────────────────────────────────────────────────────────────────
function CasteRow({ caste, religionId, religionName }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddSubcast, setShowAddSubcast] = useState(false);

  const editMutation = useEditCaste(religionId);
  const deleteMutation = useDeleteCaste(religionId);
  const addSubcastMutation = useAddSubcast(caste.id);
  const { data: subcasts = [], isLoading } = useGetSubcasts(expanded ? caste.id : null);

  return (
    <>
      <div className={`rounded-xl border bg-white overflow-hidden shadow-sm transition-all duration-300 ${expanded ? "border-cyan-300 ring-2 ring-cyan-50" : "border-gray-200 hover:border-gray-300"} group/caste`}>
        {/* Caste Header */}
        <div
          className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${expanded ? 'bg-cyan-50/20' : 'hover:bg-slate-50'}`}
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronIcon open={expanded} color={expanded ? C.caste : C.textMuted} />
          <Avatar name={caste.caste_name} size={38} bg={C.caste} />
          <span className={`text-base font-bold flex-1 transition-colors ${expanded || 'group-hover/caste:text-cyan-700'}`}>{caste.caste_name}</span>

          <div className="hidden sm:block">
            <Badge variant="cyan">Caste</Badge>
          </div>

          <div className={`flex gap-2 transition-opacity`} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAddSubcast(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-gray-200 rounded-xl bg-white text-gray-700 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm"
            >
              <PlusIcon size={12} /> Add Sub-Caste
            </button>
            <button onClick={() => setShowAddSubcast(true)} className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-emerald-100 text-emerald-600 bg-emerald-50">
              <PlusIcon size={14} />
            </button>
            <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block self-center" />
            <IconBtn onClick={() => setShowEdit(true)} title="Edit caste"><EditIcon /></IconBtn>
            <IconBtn danger onClick={() => setShowConfirm(true)} title="Delete caste"><TrashIcon /></IconBtn>
          </div>
        </div>

        {/* Sub-Castes List (Expandable) */}
        {expanded && (
          <div className="border-t border-gray-100 p-5 bg-slate-50/50">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-gray-500 text-sm font-medium">
                <Spinner size={16} color={C.caste} /> Loading sub-castes...
              </div>
            ) : subcasts.length === 0 ? (
              <div className="text-center py-6 bg-white border border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500 text-sm font-medium">No sub-castes added yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subcasts.map((sc) => (
                  <SubcastRow
                    key={sc.id}
                    subcast={sc}
                    casteId={caste.id}
                    religionName={religionName}
                    casteName={caste.caste_name}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Caste" subtitle={`Updating caste in ${religionName}`} label="Caste Name" placeholder="e.g., Brahmin, Rajput" existing={caste} fieldKey="caste_name" accent={C.caste} isPending={editMutation.isPending} onSubmit={(caste_name, done) => editMutation.mutate({ id: caste.id, caste_name, religion_id: religionId }, { onSuccess: () => { done(); setShowEdit(false); }, onError: (e) => alert(e.message) })} />
      <Modal isOpen={showAddSubcast} onClose={() => setShowAddSubcast(false)} title="Add New Sub-Caste" subtitle={`${religionName} → ${caste.caste_name}`} label="Sub-Caste Name" placeholder="e.g., Deshastha, Karhade, Kulkarni" existing={null} fieldKey="subcaste_name" accent={C.sub} isPending={addSubcastMutation.isPending} onSubmit={(subcaste_name, done) => addSubcastMutation.mutate({ id: uuidv4().replace(/-/g, ""), subcaste_name, caste_id: caste.id }, { onSuccess: () => { done(); setShowAddSubcast(false); }, onError: (e) => alert(e.message) })} />
      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} message={`"${caste.caste_name}" and all its sub-castes will be permanently removed from ${religionName}.`} isPending={deleteMutation.isPending} onConfirm={() => deleteMutation.mutate({ id: caste.id }, { onSuccess: () => setShowConfirm(false), onError: (e) => alert(e.message) })} />
    </>
  );
}

// ─── Religion Card ────────────────────────────────────────────────────────────
function ReligionCard({ religion }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddCaste, setShowAddCaste] = useState(false);

  const editMutation = useEditReligion();
  const deleteMutation = useDeleteReligion();
  const addCasteMutation = useAddCaste(religion.id);
  const { data: castes = [], isLoading } = useGetCastes(expanded ? religion.id : null);

  return (
    <>
      <div className={`rounded-2xl border bg-white overflow-hidden shadow-sm transition-all duration-300 ${expanded ? "border-[#fca5a5] ring-2 ring-[#fef2f2]" : "border-gray-200 hover:border-gray-300 hover:shadow-md"}`}>

        {/* Religion Header */}
        <div
          className={`flex items-center gap-4 px-6 py-5 cursor-pointer transition-colors ${expanded ? 'bg-slate-50/50' : 'hover:bg-slate-50'} group/rel`}
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronIcon open={expanded} color={expanded ? C.primary : C.textMuted} />
          <Avatar name={religion.religion_name} size={48} bg={C.primary} />

          <div className="flex-1">
            <span className={`text-lg font-bold transition-colors ${expanded || 'group-hover/rel:text-[#bd201c]'} text-gray-900`}>
              {religion.religion_name}
            </span>
          </div>

          <div className="hidden sm:block">
            <Badge variant="primary">Religion</Badge>
          </div>

          {/* Action Buttons */}
          <div
            className={`flex gap-2 transition-opacity`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddCaste(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-gray-200 rounded-xl bg-white text-gray-700 hover:text-cyan-600 hover:border-cyan-300 hover:bg-cyan-50 transition-all shadow-sm"
            >
              <PlusIcon size={12} /> Add Caste
            </button>
            <button onClick={() => setShowAddCaste(true)} className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-cyan-100 text-cyan-600 bg-cyan-50">
              <PlusIcon size={14} />
            </button>

            <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block self-center" />
            <IconBtn onClick={() => setShowEdit(true)} title="Edit religion"><EditIcon /></IconBtn>
            <IconBtn danger onClick={() => setShowConfirm(true)} title="Delete religion"><TrashIcon /></IconBtn>
          </div>
        </div>

        {/* Castes List (Expandable) */}
        {expanded && (
          <div className="border-t border-gray-100 p-6 bg-slate-50/50">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-sm font-medium">
                <Spinner size={16} color={C.caste} /> Loading castes...
              </div>
            ) : castes.length === 0 ? (
              <div className="text-center py-8 bg-white border border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500 text-sm font-medium">No castes added yet.</p>
                <button onClick={() => setShowAddCaste(true)} className="mt-2 text-sm text-cyan-600 font-bold hover:underline">
                  + Add a Caste
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {castes.map((caste) => (
                  <CasteRow
                    key={caste.id}
                    caste={caste}
                    religionId={religion.id}
                    religionName={religion.religion_name}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Religion" subtitle="Update religion name" label="Religion Name" placeholder="e.g., Hinduism, Islam, Buddhism" existing={religion} fieldKey="religion_name" accent={C.primary} isPending={editMutation.isPending} onSubmit={(religion_name, done) => editMutation.mutate({ id: religion.id, religion_name }, { onSuccess: () => { done(); setShowEdit(false); }, onError: (e) => alert(e.message) })} />
      <Modal isOpen={showAddCaste} onClose={() => setShowAddCaste(false)} title="Add New Caste" subtitle={`Adding to ${religion.religion_name}`} label="Caste Name" placeholder="e.g., Brahmin, Rajput, Kshatriya" existing={null} fieldKey="caste_name" accent={C.caste} isPending={addCasteMutation.isPending} onSubmit={(caste_name, done) => addCasteMutation.mutate({ id: uuidv4().replace(/-/g, ""), caste_name, religion_id: religion.id }, { onSuccess: () => { done(); setShowAddCaste(false); }, onError: (e) => alert(e.message) })} />
      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} message={`"${religion.religion_name}" and all its castes/sub-castes will be permanently removed.`} isPending={deleteMutation.isPending} onConfirm={() => deleteMutation.mutate(religion.id, { onSuccess: () => setShowConfirm(false), onError: (e) => alert(e.message) })} />
    </>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="h-6 w-48 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReligionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddReligion, setShowAddReligion] = useState(false);
  const addReligionMutation = useAddReligion();
  const { data: religions = [], isLoading, isError, error, refetch } = useGetReligions();

  const filtered = religions.filter((r) =>
    r.religion_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-8">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Religion & Community</h1>
            <p className="text-sm text-gray-500 mt-1">Manage Religion → Caste → Sub-caste hierarchy</p>
          </div>
          <button
            onClick={() => setShowAddReligion(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#601000] to-[#bd201c] hover:from-[#4a0c00] hover:to-[#9C0425] text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <PlusIcon /> Add Religion
          </button>
        </div>

        {/* Toolbar & Stats */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#bd201c] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
            </span>
            <input
              type="text"
              placeholder="Search religions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-[#fca5a5] focus:ring-4 focus:ring-[#fef2f2]"
            />
          </div>

          {/* Stats Badge */}
          {!isLoading && !isError && religions.length > 0 && (
            <div className="shrink-0 flex items-center gap-2">
              <div className="px-4 py-2 bg-[#fef2f2] text-[#bd201c] rounded-xl text-xs font-bold border border-[#fca5a5]">
                {religions.length} Religions
              </div>

            </div>
          )}
        </div>

        {/* Religions List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          ) : isError ? (
            <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200 shadow-sm">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-800 font-bold text-lg mb-1">Failed to load religions</p>
              <p className="text-red-600 text-sm mb-4">{error?.message || "Please check your connection."}</p>
              <button onClick={() => refetch()} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md transition">
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🕉️</div>
              <p className="text-gray-900 font-bold text-lg">
                {searchTerm ? `No religions matching "${searchTerm}"` : "No religions added yet"}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm ? "Try adjusting your search keyword." : "Click 'Add Religion' to start building your hierarchy."}
              </p>
            </div>
          ) : (
            filtered.map((religion) => (
              <ReligionCard key={religion.id} religion={religion} />
            ))
          )}
        </div>

        {/* Add Religion Modal */}
        <Modal
          isOpen={showAddReligion}
          onClose={() => setShowAddReligion(false)}
          title="Add New Religion"
          subtitle="Create a new religious community"
          label="Religion Name"
          placeholder="e.g., Hinduism, Islam, Buddhism"
          existing={null}
          fieldKey="religion_name"
          accent={C.primary}
          isPending={addReligionMutation.isPending}
          onSubmit={(religion_name, done) =>
            addReligionMutation.mutate(
              { id: uuidv4().replace(/-/g, ""), religion_name },
              { onSuccess: () => { done(); setShowAddReligion(false); }, onError: (e) => alert(e.message) }
            )
          }
        />
      </div>
    </div>
  );
}