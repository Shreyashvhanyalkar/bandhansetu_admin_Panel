// // src/pages/admin/BodySkinManagement.jsx
// import { useState, useEffect } from "react";
// import {
//   useGetBodyTypes,
//   useAddBodyType,
//   useEditBodyType,
//   useDeleteBodyType,
//   useGetSkinTones,
//   useAddSkinTone,
//   useEditSkinTone,
//   useDeleteSkinTone,
// } from "../../hooks/useBodySkinManagement";

// const C = {
//   primary: "#c026d3",
//   primaryDark: "#a21caf",
//   primaryLight: "#fdf4ff",
//   primaryBorder: "#f0abfc",
//   danger: "#ef4444",
//   textPrimary: "#1e1b2e",
//   textSecondary: "#5b5266",
//   textMuted: "#a19aa6",
//   border: "#f1eef2",
//   bg: "#faf9fc",
// };

// const TABS = [
//   { key: "body", label: "Body Types", badge: "Body Type" },
//   { key: "skin", label: "Skin Tones", badge: "Skin Tone" },
// ];

// // ─── Icons ────────────────────────────────────────────────────────────────────
// function Spinner({ size = 16, color = C.primary }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
//       style={{ color, animation: "bs-spin 0.8s linear infinite", flexShrink: 0 }}>
//       <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
//       <path fill="currentColor" opacity="0.9" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//     </svg>
//   );
// }

// function IconBtn({ onClick, disabled, danger, title, children }) {
//   return (
//     <button onClick={onClick} disabled={disabled} title={title}
//       style={{
//         width: 32, height: 32, borderRadius: 8, border: "none",
//         background: "transparent", display: "flex", alignItems: "center",
//         justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer",
//         opacity: disabled ? 0.4 : 1, color: "#9ca3af", transition: "all 0.15s",
//       }}
//       onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.color = danger ? "#ef4444" : C.primary; e.currentTarget.style.background = danger ? "#fef2f2" : C.primaryLight; } }}
//       onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "transparent"; }}
//     >
//       {children}
//     </button>
//   );
// }

// const EditIcon = () => (
//   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
//     <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
//   </svg>
// );

// const TrashIcon = () => (
//   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="3 6 5 6 21 6" />
//     <path d="M19 6l-1 14H6L5 6" />
//     <path d="M10 11v6M14 11v6M9 6V4h6v2" />
//   </svg>
// );

// const PlusIcon = () => (
//   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
//     <path d="M12 5v14M5 12h14" />
//   </svg>
// );

// // ─── Modal ────────────────────────────────────────────────────────────────────
// function Modal({ isOpen, onClose, title, placeholder, existingName, onSubmit, isPending }) {
//   const [name, setName] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (isOpen) {
//       setName(existingName || "");
//       setError("");
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const handleSubmit = () => {
//     if (!name.trim()) { setError("This field is required."); return; }
//     onSubmit(name.trim());
//   };

//   return (
//     <div style={{
//       position: "fixed", inset: 0, zIndex: 1000,
//       display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
//       background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
//     }}>
//       <div style={{
//         background: "#fff", width: "100%", maxWidth: 420,
//         borderRadius: 16, overflow: "hidden",
//         boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
//       }}>
//         <div style={{ height: 4, background: C.primary }} />
//         <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
//           <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{title}</h2>
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => { setName(e.target.value); setError(""); }}
//             onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//             placeholder={placeholder}
//             autoFocus
//             style={{
//               width: "100%", padding: "11px 14px", fontSize: 14, boxSizing: "border-box",
//               border: `1.5px solid ${error ? C.danger : C.border}`, borderRadius: 10,
//               outline: "none", color: C.textPrimary, background: "#fafafa",
//               transition: "border-color 0.15s",
//             }}
//             onFocus={(e) => (e.target.style.borderColor = C.primary)}
//             onBlur={(e) => (e.target.style.borderColor = error ? C.danger : C.border)}
//           />
//           {error && <p style={{ margin: 0, fontSize: 12, color: C.danger }}>{error}</p>}
//           <div style={{ display: "flex", gap: 10 }}>
//             <button onClick={onClose} style={{
//               flex: 1, padding: "11px 0", borderRadius: 10,
//               border: `1.5px solid ${C.border}`, background: "#fff",
//               color: C.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer",
//             }}>Cancel</button>
//             <button onClick={handleSubmit} disabled={isPending || !name.trim()} style={{
//               flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
//               background: isPending || !name.trim() ? `${C.primary}70` : C.primary,
//               color: "#fff", fontSize: 14, fontWeight: 600,
//               cursor: isPending || !name.trim() ? "not-allowed" : "pointer",
//               display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
//             }}>
//               {isPending && <Spinner size={15} color="#fff" />}
//               {isPending ? "Saving…" : existingName ? "Update" : "Add"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ConfirmDialog({ isOpen, onClose, onConfirm, message, isPending }) {
//   if (!isOpen) return null;
//   return (
//     <div style={{
//       position: "fixed", inset: 0, zIndex: 1000,
//       display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
//       background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
//     }}>
//       <div style={{
//         background: "#fff", width: "100%", maxWidth: 380,
//         borderRadius: 16, padding: 24,
//         boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
//       }}>
//         <p style={{ margin: "0 0 20px", fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>{message}</p>
//         <div style={{ display: "flex", gap: 10 }}>
//           <button onClick={onClose} style={{
//             flex: 1, padding: "11px 0", borderRadius: 10,
//             border: `1.5px solid ${C.border}`, background: "#fff",
//             color: C.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer",
//           }}>Cancel</button>
//           <button onClick={onConfirm} disabled={isPending} style={{
//             flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
//             background: C.danger, color: "#fff", fontSize: 14, fontWeight: 600,
//             cursor: isPending ? "not-allowed" : "pointer",
//             display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
//           }}>
//             {isPending && <Spinner size={15} color="#fff" />}
//             {isPending ? "Deleting…" : "Delete"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Generic Item Row ─────────────────────────────────────────────────────────
// function ItemRow({ label, badge, rowClass, onEdit, onDelete }) {
//   return (
//     <div className={rowClass} style={{
//       display: "flex", alignItems: "center", gap: 14,
//       padding: "13px 18px", background: "#fff",
//       border: `1.5px solid ${C.border}`, borderRadius: 12,
//       boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.15s",
//     }}
//       onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primaryBorder; e.currentTarget.style.background = C.primaryLight; }}
//       onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "#fff"; }}
//     >
//       <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
//         {label}
//       </span>
//       <span className={`${rowClass}-badge`} style={{
//         padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
//         background: C.primaryLight, color: C.primary,
//         border: `1px solid ${C.primaryBorder}`,
//         letterSpacing: "0.04em", textTransform: "uppercase",
//         transition: "opacity 0.15s",
//       }}>
//         {badge}
//       </span>
//       <div className={`${rowClass}-actions`} style={{ display: "flex", gap: 4, opacity: 0, transition: "opacity 0.15s" }}>
//         <IconBtn onClick={onEdit} title="Edit"><EditIcon /></IconBtn>
//         <IconBtn danger onClick={onDelete} title="Delete"><TrashIcon /></IconBtn>
//       </div>
//     </div>
//   );
// }

