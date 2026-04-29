// src/pages/admin/IncomeManagement.jsx
import { useState, useEffect } from "react";
import {
  useGetIncomes,
  useAddIncome,
  useEditIncome,
  useDeleteIncome,
} from "../../hooks/useIncomeManagement";

const C = {
  primary: "#c026d3",
  primaryDark: "#a21caf",
  primaryLight: "#fdf4ff",
  primaryBorder: "#f0abfc",
  danger: "#ef4444",
  textPrimary: "#1e1b2e",
  textSecondary: "#5b5266",
  textMuted: "#a19aa6",
  border: "#f1eef2",
  bg: "#faf9fc",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = C.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ color, animation: "inc-spin 0.8s linear infinite", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path fill="currentColor" opacity="0.9" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function IconBtn({ onClick, disabled, danger, title, children }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      style={{
        width: 32, height: 32, borderRadius: 8, border: "none",
        background: "transparent", display: "flex", alignItems: "center",
        justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1, color: "#9ca3af", transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.color = danger ? "#ef4444" : C.primary; e.currentTarget.style.background = danger ? "#fef2f2" : C.primaryLight; } }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
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

// ─── Modal (income_label + sort_order) ───────────────────────────────────────
function Modal({ isOpen, onClose, title, existing, onSubmit, isPending }) {
  const [label, setLabel] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLabel(existing?.income_label || "");
      setSortOrder(existing?.sort_order !== undefined ? String(existing.sort_order) : "");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!label.trim()) { setError("Income label is required."); return; }
    if (sortOrder === "" || isNaN(Number(sortOrder))) { setError("Sort order must be a valid number."); return; }
    onSubmit({ income_label: label.trim(), sort_order: Number(sortOrder) });
  };

  const inputStyle = (focused) => ({
    width: "100%", padding: "11px 14px", fontSize: 14, boxSizing: "border-box",
    border: `1.5px solid ${error ? C.danger : C.border}`, borderRadius: 10,
    outline: "none", color: C.textPrimary, background: "#fafafa",
    transition: "border-color 0.15s",
  });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
    }}>
      <div style={{
        background: "#fff", width: "100%", maxWidth: 420,
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
      }}>
        <div style={{ height: 4, background: C.primary }} />
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{title}</h2>

          {/* Income Label */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6 }}>
              Income Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => { setLabel(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. 2 - 4 Lakh"
              autoFocus
              style={inputStyle()}
              onFocus={(e) => (e.target.style.borderColor = C.primary)}
              onBlur={(e) => (e.target.style.borderColor = error ? C.danger : C.border)}
            />
          </div>

          {/* Sort Order */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6 }}>
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. 3"
              min="1"
              style={inputStyle()}
              onFocus={(e) => (e.target.style.borderColor = C.primary)}
              onBlur={(e) => (e.target.style.borderColor = error ? C.danger : C.border)}
            />
          </div>

          {error && <p style={{ margin: 0, fontSize: 12, color: C.danger }}>{error}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "11px 0", borderRadius: 10,
              border: `1.5px solid ${C.border}`, background: "#fff",
              color: C.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Cancel</button>
            <button onClick={handleSubmit} disabled={isPending || !label.trim()} style={{
              flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
              background: isPending || !label.trim() ? `${C.primary}70` : C.primary,
              color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: isPending || !label.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
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
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
    }}>
      <div style={{
        background: "#fff", width: "100%", maxWidth: 380,
        borderRadius: 16, padding: 24,
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
      }}>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 0", borderRadius: 10,
            border: `1.5px solid ${C.border}`, background: "#fff",
            color: C.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} disabled={isPending} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
            background: C.danger, color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: isPending ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {isPending && <Spinner size={15} color="#fff" />}
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Income Row ───────────────────────────────────────────────────────────────
function IncomeRow({ income, onEdit, onDelete }) {
  return (
    <div className="inc-row" style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "13px 18px", background: "#fff",
      border: `1.5px solid ${C.border}`, borderRadius: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.15s",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.primaryBorder;
        e.currentTarget.style.background = C.primaryLight;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.background = "#fff";
      }}
    >
      {/* Sort Order Badge */}
      <span style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: C.primaryLight, border: `1.5px solid ${C.primaryBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: C.primary,
      }}>
        {String(income.sort_order).padStart(2, "0")}
      </span>

      {/* Label */}
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
        {income.income_label}
      </span>

      {/* Badge */}
      <span className="inc-badge" style={{
        padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
        background: C.primaryLight, color: C.primary,
        border: `1px solid ${C.primaryBorder}`,
        letterSpacing: "0.04em", textTransform: "uppercase",
        transition: "opacity 0.15s",
      }}>
        Income
      </span>

      {/* Actions */}
      <div className="inc-actions" style={{ display: "flex", gap: 4, opacity: 0, transition: "opacity 0.15s" }}>
        <IconBtn onClick={() => onEdit(income)} title="Edit"><EditIcon /></IconBtn>
        <IconBtn danger onClick={() => onDelete(income)} title="Delete"><TrashIcon /></IconBtn>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function IncomeManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [deletingIncome, setDeletingIncome] = useState(null);

  const { data: incomes = [], isLoading, isError } = useGetIncomes();
  const addMutation = useAddIncome();
  const editMutation = useEditIncome();
  const deleteMutation = useDeleteIncome();

  const filtered = incomes
    .filter((i) => i.income_label.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.sort_order - b.sort_order);

  const handleAdd = ({ income_label, sort_order }) => {
    addMutation.mutate({ income_label, sort_order }, { onSuccess: () => setShowAdd(false) });
  };

  const handleEdit = ({ income_label, sort_order }) => {
    if (!editingIncome) return;
    editMutation.mutate(
      { id: editingIncome.id, income_label, sort_order },
      { onSuccess: () => setEditingIncome(null) }
    );
  };

  const handleDelete = () => {
    if (!deletingIncome) return;
    deleteMutation.mutate(deletingIncome.id, { onSuccess: () => setDeletingIncome(null) });
  };

  return (
    <>
      <style>{`
        @keyframes inc-spin { to { transform: rotate(360deg); } }
        .inc-row:hover .inc-actions { opacity: 1 !important; }
        .inc-row:hover .inc-badge { opacity: 0; }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, padding: "28px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.01em" }}>
              Income Management
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMuted }}>
              {incomes.length} income range{incomes.length !== 1 ? "s" : ""} configured
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 18px", borderRadius: 10, border: "none",
              background: C.primary, color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 4px 12px ${C.primary}40`, transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryDark; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = "none"; }}
          >
            <PlusIcon /> Add Income Range
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search income ranges…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%", padding: "11px 16px", fontSize: 14, boxSizing: "border-box",
            border: `1.5px solid ${C.border}`, borderRadius: 12, outline: "none",
            marginBottom: 20, color: C.textPrimary, background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.primary)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />

        {/* List */}
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 24, color: C.textMuted, fontSize: 14 }}>
            <Spinner size={18} /> Loading income ranges…
          </div>
        ) : isError ? (
          <div style={{ padding: 24, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, color: "#991b1b", fontSize: 14 }}>
            Failed to load data. Please try again.
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: C.textMuted, fontSize: 14 }}>
            {searchTerm ? `No income ranges matching "${searchTerm}"` : "No income ranges yet. Click Add Income Range to get started."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((income) => (
              <IncomeRow
                key={income.id}
                income={income}
                onEdit={(i) => setEditingIncome(i)}
                onDelete={(i) => setDeletingIncome(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Income Range"
        onSubmit={handleAdd}
        isPending={addMutation.isPending}
      />

      <Modal
        isOpen={!!editingIncome}
        onClose={() => setEditingIncome(null)}
        title="Edit Income Range"
        existing={editingIncome}
        onSubmit={handleEdit}
        isPending={editMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deletingIncome}
        onClose={() => setDeletingIncome(null)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete "${deletingIncome?.income_label}"?`}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}