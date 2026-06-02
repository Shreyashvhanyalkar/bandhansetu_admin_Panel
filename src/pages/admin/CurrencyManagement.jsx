// // src/pages/admin/CurrencyManagement.jsx
// import { useState } from "react";
// import {
//   useGetCurrencies,
//   useAddCurrency,
//   useEditCurrency,
//   useDeleteCurrency,
// } from "../../hooks/useCurrencyManagement";

// // ─── Design Tokens (Updated to Burgundy/Red theme) ────────────────────────────
// const C = {
//   primary: "#bd201c",        // Red 600
//   primaryDark: "#601000",    // Burgundy
//   primaryLight: "#fef2f2",   // red-50
//   primaryBorder: "#fca5a5",  // red-300
//   danger: "#dc2626",
//   dangerLight: "#fef2f2",
//   textPrimary: "#111827",
//   textSecondary: "#4b5563",
//   textMuted: "#9ca3af",
//   border: "#e5e7eb",
//   card: "#ffffff",
//   shadow: "0 1px 2px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.06)",
// };

// // Helper: get initials from name
// const initials = (name = "") =>
//   name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

// // ─── SVGs ─────────────────────────────────────────────────────────────────────
// const Icons = {
//   Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>,
// };

// // ─── Reusable Components ─────────────────────────────────────────────────────
// function Spinner({ size = 16, color = C.primary }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color }}>
//       <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
//       <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//     </svg>
//   );
// }

// function IconBtn({ onClick, disabled, danger, title, children }) {
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       title={title}
//       className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shadow-sm border
//         ${danger ? "border-red-100 text-red-500 bg-white hover:bg-red-50 hover:border-red-200" : "border-gray-100 text-gray-500 bg-white hover:text-[#bd201c] hover:bg-[#fef2f2] hover:border-[#fca5a5]"}`}
//     >
//       {children}
//     </button>
//   );
// }

// function Avatar({ name, size = 36, bg = C.primary }) {
//   return (
//     <span
//       className="rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm"
//       style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${C.primaryDark})`, fontSize: size * 0.36 }}
//     >
//       {initials(name)}
//     </span>
//   );
// }

// function Badge({ children, variant = "default" }) {
//   const variants = {
//     primary: "bg-[#fef2f2] text-[#bd201c] border border-[#fca5a5]",
//     default: "bg-gray-100 text-gray-600 border border-gray-200",
//   };
//   return <span className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg ${variants[variant] || variants.default}`}>{children}</span>;
// }

// const EditIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
//     <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
//     <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
//   </svg>
// );

// const TrashIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
//     <polyline points="3 6 5 6 21 6" />
//     <path d="M19 6l-1 14H6L5 6" />
//     <path d="M10 11v6M14 11v6" />
//   </svg>
// );

// const PlusIcon = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//     <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
//   </svg>
// );

// // ─── Modal & ConfirmDialog ───────────────────────────────────────────────────
// function Modal({ isOpen, onClose, title, placeholder, existing, onSubmit, isPending, accent = C.primary }) {
//   const [name, setName] = useState(existing?.name || "");

//   if (!isOpen) return null;

//   const handleSubmit = () => {
//     if (!name.trim()) return;
//     onSubmit(name.trim());
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
//       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
//         <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${C.primaryDark})` }} />
//         <div className="p-6 sm:p-8 space-y-6">
//           <h2 className="text-xl font-bold text-gray-900">{title}</h2>
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//             placeholder={placeholder}
//             className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#bd201c] focus:ring-4 focus:ring-[#fef2f2] transition-all text-gray-800 font-medium"
//             autoFocus
//           />
//           <div className="flex gap-3 pt-2">
//             <button onClick={onClose} className="flex-1 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
//             <button
//               onClick={handleSubmit}
//               disabled={isPending || !name.trim()}
//               className="flex-1 py-3 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
//               style={{ background: accent }}
//             >
//               {isPending && <Spinner size={16} color="#fff" />}
//               {isPending ? "Saving..." : existing ? "Update" : "Add Currency"}
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
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
//       <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
//         <div className="h-1.5 w-full bg-red-600" />
//         <div className="p-6 sm:p-8">
//           <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
//             <TrashIcon />
//           </div>
//           <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Currency</h3>
//           <p className="text-sm text-gray-500 leading-relaxed mb-8">{message}</p>
//           <div className="flex gap-3">
//             <button onClick={onClose} className="flex-1 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
//             <button
//               onClick={onConfirm}
//               disabled={isPending}
//               className="flex-1 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-md"
//             >
//               {isPending ? <Spinner size={16} color="#fff" /> : "Yes, Delete"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Currency Card ───────────────────────────────────────────────────────────
// function CurrencyCard({ currency, onEdit, onDelete }) {
//   const [showEdit, setShowEdit] = useState(false);
//   const [showDelete, setShowDelete] = useState(false);

