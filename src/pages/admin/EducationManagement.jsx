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

const C = {
  primary: "#c026d3",        // was #0369a1
  primaryDark: "#a21caf",    // was #075985
  primaryLight: "#fdf4ff",   // was #f0f9ff
  primaryBorder: "#f0abfc",  // was #bae6fd
  field: "#0891b2",          // keep cyan for fields (same as "state" in location)
  fieldBg: "#ecfeff",        // keep (same as stateBg)
  fieldBorder: "#a5f3fc",    // keep (same as stateBorder)
  danger: "#ef4444",         // same
  textPrimary: "#1e1b2e",    // was #0c1a27
  textSecondary: "#5b5266",  // was #374151
  textMuted: "#a19aa6",      // was #9ca3af
  border: "#f1eef2",         // was #e2eef5
  bg: "#faf9fc",             // was #f7fbfe
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

// ─── Shared Icons ─────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = C.primary }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ color, animation: "edu-spin 0.8s linear infinite" }}
    >
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
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: "none",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        color: "#9ca3af",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.color = danger ? "#ef4444" : C.primary;
          e.currentTarget.style.background = danger ? "#fef2f2" : C.primaryLight;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#9ca3af";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

function Avatar({ name, size = 36, bg = C.primary }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
      }}
    >
      {initials(name)}
    </span>
  );
}

