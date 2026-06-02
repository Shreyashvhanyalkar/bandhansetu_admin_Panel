// src/pages/admin/WorkingCatagory.jsx
import { useState, useEffect } from "react";
import {
  useGetWorkingCategories,
  useAddWorkingCategory,
  useEditWorkingCategory,
  useDeleteWorkingCategory,
  useGetWorkingSubcategories,
  useAddWorkingSubcategory,
  useEditWorkingSubcategory,
  useDeleteWorkingSubcategory,
  useGetWorkingWith,
  useAddWorkingWith,
  useEditWorkingWith,
  useDeleteWorkingWith,
} from "../../hooks/useWorkingCategory";

const C = {
  primary: "#c026d3",
  primaryDark: "#a21caf",
  primaryLight: "#fdf4ff",
  primaryBorder: "#f0abfc",
  sub: "#0891b2",
  subBg: "#ecfeff",
  subBorder: "#a5f3fc",
  danger: "#ef4444",
  textPrimary: "#1e1b2e",
  textSecondary: "#5b5266",
  textMuted: "#a19aa6",
  border: "#f1eef2",
  bg: "#faf9fc",
};

const TABS = [
  { key: "category", label: "Working Category" },
  { key: "with", label: "Working With" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = C.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ color, animation: "wc-spin 0.8s linear infinite", flexShrink: 0 }}>
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