//   const editMutation = useEditCurrency();
//   const deleteMutation = useDeleteCurrency();

//   const handleEdit = (name) => {
//     editMutation.mutate(
//       { id: currency.id, currency_type: name },
//       { onSuccess: () => { setShowEdit(false); onEdit?.(); } }
//     );
//   };

//   const handleDelete = () => {
//     deleteMutation.mutate(currency.id, {
//       onSuccess: () => { setShowDelete(false); onDelete?.(); },
//     });
//   };

//   return (
//     <div className="group rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-[#fca5a5] transition-all duration-300 flex flex-col">
//       {/* Card top accent */}
//       <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, #bd201c, #601000)` }} />

//       <div className="flex flex-col items-center text-center p-5 flex-1 gap-3">
//         <Avatar name={currency.currency_type} size={52} bg={C.primary} />
//         <p className="text-base font-bold text-gray-900 leading-tight">{currency.currency_type}</p>
//         <Badge variant="primary">Currency</Badge>
//       </div>

//       {/* Action Row */}
//       <div className="flex border-t border-gray-100">
//         <button
//           onClick={() => setShowEdit(true)}
//           className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-gray-600 hover:text-[#bd201c] hover:bg-[#fef2f2] transition-colors border-r border-gray-100"
//         >
//           <EditIcon /> Edit
//         </button>
//         <button
//           onClick={() => setShowDelete(true)}
//           className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
//         >
//           <TrashIcon /> Delete
//         </button>
//       </div>

//       <Modal
//         isOpen={showEdit}
//         onClose={() => setShowEdit(false)}
//         title="Edit Currency"
//         placeholder="Currency name (e.g., USD - US Dollar)"
//         existing={{ name: currency.currency_type }}
//         onSubmit={handleEdit}
//         isPending={editMutation.isPending}
//         accent={C.primary}
//       />

//       <ConfirmDialog
//         isOpen={showDelete}
//         onClose={() => setShowDelete(false)}
//         onConfirm={handleDelete}
//         message={`Are you sure you want to delete "${currency.currency_type}"? This cannot be undone.`}
//         isPending={deleteMutation.isPending}
//       />
//     </div>
//   );
// }

// // ─── Skeleton Loader ─────────────────────────────────────────────────────────
// function SkeletonCard() {
//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm flex flex-col animate-pulse">
//       <div className="h-1 bg-gray-200 w-full" />
//       <div className="flex flex-col items-center p-5 gap-3">
//         <div className="w-[52px] h-[52px] rounded-xl bg-gray-200" />
//         <div className="h-4 w-28 bg-gray-200 rounded" />
//         <div className="h-6 w-20 bg-gray-100 rounded-lg" />
//       </div>
//       <div className="flex border-t border-gray-100">
//         <div className="flex-1 h-10 bg-gray-50" />
//         <div className="flex-1 h-10 bg-gray-50 border-l border-gray-100" />
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ──────────────────────────────────────────────────────────
// export default function CurrencyManagement() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showAdd, setShowAdd] = useState(false);
//   const [toastMessage, setToastMessage] = useState(null);

//   const { data: currencies = [], isLoading, isError, refetch } = useGetCurrencies();
//   const addMutation = useAddCurrency();