function Badge({ children, variant = "level" }) {
  const map = {
    level: { bg: "#eff6ff", color: "#1d4ed8" },
    field: { bg: "#ecfeff", color: "#0e7490" },
  };
  const s = map[variant] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{
        transition: "transform 0.2s",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        color: C.textMuted,
        flexShrink: 0,
      }}
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, placeholder, existing, onSubmit, isPending, accent = C.primary }) {
  const [name, setName] = useState(existing?.name || "");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          background: "#fff", width: "100%", maxWidth: 420,
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ height: 4, background: accent }} />
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{title}</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={placeholder}
            autoFocus
            style={{
              width: "100%", padding: "11px 14px", fontSize: 14,
              border: `1.5px solid ${C.border}`, borderRadius: 10,
              outline: "none", boxSizing: "border-box", color: C.textPrimary,
            }}
            onFocus={(e) => (e.target.style.borderColor = accent)}
            onBlur={(e) => (e.target.style.borderColor = C.border)}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "11px 0", borderRadius: 10,
                border: `1.5px solid ${C.border}`, background: "#fff",
                color: C.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              style={{
                flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
                background: isPending || !name.trim() ? `${accent}80` : accent,
                color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: isPending || !name.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {isPending && <Spinner size={15} color="#fff" />}
              {isPending ? "Saving…" : existing ? "Update" : "Add"}
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
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          background: "#fff", width: "100%", maxWidth: 380,
          borderRadius: 16, padding: 24,
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        }}
      >
        <p style={{ margin: "0 0 20px", fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 10,
              border: `1.5px solid ${C.border}`, background: "#fff",
              color: C.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
              background: C.danger, color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {isPending && <Spinner size={15} color="#fff" />}
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field Row (leaf node) ────────────────────────────────────────────────────
function FieldRow({ field, onEdit, onDelete }) {
  return (
    <div
      className="edu-field-row"
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#fff", border: `1.5px solid ${C.fieldBorder}`,
        borderRadius: 10, padding: "10px 14px", marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={field.education_field_name} size={28} bg={C.field} />
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>
          {field.education_field_name}
        </span>
      </div>
      <div style={{ display: "flex", gap: 4 }} className="edu-field-actions">
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
    <div
      style={{
        borderRadius: 14,
        border: `1.5px solid ${expanded ? C.primaryBorder : C.border}`,
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        transition: "border-color 0.2s",
      }}
      className="edu-level-card"
    >
      {/* Level Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 18px", cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryLight)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <ChevronIcon open={expanded} />
        <Avatar name={level.education_level_name} size={42} bg={C.primary} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>
            {level.education_level_name}
          </span>
        </div>
        <Badge variant="level">Level</Badge>

        {/* Action Buttons */}
        <div
          className="edu-level-actions"
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", gap: 4 }}
        >
          <button
            onClick={() => setShowAddField(true)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${C.primaryBorder}`, borderRadius: 8,
              background: "#fff", color: C.primary, cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryLight)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <PlusIcon /> Field
          </button>
          <IconBtn onClick={() => setShowEdit(true)} title="Edit Level"><EditIcon /></IconBtn>
          <IconBtn danger onClick={() => setShowDelete(true)} title="Delete Level"><TrashIcon /></IconBtn>
        </div>
      </div>

      {/* Fields List */}
      {expanded && (
        <div
          style={{
            borderTop: `1.5px solid ${C.primaryBorder}`,
            padding: "14px 18px",
            background: C.fieldBg,
          }}
        >
          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", color: C.textMuted, fontSize: 13 }}>
              <Spinner size={14} color={C.field} /> Loading fields…
            </div>
          ) : fields.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: C.textMuted, padding: "8px 0" }}>
              No fields added yet. Click <strong>+ Field</strong> to add one.
            </p>
          ) : (
            fields.map((field) => (
              <FieldRow
                key={field.id}
                field={field}
                onEdit={(f) => setEditingField(f)}
                onDelete={(f) => setDeletingField(f)}
              />
            ))
          )}
        </div>
      )}

      {/* Level Modals */}
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
        message={`Are you sure you want to delete "${level.education_level_name}"? All associated fields will also be removed.`}
        isPending={deleteLevelMutation.isPending}
      />

      <Modal
        isOpen={showAddField}
        onClose={() => setShowAddField(false)}
        title="Add Education Field"
        placeholder="e.g. Engineering / Technology"
        onSubmit={(name) =>
          addFieldMutation.mutate({ education_field_name: name, education_level_id: level.id })
        }
        isPending={addFieldMutation.isPending}
        accent={C.field}
      />

      {/* Field Edit Modal */}
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

      {/* Field Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingField}
        onClose={() => setDeletingField(null)}
        onConfirm={() => {
          if (deletingField) deleteFieldMutation.mutate(deletingField.id);
          setDeletingField(null);
        }}
        message={`Delete "${deletingField?.education_field_name}"?`}
        isPending={deleteFieldMutation.isPending}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EducationManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddLevel, setShowAddLevel] = useState(false);

  const { data: levels = [], isLoading, isError } = useGetEducationLevels();
  const addLevelMutation = useAddEducationLevel();

  const filtered = levels.filter((l) =>
    l.education_level_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes edu-spin { to { transform: rotate(360deg); } }
        .edu-level-card .edu-level-actions { opacity: 0; transition: opacity 0.15s; }
        .edu-level-card:hover .edu-level-actions { opacity: 1; }
        .edu-field-row .edu-field-actions { opacity: 0; transition: opacity 0.15s; }
        .edu-field-row:hover .edu-field-actions { opacity: 1; }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, padding: "28px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.01em" }}>
              Education Management
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMuted }}>
              Education Level → Field Hierarchy
            </p>
          </div>
          <button
            onClick={() => setShowAddLevel(true)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 18px", borderRadius: 10, border: "none",
              background: C.primary, color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 4px 12px ${C.primary}40`,
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryDark; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = "none"; }}
          >
            <PlusIcon /> Add Level
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search education levels…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%", padding: "11px 16px", fontSize: 14, boxSizing: "border-box",
            border: `1.5px solid ${C.border}`, borderRadius: 12,
            outline: "none", marginBottom: 20, color: C.textPrimary,
            background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.primary)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />

        {/* List */}
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 24, color: C.textMuted, fontSize: 14 }}>
            <Spinner size={18} /> Loading education levels…
          </div>
        ) : isError ? (
          <div style={{ padding: 24, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, color: "#991b1b", fontSize: 14 }}>
            Failed to load data. Please try again.
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: C.textMuted, fontSize: 14 }}>
            {searchTerm ? `No levels matching "${searchTerm}"` : "No education levels yet. Click Add Level to get started."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
        onSubmit={(name) => addLevelMutation.mutate({ education_level_name: name })}
        isPending={addLevelMutation.isPending}
        accent={C.primary}
      />
    </>
  );
}