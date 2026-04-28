// pages/admin/ReligionManagement.jsx
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useGetReligions, useAddReligion, useEditReligion, useDeleteReligion,
  useGetCastes, useAddCaste, useEditCaste, useDeleteCaste,
  useGetSubcasts, useAddSubcast, useEditSubcast, useDeleteSubcast,
} from "../../hooks/useReligionCast";

// ─── Design Tokens (Professional Light Theme) ─────────────────────────────────
const C = {
  primary:       "#c026d3",      // Fuchsia - slightly lighter
  primaryDark:   "#a21caf",
  primaryLight:  "#fdf4ff",
  primaryMid:    "#fae8ff",
  primaryBorder: "#f0abfc",
  caste:         "#0891b2",      // Cyan - slightly lighter
  casteBg:       "#ecfeff",
  casteBorder:   "#a5f3fc",
  sub:           "#059669",      // Emerald - slightly lighter
  subBg:         "#ecfdf5",
  subBorder:     "#a7f3d0",
  danger:        "#ef4444",
  dangerBg:      "#fef2f2",
  dangerBorder:  "#fecaca",
  textPrimary:   "#1e1b2e",
  textSecondary: "#5b5266",
  textMuted:     "#a19aa6",
  border:        "#f1eef2",
  surfaceMuted:  "#faf9fb",
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
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
        ${danger
          ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
          : "text-gray-400 hover:text-fuchsia-700 hover:bg-fuchsia-50"
        }`}
    >
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-100 text-gray-600",
    primary: "bg-fuchsia-50 text-fuchsia-700",
    success: "bg-green-50 text-green-700",
    cyan: "bg-cyan-50 text-cyan-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Initials Avatar ──────────────────────────────────────────────────────────
function Avatar({ name, size = 36, bg = C.primary }) {
  const letters = initials(name) || "?";
  return (
    <span
      className="rounded-xl flex items-center justify-center font-bold text-white shrink-0 select-none"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, fontSize: size * 0.36 }}
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(30,20,35,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden"
        style={{ animation: "modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={existing?.[fieldKey] || label} size={36} bg={accent} />
              <div>
                <h2 className="text-base font-semibold tracking-tight" style={{ color: C.textPrimary }}>{title}</h2>
                {subtitle && <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{subtitle}</p>}
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.textMuted }}>{label}</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onClose(); }}
              placeholder={placeholder}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg outline-none transition-all bg-gray-50 border focus:bg-white"
              style={{ borderColor: C.border }}
              onFocus={(e) => { e.target.style.borderColor = accent + "80"; e.target.style.boxShadow = `0 0 0 3px ${accent}18`; }}
              onBlur={(e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = ""; }}
            />
          </div>

          <div className="flex gap-2.5 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              {isPending ? <><Spinner size={14} color="#fff" /><span>Saving…</span></> : <span>{isEdit ? "Update" : "Add"} {label}</span>}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(30,20,35,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl overflow-hidden"
        style={{ animation: "modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${C.danger}, ${C.danger}88)` }} />
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.dangerBg }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>Confirm Delete</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: C.textSecondary }}>{message}</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={onConfirm} disabled={isPending}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md"
              style={{ background: `linear-gradient(135deg, ${C.danger}, ${C.danger}cc)` }}
            >
              {isPending ? <><Spinner size={14} color="#fff" /> Deleting…</> : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit SVG ─────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlusIcon = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);