// // ─── Section Panel ────────────────────────────────────────────────────────────
// function SectionPanel({ items, isLoading, isError, badge, rowClass, searchTerm, onEdit, onDelete }) {
//   const filtered = items.filter((i) =>
//     (i.body_type || i.skin_tone || "").toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (isLoading) return (
//     <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 24, color: C.textMuted, fontSize: 14 }}>
//       <Spinner size={18} /> Loading…
//     </div>
//   );

//   if (isError) return (
//     <div style={{ padding: 24, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, color: "#991b1b", fontSize: 14 }}>
//       Failed to load data. Please try again.
//     </div>
//   );

//   if (filtered.length === 0) return (
//     <div style={{ textAlign: "center", padding: "48px 24px", color: C.textMuted, fontSize: 14 }}>
//       {searchTerm ? `No results matching "${searchTerm}"` : `No ${badge.toLowerCase()}s yet.`}
//     </div>
//   );

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//       {filtered.map((item) => (
//         <ItemRow
//           key={item.id}
//           label={item.body_type || item.skin_tone}
//           badge={badge}
//           rowClass={rowClass}
//           onEdit={() => onEdit(item)}
//           onDelete={() => onDelete(item)}
//         />
//       ))}
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function BodySkinManagement() {
//   const [activeTab, setActiveTab] = useState("body");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showAdd, setShowAdd] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [deletingItem, setDeletingItem] = useState(null);

//   // Reset search when switching tabs
//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setSearchTerm("");
//   };

//   // Body Type hooks
//   const { data: bodyTypes = [], isLoading: btLoading, isError: btError } = useGetBodyTypes();
//   const addBodyType = useAddBodyType();
//   const editBodyType = useEditBodyType();
//   const deleteBodyType = useDeleteBodyType();

//   // Skin Tone hooks
//   const { data: skinTones = [], isLoading: stLoading, isError: stError } = useGetSkinTones();
//   const addSkinTone = useAddSkinTone();
//   const editSkinTone = useEditSkinTone();
//   const deleteSkinTone = useDeleteSkinTone();

//   const isBody = activeTab === "body";
//   const currentItems = isBody ? bodyTypes : skinTones;
//   const addMutation = isBody ? addBodyType : addSkinTone;
//   const editMutation = isBody ? editBodyType : editSkinTone;
//   const deleteMutation = isBody ? deleteBodyType : deleteSkinTone;
//   const isLoading = isBody ? btLoading : stLoading;
//   const isError = isBody ? btError : stError;
//   const badge = isBody ? "Body Type" : "Skin Tone";
//   const rowClass = isBody ? "bt-row" : "st-row";
//   const addLabel = isBody ? "Add Body Type" : "Add Skin Tone";
//   const placeholder = isBody ? "e.g. Athletic" : "e.g. Wheatish";
//   const count = currentItems.length;

//   const handleAdd = (name) => {
//     const payload = isBody ? { body_type_name: name } : { skin_tone_name: name };
//     addMutation.mutate(payload, { onSuccess: () => setShowAdd(false) });
//   };

//   const handleEdit = (name) => {
//     if (!editingItem) return;
//     const payload = isBody
//       ? { id: editingItem.id, body_type_name: name }
//       : { id: editingItem.id, skin_tone_name: name };
//     editMutation.mutate(payload, { onSuccess: () => setEditingItem(null) });
//   };

//   const handleDelete = () => {
//     if (!deletingItem) return;
//     deleteMutation.mutate(deletingItem.id, { onSuccess: () => setDeletingItem(null) });
//   };

//   const editingName = editingItem
//     ? (editingItem.body_type || editingItem.skin_tone)
//     : "";

//   const deletingName = deletingItem
//     ? (deletingItem.body_type || deletingItem.skin_tone)
//     : "";

//   return (
//     <>
//       <style>{`
//         @keyframes bs-spin { to { transform: rotate(360deg); } }
//         .bt-row:hover .bt-row-actions { opacity: 1 !important; }
//         .bt-row:hover .bt-row-badge { opacity: 0; }
//         .st-row:hover .st-row-actions { opacity: 1 !important; }
//         .st-row:hover .st-row-badge { opacity: 0; }
//       `}</style>

//       <div style={{ minHeight: "100vh", background: C.bg, padding: "28px 24px" }}>

//         {/* Header */}
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
//           <div>
//             <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.01em" }}>
//               Body & Skin Management
//             </h1>
//             <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMuted }}>
//               {count} {badge.toLowerCase()}{count !== 1 ? "s" : ""} configured
//             </p>
//           </div>
//           <button
//             onClick={() => setShowAdd(true)}
//             style={{
//               display: "flex", alignItems: "center", gap: 7,
//               padding: "10px 18px", borderRadius: 10, border: "none",
//               background: C.primary, color: "#fff",
//               fontSize: 13, fontWeight: 700, cursor: "pointer",
//               boxShadow: `0 4px 12px ${C.primary}40`, transition: "background 0.15s, transform 0.15s",
//             }}
//             onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryDark; e.currentTarget.style.transform = "translateY(-1px)"; }}
//             onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = "none"; }}
//           >
//             <PlusIcon /> {addLabel}
//           </button>
//         </div>

//         {/* Tabs */}
//         <div style={{
//           display: "flex", gap: 4, marginBottom: 20,
//           background: "#fff", border: `1.5px solid ${C.border}`,
//           borderRadius: 12, padding: 4,
//           width: "fit-content",
//         }}>
//           {TABS.map((tab) => (
//             <button
//               key={tab.key}
//               onClick={() => handleTabChange(tab.key)}
//               style={{
//                 padding: "8px 20px", borderRadius: 9, border: "none",
//                 fontSize: 13, fontWeight: 600, cursor: "pointer",
//                 transition: "all 0.15s",
//                 background: activeTab === tab.key ? C.primary : "transparent",
//                 color: activeTab === tab.key ? "#fff" : C.textMuted,
//                 boxShadow: activeTab === tab.key ? `0 2px 8px ${C.primary}35` : "none",
//               }}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* Search */}
//         <input
//           type="text"
//           placeholder={`Search ${badge.toLowerCase()}s…`}
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={{
//             width: "100%", padding: "11px 16px", fontSize: 14, boxSizing: "border-box",
//             border: `1.5px solid ${C.border}`, borderRadius: 12, outline: "none",
//             marginBottom: 20, color: C.textPrimary, background: "#fff",
//             boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
//           }}
//           onFocus={(e) => (e.target.style.borderColor = C.primary)}
//           onBlur={(e) => (e.target.style.borderColor = C.border)}
//         />

//         {/* List */}
//         <SectionPanel
//           items={currentItems}
//           isLoading={isLoading}
//           isError={isError}
//           badge={badge}
//           rowClass={rowClass}
//           searchTerm={searchTerm}
//           onEdit={(item) => setEditingItem(item)}
//           onDelete={(item) => setDeletingItem(item)}
//         />
//       </div>

//       {/* Add Modal */}
//       <Modal
//         isOpen={showAdd}
//         onClose={() => setShowAdd(false)}
//         title={addLabel}
//         placeholder={placeholder}
//         existingName={null}
//         onSubmit={handleAdd}
//         isPending={addMutation.isPending}
//       />

//       {/* Edit Modal */}
//       <Modal
//         isOpen={!!editingItem}
//         onClose={() => setEditingItem(null)}
//         title={`Edit ${badge}`}
//         placeholder={placeholder}
//         existingName={editingName}
//         onSubmit={handleEdit}
//         isPending={editMutation.isPending}
//       />

//       {/* Delete Confirm */}
//       <ConfirmDialog
//         isOpen={!!deletingItem}
//         onClose={() => setDeletingItem(null)}
//         onConfirm={handleDelete}
//         message={`Are you sure you want to delete "${deletingName}"?`}
//         isPending={deleteMutation.isPending}
//       />
//     </>
//   );
// }