function Avatar({ name = "", size = 36, bg = C.primary }) {
  const initials = name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
  return (
    <span style={{
      width: size, height: size, borderRadius: 10, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, color: "#fff", fontSize: size * 0.36,
      background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
    }}>
      {initials}
    </span>
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

function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "rotate(0deg)", color: C.textMuted, flexShrink: 0 }}>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, placeholder, existingName, onSubmit, isPending, accent = C.primary }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) { setName(existingName || ""); setError(""); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) { setError("This field is required."); return; }
    onSubmit(name.trim());
  };

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
        <div style={{ height: 4, background: accent }} />
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{title}</h2>
          <input
            type="text" value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={placeholder} autoFocus
            style={{
              width: "100%", padding: "11px 14px", fontSize: 14, boxSizing: "border-box",
              border: `1.5px solid ${error ? C.danger : C.border}`, borderRadius: 10,
              outline: "none", color: C.textPrimary, background: "#fafafa",
            }}
            onFocus={(e) => (e.target.style.borderColor = accent)}
            onBlur={(e) => (e.target.style.borderColor = error ? C.danger : C.border)}
          />
          {error && <p style={{ margin: 0, fontSize: 12, color: C.danger }}>{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "11px 0", borderRadius: 10,
              border: `1.5px solid ${C.border}`, background: "#fff",
              color: C.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Cancel</button>
            <button onClick={handleSubmit} disabled={isPending || !name.trim()} style={{
              flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
              background: isPending || !name.trim() ? `${accent}70` : accent,
              color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: isPending || !name.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {isPending && <Spinner size={15} color="#fff" />}
              {isPending ? "Saving…" : existingName ? "Update" : "Add"}
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
        borderRadius: 16, padding: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
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

// ─── Subcategory Row ──────────────────────────────────────────────────────────
function SubcategoryRow({ sub, onEdit, onDelete }) {
  return (
    <div className="wc-sub-row" style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "#fff", border: `1.5px solid ${C.subBorder}`,
      borderRadius: 10, padding: "10px 14px", marginBottom: 8,
      transition: "all 0.15s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.sub; e.currentTarget.style.background = C.subBg; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.subBorder; e.currentTarget.style.background = "#fff"; }}
    >
      <Avatar name={sub.subcategory_name} size={28} bg={C.sub} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.textPrimary }}>
        {sub.subcategory_name}
      </span>
      <div className="wc-sub-actions" style={{ display: "flex", gap: 4, opacity: 0, transition: "opacity 0.15s" }}>
        <IconBtn onClick={() => onEdit(sub)} title="Edit"><EditIcon /></IconBtn>
        <IconBtn danger onClick={() => onDelete(sub)} title="Delete"><TrashIcon /></IconBtn>
      </div>
    </div>
  );
}

// ─── Category Card (expandable) ───────────────────────────────────────────────
function CategoryCard({ category }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [deletingSub, setDeletingSub] = useState(null);

  const editCatMutation = useEditWorkingCategory();
  const deleteCatMutation = useDeleteWorkingCategory();
  const addSubMutation = useAddWorkingSubcategory();
  const editSubMutation = useEditWorkingSubcategory();
  const deleteSubMutation = useDeleteWorkingSubcategory();

  const { data: subcategories = [], isLoading } = useGetWorkingSubcategories(
    expanded ? category.id : null
  );

  return (
    <div className="wc-cat-card" style={{
      borderRadius: 14, border: `1.5px solid ${expanded ? C.primaryBorder : C.border}`,
      background: "#fff", overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "border-color 0.2s",
    }}>
      {/* Category Header */}
      <div onClick={() => setExpanded(!expanded)} style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 18px", cursor: "pointer", transition: "background 0.15s",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryLight)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <ChevronIcon open={expanded} />
        <Avatar name={category.category_name} size={42} bg={C.primary} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>
            {category.category_name}
          </span>
        </div>
        <span style={{
          padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
          background: C.primaryLight, color: C.primary, border: `1px solid ${C.primaryBorder}`,
          letterSpacing: "0.04em", textTransform: "uppercase",
        }}>Category</span>

        {/* Actions */}
        <div className="wc-cat-actions" onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setShowAddSub(true)} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 12px", fontSize: 12, fontWeight: 600,
            border: `1.5px solid ${C.primaryBorder}`, borderRadius: 8,
            background: "#fff", color: C.primary, cursor: "pointer", transition: "background 0.15s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryLight)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <PlusIcon /> Sub
          </button>
          <IconBtn onClick={() => setShowEdit(true)} title="Edit Category"><EditIcon /></IconBtn>
          <IconBtn danger onClick={() => setShowDelete(true)} title="Delete Category"><TrashIcon /></IconBtn>
        </div>
      </div>

      {/* Subcategories */}
      {expanded && (
        <div style={{
          borderTop: `1.5px solid ${C.primaryBorder}`,
          padding: "14px 18px", background: C.subBg,
        }}>
          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.textMuted, fontSize: 13 }}>
              <Spinner size={14} color={C.sub} /> Loading subcategories…
            </div>
          ) : subcategories.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>
              No subcategories yet. Click <strong>+ Sub</strong> to add one.
            </p>
          ) : (
            subcategories.map((sub) => (
              <SubcategoryRow
                key={sub.id}
                sub={sub}
                onEdit={(s) => setEditingSub(s)}
                onDelete={(s) => setDeletingSub(s)}
              />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)}
        title="Edit Working Category" placeholder="e.g. IT / Software"
        existingName={category.category_name}
        onSubmit={(name) => editCatMutation.mutate({ id: category.id, category_name: name }, { onSuccess: () => setShowEdit(false) })}
        isPending={editCatMutation.isPending} accent={C.primary} />

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)}
        onConfirm={() => deleteCatMutation.mutate(category.id, { onSuccess: () => setShowDelete(false) })}
        message={`Delete "${category.category_name}"? All subcategories will also be removed.`}
        isPending={deleteCatMutation.isPending} />

      <Modal isOpen={showAddSub} onClose={() => setShowAddSub(false)}
        title="Add Subcategory" placeholder="e.g. Software Engineer"
        existingName={null}
        onSubmit={(name) => addSubMutation.mutate({ subcategory_name: name, category_id: category.id }, { onSuccess: () => setShowAddSub(false) })}
        isPending={addSubMutation.isPending} accent={C.sub} />

      <Modal isOpen={!!editingSub} onClose={() => setEditingSub(null)}
        title="Edit Subcategory" placeholder="Subcategory Name"
        existingName={editingSub?.subcategory_name}
        onSubmit={(name) => editSubMutation.mutate({ id: editingSub.id, subcategory_name: name }, { onSuccess: () => setEditingSub(null) })}
        isPending={editSubMutation.isPending} accent={C.sub} />

      <ConfirmDialog isOpen={!!deletingSub} onClose={() => setDeletingSub(null)}
        onConfirm={() => deleteSubMutation.mutate(deletingSub.id, { onSuccess: () => setDeletingSub(null) })}
        message={`Delete "${deletingSub?.subcategory_name}"?`}
        isPending={deleteSubMutation.isPending} />
    </div>
  );
}

