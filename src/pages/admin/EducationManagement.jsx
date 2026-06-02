// src/pages/admin/EducationManagement.jsx
import { useState } from "react";
import {
  useGetEducationLevels,
  useAddEducationLevel,
  useEditEducationLevel,
  useDeleteEducationLevel,
  useGetEducationFields,
  useAddEducationField,
  useEditEducationField,
  useDeleteEducationField,
} from "../../hooks/useEducationManagement";

// ─── Design Tokens (Updated to Burgundy/Red theme) ────────────────────────────
const C = {
  primary: "#bd201c",        // Red 600
  primaryDark: "#601000",    // Burgundy
  primaryLight: "#fef2f2",   // red-50
  primaryBorder: "#fca5a5",  // red-300
  field: "#0891b2",          // Keep cyan for fields to distinguish hierarchy visually
  fieldBg: "#ecfeff",
  fieldBorder: "#a5f3fc",
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

function Avatar({ name, size = 36, bg = C.primary }) {
  return (
    <span
      className="rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm"
      style={{ width: size, height: size, background: bg === C.primary ? `linear-gradient(135deg, ${bg}, ${C.primaryDark})` : bg, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}

function Badge({ children, variant = "level" }) {
  const map = {
    level: "bg-[#fef2f2] text-[#bd201c] border border-[#fca5a5]",
    field: "bg-cyan-50 text-cyan-700 border border-cyan-200",
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

  const isField = accent === C.field;
  const gradient = isField ? `linear-gradient(90deg, ${accent}, #06b6d4)` : `linear-gradient(90deg, ${accent}, ${C.primaryDark})`;
  const focusRing = isField ? "focus:border-cyan-500 focus:ring-cyan-50" : "focus:border-[#bd201c] focus:ring-[#fef2f2]";

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

// ─── Field Row (leaf node) ────────────────────────────────────────────────────
function FieldRow({ field, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 mb-2 shadow-sm hover:border-cyan-300 transition-colors group">
      <div className="flex items-center gap-4">
        <Avatar name={field.education_field_name} size={32} bg={C.field} />
        <span className="text-sm font-semibold text-gray-800">
          {field.education_field_name}
        </span>
      </div>
      <div className="flex gap-2 transition-opacity">
        <IconBtn onClick={() => onEdit(field)} title="Edit Field"><EditIcon /></IconBtn>
        <IconBtn danger onClick={() => onDelete(field)} title="Delete Field"><TrashIcon /></IconBtn>
      </div>
    </div>
  );
}

// ─── Level Card (expandable) ──────────────────────────────────────────────────
function LevelCard({ level }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [deletingField, setDeletingField] = useState(null);

  const editLevelMutation = useEditEducationLevel();
  const deleteLevelMutation = useDeleteEducationLevel();
  const addFieldMutation = useAddEducationField();
  const editFieldMutation = useEditEducationField();
  const deleteFieldMutation = useDeleteEducationField();

  const { data: fields = [], isLoading } = useGetEducationFields(expanded ? level.id : null);

  return (
    <div className={`rounded-2xl border bg-white  ${expanded ? "border-[#fca5a5] ring-2 ring-[#fef2f2]" : "border-gray-200 hover:border-gray-300 hover:shadow-md"}`}>

      {/* Level Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-4 px-6 py-5 cursor-pointer transition-colors ${expanded ? 'bg-slate-50/50' : 'hover:bg-slate-50'} group`}
      >
        <ChevronIcon open={expanded} />
        <Avatar name={level.education_level_name} size={48} bg={C.primary} />

        <div className="flex-1">
          <span className={`text-lg font-bold transition-colors ${expanded || 'group-hover:text-[#bd201c]'} text-gray-900`}>
            {level.education_level_name}
          </span>
        </div>

        <div className="hidden sm:block">
          <Badge variant="level">Level</Badge>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex gap-2 transition-opacity`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowAddField(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-gray-200 rounded-xl bg-white text-gray-700 hover:text-cyan-600 hover:border-cyan-300 hover:bg-cyan-50 transition-all shadow-sm"
          >
            <PlusIcon /> Add Field
          </button>
          {/* Mobile add button */}
          <button onClick={() => setShowAddField(true)} className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-cyan-100 text-cyan-600 bg-cyan-50">
            <PlusIcon />
          </button>

          <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block self-center" />
          <IconBtn onClick={() => setShowEdit(true)} title="Edit Level"><EditIcon /></IconBtn>
          <IconBtn danger onClick={() => setShowDelete(true)} title="Delete Level"><TrashIcon /></IconBtn>
        </div>
      </div>

      {/* Fields List */}
      {expanded && (
        <div className="border-t border-gray-100 p-6 bg-slate-50/50">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-sm font-medium">
              <Spinner size={16} color={C.field} /> Loading fields...
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-8 bg-white border border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 text-sm font-medium">No fields added yet.</p>
              <button onClick={() => setShowAddField(true)} className="mt-2 text-sm text-cyan-600 font-bold hover:underline">
                + Add a Field
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map((field) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  onEdit={(f) => setEditingField(f)}
                  onDelete={(f) => setDeletingField(f)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Education Level"
        placeholder="Education Level Name"
        existing={{ name: level.education_level_name }}
        onSubmit={(name) => editLevelMutation.mutate({ id: level.id, education_level_name: name })}
        isPending={editLevelMutation.isPending}
        accent={C.primary}
      />

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteLevelMutation.mutate(level.id)}
        message={`Are you sure you want to delete "${level.education_level_name}"? All associated fields will also be permanently removed.`}
        isPending={deleteLevelMutation.isPending}
      />

      <Modal
        isOpen={showAddField}
        onClose={() => setShowAddField(false)}
        title="Add Education Field"
        placeholder="e.g. Engineering / Technology"
        onSubmit={(name) =>
          addFieldMutation.mutate({ education_field_name: name, education_level_id: level.id }, { onSuccess: () => setShowAddField(false) })
        }
        isPending={addFieldMutation.isPending}
        accent={C.field}
      />

      <Modal
        isOpen={!!editingField}
        onClose={() => setEditingField(null)}
        title="Edit Education Field"
        placeholder="Field Name"
        existing={editingField ? { name: editingField.education_field_name } : null}
        onSubmit={(name) => {
          if (editingField)
            editFieldMutation.mutate({ id: editingField.id, education_field_name: name });
          setEditingField(null);
        }}
        isPending={editFieldMutation.isPending}
        accent={C.field}
      />

      <ConfirmDialog
        isOpen={!!deletingField}
        onClose={() => setDeletingField(null)}
        onConfirm={() => {
          if (deletingField) deleteFieldMutation.mutate(deletingField.id);
          setDeletingField(null);
        }}
        message={`Are you sure you want to delete "${deletingField?.education_field_name}"?`}
        isPending={deleteFieldMutation.isPending}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EducationManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddLevel, setShowAddLevel] = useState(false);

  const { data: levels = [], isLoading, isError, refetch } = useGetEducationLevels();
  const addLevelMutation = useAddEducationLevel();

  const filtered = levels.filter((l) =>
    l.education_level_name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Education</h1>
            <p className="text-sm text-gray-500 mt-1">Manage the Education Level → Field hierarchy</p>
          </div>
          <button
            onClick={() => setShowAddLevel(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#601000] to-[#bd201c] hover:from-[#4a0c00] hover:to-[#9C0425] text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <PlusIcon /> Add Level
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
              placeholder="Search education levels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-[#fca5a5] focus:ring-4 focus:ring-[#fef2f2]"
            />
          </div>

          {/* Stats Badge */}
          {!isLoading && !isError && levels.length > 0 && (
            <div className="shrink-0 flex items-center gap-2 border-l border-gray-200 pl-4 hidden sm:flex">
              <div className="px-4 py-2 bg-[#fef2f2] text-[#bd201c] rounded-xl text-xs font-bold border border-[#fca5a5]">
                Total: {levels.length}
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
            <p className="text-red-800 font-bold text-lg mb-1">Failed to load education data</p>
            <p className="text-red-600 text-sm mb-4">Please check your connection and try again.</p>
            <button onClick={() => refetch()} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md transition">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎓</div>
            <p className="text-gray-900 font-bold text-lg">
              {searchTerm ? `No levels matching "${searchTerm}"` : "No education levels yet"}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm ? "Try adjusting your search keyword." : "Click 'Add Level' to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((level) => (
              <LevelCard key={level.id} level={level} />
            ))}
          </div>
        )}
      </div>

      {/* Add Level Modal */}
      <Modal
        isOpen={showAddLevel}
        onClose={() => setShowAddLevel(false)}
        title="Add Education Level"
        placeholder="e.g. Bachelor's Degree"
        onSubmit={(name) => addLevelMutation.mutate({ education_level_name: name }, { onSuccess: () => setShowAddLevel(false) })}
        isPending={addLevelMutation.isPending}
        accent={C.primary}
      />
    </div>
  );
}