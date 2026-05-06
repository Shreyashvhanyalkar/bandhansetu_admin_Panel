// src/pages/admin/CurrencyManagement.jsx
import { useState } from "react";
import {
  useGetCurrencies,
  useAddCurrency,
  useEditCurrency,
  useDeleteCurrency,
} from "../../hooks/useCurrencyManagement";

// ─── Design Tokens (matched to previous management pages) ────────────────────
const C = {
  primary: "#c026d3",        // fuchsia-600
  primaryDark: "#a21caf",    // fuchsia-700
  primaryLight: "#fdf4ff",   // fuchsia-50
  primaryBorder: "#f0abfc",  // fuchsia-200
  danger: "#ef4444",
  dangerLight: "#fef2f2",
  textPrimary: "#1e1b2e",
  textSecondary: "#5b5266",
  textMuted: "#a19aa6",
  border: "#f1eef2",
  card: "#ffffff",
  shadow: "0 1px 2px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.06)",
};

// Helper: get initials from name
const initials = (name = "") =>
  name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

// ─── Reusable Components ─────────────────────────────────────────────────────
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
    default: "bg-gray-100 text-gray-600",
  };
  return <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${variants[variant] || variants.default}`}>{children}</span>;
}

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const PlusIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

// ─── Modal & ConfirmDialog ───────────────────────────────────────────────────
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

// ─── Currency Card ───────────────────────────────────────────────────────────
function CurrencyCard({ currency, onEdit, onDelete }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const editMutation = useEditCurrency();
  const deleteMutation = useDeleteCurrency();

  const handleEdit = (name) => {
    editMutation.mutate(
      { id: currency.id, currency_type: name },
      {
        onSuccess: () => {
          setShowEdit(false);
          onEdit?.();
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(currency.id, {
      onSuccess: () => {
        setShowDelete(false);
        onDelete?.();
      },
    });
  };

  return (
    <div
      className="rounded-xl border bg-white overflow-hidden shadow-sm group"
      style={{ borderColor: isHovered ? C.primaryBorder : C.border }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4 px-5 py-4 cursor-default transition-colors">
        <Avatar name={currency.currency_type} size={42} bg={C.primary} />
        
        <div className="flex-1">
          <span className="text-lg font-semibold">{currency.currency_type}</span>
        </div>
        
        <Badge variant="primary">Currency</Badge>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconBtn onClick={() => setShowEdit(true)} title="Edit Currency">
            <EditIcon />
          </IconBtn>
          <IconBtn danger onClick={() => setShowDelete(true)} title="Delete Currency">
            <TrashIcon />
          </IconBtn>
        </div>
      </div>

      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Currency"
        placeholder="Currency name (e.g., USD - US Dollar)"
        existing={{ name: currency.currency_type }}
        onSubmit={handleEdit}
        isPending={editMutation.isPending}
        accent={C.primary}
      />

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete "${currency.currency_type}"?`}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-white overflow-hidden shadow-sm" style={{ borderColor: C.border }}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-[42px] h-[42px] rounded-xl bg-gray-100 animate-pulse" />
        <div className="flex-1">
          <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="w-14 h-5 bg-gray-100 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CurrencyManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const { data: currencies = [], isLoading, isError, refetch } = useGetCurrencies();
  const addMutation = useAddCurrency();

  const filtered = currencies.filter((c) =>
    c.currency_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (message, isError = false) => {
    setToastMessage({ message, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAdd = (name) => {
    addMutation.mutate(
      { currency_type: name },
      {
        onSuccess: () => {
          setShowAdd(false);
          showToast("Currency added successfully.");
        },
        onError: (err) => showToast(err.message || "Failed to add currency", true),
      }
    );
  };

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: "#faf9fc" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toastMessage.isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
            {toastMessage.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Currencies</h1>
          <p className="text-gray-500 mt-0.5">Manage currency options for user profiles</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <PlusIcon /> Add Currency
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search currencies..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all"
        style={{ borderColor: C.border }}
      />

      {/* Stats */}
      {!isLoading && !isError && currencies.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100">
            Total: {currencies.length}
          </span>
          {searchTerm && (
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
              Shown: {filtered.length}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-700 font-medium">Failed to load currencies</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm text-red-600 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed" style={{ borderColor: C.primaryBorder }}>
          <p className="text-gray-500 font-medium">
            {searchTerm ? "No currencies match your search" : "No currencies yet"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? "Try a different keyword" : "Click 'Add Currency' to create one"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((currency) => (
            <CurrencyCard
              key={currency.id}
              currency={currency}
              onEdit={() => showToast("Currency updated successfully")}
              onDelete={() => showToast("Currency deleted successfully")}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Currency"
        placeholder="e.g., USD - US Dollar, EUR - Euro"
        onSubmit={handleAdd}
        isPending={addMutation.isPending}
        accent={C.primary}
      />

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slideInFromTop 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}