const ChevronIcon = ({ open, color = "#94A3B8" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"
    className="shrink-0 transition-transform duration-200"
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
      <div className="group flex items-center justify-between py-2 px-3 rounded-lg hover:bg-emerald-50/30 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <Avatar name={subcast.subcaste_name} size={26} bg={C.sub} />
          <span className="text-sm font-medium" style={{ color: C.textPrimary }}>{subcast.subcaste_name}</span>
          <Badge variant="emerald">Active</Badge>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconBtn onClick={() => setShowEdit(true)} title="Edit sub-caste"><EditIcon /></IconBtn>
          <IconBtn danger onClick={() => setShowConfirm(true)} title="Delete sub-caste"><TrashIcon /></IconBtn>
        </div>
      </div>

      {/* Edit Sub-Caste Modal */}
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

      {/* Delete Confirmation */}
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
      <div className="rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200" style={{ borderColor: C.border }}>
        {/* Caste Header */}
        <div
          className="group flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-cyan-50/30 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronIcon open={expanded} color={expanded ? C.caste : C.textMuted} />
          <Avatar name={caste.caste_name} size={30} bg={C.caste} />
          <span className="flex-1 text-sm font-semibold" style={{ color: C.textPrimary }}>{caste.caste_name}</span>
          {expanded && subcasts.length > 0 && (
            <Badge variant="cyan">{subcasts.length} sub</Badge>
          )}
          <Badge variant="cyan">Active</Badge>

          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAddSubcast(true)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition"
              style={{ background: C.primaryLight, color: C.primary }}
            >
              <PlusIcon size={9} /> Sub-Caste
            </button>
            <IconBtn onClick={() => setShowEdit(true)} title="Edit caste"><EditIcon /></IconBtn>
            <IconBtn danger onClick={() => setShowConfirm(true)} title="Delete caste"><TrashIcon /></IconBtn>
          </div>
        </div>

        {/* Sub-Castes List (Expandable) */}
        {expanded && (
          <div className="border-t px-4 py-2 space-y-0.5" style={{ borderColor: C.casteBorder, background: C.casteBg }}>
            {isLoading ? (
              <div className="flex items-center gap-2 py-3 text-xs" style={{ color: C.textMuted }}>
                <Spinner size={12} color={C.caste} /> Loading sub-castes…
              </div>
            ) : subcasts.length === 0 ? (
              <p className="text-xs text-center py-3" style={{ color: C.textMuted }}>
                No sub-castes yet —{" "}
                <button onClick={() => setShowAddSubcast(true)} className="font-semibold hover:underline" style={{ color: C.primary }}>
                  add one
                </button>
              </p>
            ) : (
              subcasts.map((sc) => (
                <SubcastRow 
                  key={sc.id} 
                  subcast={sc} 
                  casteId={caste.id} 
                  religionName={religionName}
                  casteName={caste.caste_name}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Caste Modal */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Caste"
        subtitle={`Updating caste in ${religionName}`}
        label="Caste Name"
        placeholder="e.g., Brahmin, Rajput"
        existing={caste}
        fieldKey="caste_name"
        accent={C.caste}
        isPending={editMutation.isPending}
        onSubmit={(caste_name, done) =>
          editMutation.mutate(
            { id: caste.id, caste_name, religion_id: religionId },
            { onSuccess: () => { done(); setShowEdit(false); }, onError: (e) => alert(e.message) }
          )
        }
      />

      {/* Add Sub-Caste Modal */}
      <Modal
        isOpen={showAddSubcast}
        onClose={() => setShowAddSubcast(false)}
        title="Add New Sub-Caste"
        subtitle={`${religionName} → ${caste.caste_name}`}
        label="Sub-Caste Name"
        placeholder="e.g., Deshastha, Karhade, Kulkarni"
        existing={null}
        fieldKey="subcaste_name"
        accent={C.sub}
        isPending={addSubcastMutation.isPending}
        onSubmit={(subcaste_name, done) =>
          addSubcastMutation.mutate(
            { id: uuidv4().replace(/-/g, ""), subcaste_name, caste_id: caste.id },
            { onSuccess: () => { done(); setShowAddSubcast(false); }, onError: (e) => alert(e.message) }
          )
        }
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        message={`"${caste.caste_name}" and all its sub-castes will be permanently removed from ${religionName}.`}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(
          { id: caste.id }, 
          { onSuccess: () => setShowConfirm(false), onError: (e) => alert(e.message) }
        )}
      />
    </>
  );
}

// ─── Religion Card ────────────────────────────────────────────────────────────
function ReligionCard({ religion, index }) {
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
      <div
        className="rounded-xl border bg-white overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md"
        style={{ borderColor: expanded ? C.primaryBorder : C.border }}
      >
        {/* Religion Header */}
        <div
          className="group flex items-center gap-4 px-5 py-4 cursor-pointer select-none transition-colors hover:bg-fuchsia-50/30"
          onClick={() => setExpanded(!expanded)}
        >
          <div
            className="w-0.5 h-9 rounded-full shrink-0 transition-all duration-300"
            style={{ background: expanded ? C.primary : C.border }}
          />
          <ChevronIcon open={expanded} color={expanded ? C.primary : C.textMuted} />
          <Avatar name={religion.religion_name} size={38} bg={C.primary} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-base font-bold tracking-tight transition-colors"
                style={{ color: expanded ? C.primary : C.textPrimary }}
              >
                {religion.religion_name}
              </span>
              <Badge variant="primary">Active</Badge>
              {expanded && castes.length > 0 && (
                <Badge variant="default">{castes.length} caste{castes.length !== 1 ? "s" : ""}</Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAddCaste(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:shadow-sm"
              style={{ borderColor: C.primaryBorder, color: C.primary, background: C.primaryLight }}
            >
              <PlusIcon size={10} /> Add Caste
            </button>
            <IconBtn onClick={() => setShowEdit(true)} title="Edit religion"><EditIcon /></IconBtn>
            <IconBtn danger onClick={() => setShowConfirm(true)} title="Delete religion"><TrashIcon /></IconBtn>
          </div>
        </div>

        {/* Castes List (Expandable) */}
        {expanded && (
          <div className="border-t px-5 py-4 space-y-2.5" style={{ borderColor: C.primaryBorder, background: C.surfaceMuted }}>
            {isLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm" style={{ color: C.textMuted }}>
                <Spinner size={14} color={C.primary} /> Loading castes…
              </div>
            ) : castes.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-sm" style={{ color: C.textMuted }}>No castes added yet</p>
                <button
                  onClick={() => setShowAddCaste(true)}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: C.primary }}
                >
                  + Add your first caste
                </button>
              </div>
            ) : (
              castes.map((caste) => (
                <CasteRow 
                  key={caste.id} 
                  caste={caste} 
                  religionId={religion.id} 
                  religionName={religion.religion_name}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Religion Modal */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Religion"
        subtitle="Update religion name"
        label="Religion Name"
        placeholder="e.g., Hinduism, Islam, Buddhism"
        existing={religion}
        fieldKey="religion_name"
        accent={C.primary}
        isPending={editMutation.isPending}
        onSubmit={(religion_name, done) =>
          editMutation.mutate(
            { id: religion.id, religion_name },
            { onSuccess: () => { done(); setShowEdit(false); }, onError: (e) => alert(e.message) }
          )
        }
      />

      {/* Add Caste Modal */}
      <Modal
        isOpen={showAddCaste}
        onClose={() => setShowAddCaste(false)}
        title="Add New Caste"
        subtitle={`Adding to ${religion.religion_name}`}
        label="Caste Name"
        placeholder="e.g., Brahmin, Rajput, Kshatriya"
        existing={null}
        fieldKey="caste_name"
        accent={C.caste}
        isPending={addCasteMutation.isPending}
        onSubmit={(caste_name, done) =>
          addCasteMutation.mutate(
            { id: uuidv4().replace(/-/g, ""), caste_name, religion_id: religion.id },
            { onSuccess: () => { done(); setShowAddCaste(false); }, onError: (e) => alert(e.message) }
          )
        }
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        message={`"${religion.religion_name}" and all its castes/sub-castes will be permanently removed.`}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(religion.id, { 
          onSuccess: () => setShowConfirm(false),
          onError: (e) => alert(e.message) 
        })}
      />
    </>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 flex items-center gap-4 animate-pulse">
      <div className="w-0.5 h-9 rounded-full bg-gray-200" />
      <div className="w-4 h-4 rounded bg-gray-200" />
      <div className="w-9 h-9 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-32 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-5 w-14 bg-gray-100 rounded-full" />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd, isSearch }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: C.primaryLight }}>
        <span className="text-3xl">{isSearch ? "🔍" : "🕉️"}</span>
      </div>
      <p className="text-base font-semibold mb-1" style={{ color: C.textSecondary }}>
        {isSearch ? "No results found" : "No religions added yet"}
      </p>
      <p className="text-sm mb-5 max-w-xs" style={{ color: C.textMuted }}>
        {isSearch
          ? "Try a different search term."
          : "Start building your community hierarchy."}
      </p>
      {!isSearch && (
        <button
          onClick={onAdd}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` }}
        >
          + Add First Religion
        </button>
      )}
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
    <div className="min-h-screen p-6 space-y-6" style={{ background: "#faf9fc" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: C.textPrimary }}>Religion & Community</h1>
            <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>Manage religion → caste → sub-caste hierarchy</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddReligion(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` }}
        >
          <PlusIcon size={13} /> Add Religion
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3 shadow-sm" style={{ borderColor: C.border }}>
          <Avatar name="RE" size={38} bg={C.primary} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Religions</p>
            <p className="text-xl font-bold" style={{ color: C.primary }}>{isLoading ? "—" : religions.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3 shadow-sm" style={{ borderColor: C.border }}>
          <Avatar name="CA" size={38} bg={C.caste} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Castes</p>
            <p className="text-xl font-bold" style={{ color: C.caste }}>
              {isLoading ? "—" : religions.reduce((acc, r) => acc + (r.castes?.length || 0), 0)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3 shadow-sm" style={{ borderColor: C.border }}>
          <Avatar name="SU" size={38} bg={C.sub} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Sub-Castes</p>
            <p className="text-xl font-bold" style={{ color: C.sub }}>
              {isLoading ? "—" : religions.reduce((acc, r) => acc + (r.castes?.reduce((a, c) => a + (c.subcastes?.length || 0), 0) || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Hierarchy Hint */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { label: "Religion", color: C.primary, bg: C.primaryLight },
          { label: "Caste", color: C.caste, bg: C.casteBg },
          { label: "Sub-Caste", color: C.sub, bg: C.subBg },
        ].map((item, i, arr) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg font-semibold" style={{ background: item.bg, color: item.color }}>
              {item.label}
            </span>
            {i < arr.length - 1 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
        <span className="text-xs" style={{ color: C.textMuted }}>— click any row to expand</span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2.2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search religions…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-lg outline-none shadow-sm transition-all focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-100"
          style={{ borderColor: C.border }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Religions List */}
      <div className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
        ) : isError ? (
          <div className="bg-white rounded-xl border p-8 text-center space-y-3" style={{ borderColor: C.dangerBorder }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mx-auto" style={{ background: C.dangerBg }}>⚠️</div>
            <p className="font-semibold" style={{ color: C.textSecondary }}>Failed to load religions</p>
            <p className="text-sm" style={{ color: C.textMuted }}>{error?.message}</p>
            <button onClick={() => refetch()} className="px-4 py-2 text-sm font-semibold rounded-lg transition" style={{ color: C.primary, background: C.primaryLight }}>
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: C.border }}>
            <EmptyState onAdd={() => setShowAddReligion(true)} isSearch={!!searchTerm} />
          </div>
        ) : (
          filtered.map((religion, i) => (
            <ReligionCard key={religion.id} religion={religion} index={i} />
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
        placeholder="e.g., Hinduism, Islam, Buddhism, Christianity"
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

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}