// ─── Working With Row ─────────────────────────────────────────────────────────
function WorkingWithRow({ item, onEdit, onDelete }) {
  return (
    <div className="ww-row" style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "13px 18px", background: "#fff",
      border: `1.5px solid ${C.border}`, borderRadius: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.15s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primaryBorder; e.currentTarget.style.background = C.primaryLight; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "#fff"; }}
    >
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
        {item.working_with_name}
      </span>
      <span className="ww-badge" style={{
        padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
        background: C.primaryLight, color: C.primary, border: `1px solid ${C.primaryBorder}`,
        letterSpacing: "0.04em", textTransform: "uppercase", transition: "opacity 0.15s",
      }}>Working With</span>
      <div className="ww-actions" style={{ display: "flex", gap: 4, opacity: 0, transition: "opacity 0.15s" }}>
        <IconBtn onClick={() => onEdit(item)} title="Edit"><EditIcon /></IconBtn>
        <IconBtn danger onClick={() => onDelete(item)} title="Delete"><TrashIcon /></IconBtn>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorkingCatagory() {
  const [activeTab, setActiveTab] = useState("category");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const handleTabChange = (tab) => { setActiveTab(tab); setSearchTerm(""); };

  // Category hooks
  const { data: categories = [], isLoading: catLoading, isError: catError } = useGetWorkingCategories();
  const addCategoryMutation = useAddWorkingCategory();

  // Working With hooks
  const { data: workingWithList = [], isLoading: wwLoading, isError: wwError } = useGetWorkingWith();
  const addWithMutation = useAddWorkingWith();
  const editWithMutation = useEditWorkingWith();
  const deleteWithMutation = useDeleteWorkingWith();

  const isCategory = activeTab === "category";

  const filteredCategories = categories.filter((c) =>
    c.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredWith = workingWithList.filter((w) =>
    w.working_with_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (name) => {
    if (isCategory) {
      addCategoryMutation.mutate({ category_name: name }, { onSuccess: () => setShowAdd(false) });
    } else {
      addWithMutation.mutate({ working_with_name: name }, { onSuccess: () => setShowAdd(false) });
    }
  };

  const handleEditWith = (name) => {
    if (!editingItem) return;
    editWithMutation.mutate({ id: editingItem.id, working_with_name: name }, { onSuccess: () => setEditingItem(null) });
  };

  const handleDeleteWith = () => {
    if (!deletingItem) return;
    deleteWithMutation.mutate(deletingItem.id, { onSuccess: () => setDeletingItem(null) });
  };

  const isLoading = isCategory ? catLoading : wwLoading;
  const isError = isCategory ? catError : wwError;
  const addMutation = isCategory ? addCategoryMutation : addWithMutation;
  const count = isCategory ? categories.length : workingWithList.length;

  return (
    <>
      <style>{`
        @keyframes wc-spin { to { transform: rotate(360deg); } }
        .wc-cat-card .wc-cat-actions { opacity: 0; transition: opacity 0.15s; }
        .wc-cat-card:hover .wc-cat-actions { opacity: 1; }
        .wc-sub-row:hover .wc-sub-actions { opacity: 1 !important; }
        .ww-row:hover .ww-actions { opacity: 1 !important; }
        .ww-row:hover .ww-badge { opacity: 0; }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, padding: "28px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.01em" }}>
              Working Management
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMuted }}>
              {count} {isCategory ? "categor" + (count !== 1 ? "ies" : "y") : "working with option" + (count !== 1 ? "s" : "")} configured
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 10, border: "none",
            background: C.primary, color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            boxShadow: `0 4px 12px ${C.primary}40`, transition: "background 0.15s, transform 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryDark; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = "none"; }}
          >
            <PlusIcon /> {isCategory ? "Add Category" : "Add Working With"}
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 20,
          background: "#fff", border: `1.5px solid ${C.border}`,
          borderRadius: 12, padding: 4, width: "fit-content",
        }}>
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
              padding: "8px 20px", borderRadius: 9, border: "none",
              fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              background: activeTab === tab.key ? C.primary : "transparent",
              color: activeTab === tab.key ? "#fff" : C.textMuted,
              boxShadow: activeTab === tab.key ? `0 2px 8px ${C.primary}35` : "none",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={isCategory ? "Search categories…" : "Search working with…"}
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

        {/* Content */}
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 24, color: C.textMuted, fontSize: 14 }}>
            <Spinner size={18} /> Loading…
          </div>
        ) : isError ? (
          <div style={{ padding: 24, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, color: "#991b1b", fontSize: 14 }}>
            Failed to load data. Please try again.
          </div>
        ) : isCategory ? (
          filteredCategories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: C.textMuted, fontSize: 14 }}>
              {searchTerm ? `No categories matching "${searchTerm}"` : "No categories yet."}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredCategories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )
        ) : (
          filteredWith.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: C.textMuted, fontSize: 14 }}>
              {searchTerm ? `No results matching "${searchTerm}"` : "No working with options yet."}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredWith.map((item) => (
                <WorkingWithRow
                  key={item.id}
                  item={item}
                  onEdit={(i) => setEditingItem(i)}
                  onDelete={(i) => setDeletingItem(i)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAdd} onClose={() => setShowAdd(false)}
        title={isCategory ? "Add Working Category" : "Add Working With"}
        placeholder={isCategory ? "e.g. IT / Software" : "e.g. Private Company"}
        existingName={null}
        onSubmit={handleAdd}
        isPending={addMutation.isPending}
        accent={C.primary}
      />

      {/* Working With Edit Modal */}
      <Modal
        isOpen={!!editingItem} onClose={() => setEditingItem(null)}
        title="Edit Working With"
        placeholder="Working With Name"
        existingName={editingItem?.working_with_name}
        onSubmit={handleEditWith}
        isPending={editWithMutation.isPending}
        accent={C.primary}
      />

      {/* Working With Delete */}
      <ConfirmDialog
        isOpen={!!deletingItem} onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteWith}
        message={`Are you sure you want to delete "${deletingItem?.working_with_name}"?`}
        isPending={deleteWithMutation.isPending}
      />
    </>
  );
}