//   const filtered = currencies.filter((c) =>
//     c.currency_type.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const showToast = (message, isError = false) => {
//     setToastMessage({ message, isError });
//     setTimeout(() => setToastMessage(null), 3000);
//   };

//   const handleAdd = (name) => {
//     addMutation.mutate(
//       { currency_type: name },
//       {
//         onSuccess: () => {
//           setShowAdd(false);
//           showToast("Currency added successfully.");
//         },
//         onError: (err) => showToast(err.message || "Failed to add currency", true),
//       }
//     );
//   };

//   return (
//     <div className="min-h-screen font-sans bg-slate-50 p-4 sm:p-8">
//       {/* Toast Notification */}
//       {toastMessage && (
//         <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-top-2 fade-in duration-200">
//           <div className={`px-5 py-3.5 rounded-xl shadow-xl text-sm font-bold flex items-center gap-3 border ${toastMessage.isError ? "bg-red-50 text-red-700 border-red-200" : "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]"}`}>
//             <span className="text-lg">{toastMessage.isError ? "✕" : "✓"}</span>
//             {toastMessage.message}
//           </div>
//         </div>
//       )}

//       <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
//         {/* Header */}
//         <div className="flex justify-between items-end flex-wrap gap-4">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Currency Management</h1>
//             <p className="text-sm text-gray-500 mt-1">Manage global currency options used across user profiles.</p>
//           </div>
//           <button
//             onClick={() => setShowAdd(true)}
//             className="px-6 py-3 bg-gradient-to-r from-[#601000] to-[#bd201c] hover:from-[#4a0c00] hover:to-[#9C0425] text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
//           >
//             <PlusIcon /> Add Currency
//           </button>
//         </div>

//         {/* Toolbar */}
//         <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
//           <div className="relative w-full group">
//             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#bd201c] transition-colors">
//               <Icons.Search />
//             </span>
//             <input
//               type="text"
//               placeholder="Search currencies..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-[#fca5a5] focus:ring-4 focus:ring-[#fef2f2]"
//             />
//           </div>

//           {/* Stats Badge */}
//           {!isLoading && !isError && currencies.length > 0 && (
//             <div className="shrink-0 flex items-center gap-2 border-l border-gray-200 pl-4 hidden sm:flex">
//               <div className="px-4 py-2 bg-[#fef2f2] text-[#bd201c] rounded-xl text-xs font-bold border border-[#fca5a5]">
//                 Total: {currencies.length}
//               </div>
//               {searchTerm && (
//                 <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold border border-gray-200">
//                   Matches: {filtered.length}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Content */}
//         {isLoading ? (
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//             {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
//           </div>
//         ) : isError ? (
//           <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200 shadow-sm">
//             <div className="text-4xl mb-3">⚠️</div>
//             <p className="text-red-800 font-bold text-lg mb-1">Failed to load currencies</p>
//             <p className="text-red-600 text-sm mb-4">There was an error communicating with the server.</p>
//             <button
//               onClick={() => refetch()}
//               className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
//             >
//               Try Again
//             </button>
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
//             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">💱</div>
//             <p className="text-gray-900 font-bold text-lg">
//               {searchTerm ? "No currencies match your search" : "No currencies found"}
//             </p>
//             <p className="text-gray-500 text-sm mt-1">
//               {searchTerm ? "Try adjusting your search keyword." : "Click 'Add Currency' to create your first one."}
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//             {filtered.map((currency) => (
//               <CurrencyCard
//                 key={currency.id}
//                 currency={currency}
//                 onEdit={() => showToast("Currency updated successfully")}
//                 onDelete={() => showToast("Currency deleted successfully")}
//               />
//             ))}
//           </div>
//         )}

//         {/* Add Modal */}
//         <Modal
//           isOpen={showAdd}
//           onClose={() => setShowAdd(false)}
//           title="Add New Currency"
//           placeholder="e.g., USD - US Dollar"
//           onSubmit={handleAdd}
//           isPending={addMutation.isPending}
//           accent={C.primary}
//         />
//       </div>

//       {/* Global CSS for animations */}
//       <style>{`
//         @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
//         .animate-scaleIn { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
//       `}</style>
//     </div>
//   );
// }