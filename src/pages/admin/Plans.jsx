// src/pages/admin/Plans.jsx
import { useState } from "react";

// ─── Design Tokens (match Sidebar.jsx / Navbar.jsx) ───────────────────────────
const theme = {
    primary: "#bd201c",
    primaryDark: "#601000",
    primaryLight: "#fef2f2",
    textMuted: "#9ca3af",
};

// ─── Dummy seed data (replace with API data) ─────────────────────────────────
const SEED_PLANS = [
    {
        id: 1,
        name: "Free",
        price: 0,
        duration: "Forever",
        status: "Active",
        popular: false,
        subscribers: 6204,
        features: ["Create profile", "5 daily matches", "Limited messaging"],
    },
    {
        id: 2,
        name: "Gold",
        price: 1499,
        duration: "3 months",
        status: "Active",
        popular: true,
        subscribers: 4890,
        features: ["Unlimited matches", "Chat with matches", "See who viewed profile"],
    },
    {
        id: 3,
        name: "Platinum",
        price: 3999,
        duration: "6 months",
        status: "Active",
        popular: false,
        subscribers: 1102,
        features: ["All Gold features", "Dedicated relationship manager", "Profile highlighting"],
    },
    {
        id: 4,
        name: "Elite",
        price: 7999,
        duration: "12 months",
        status: "Draft",
        popular: false,
        subscribers: 284,
        features: ["All Platinum features", "Verified badge", "Priority support"],
    },
];

const EMPTY_FORM = {
    id: null,
    name: "",
    price: "",
    duration: "1 month",
    status: "Active",
    features: "",
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const styles = {
        Active: { bg: "#dcfce7", text: "#15803d" },
        Draft: { bg: "#fef9c3", text: "#a16207" },
        Archived: { bg: "#f3f4f6", text: "#6b7280" },
    };
    const s = styles[status] || styles.Draft;
    return (
        <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors duration-200"
            style={{ backgroundColor: s.bg, color: s.text }}
        >
            {status}
        </span>
    );
}

// ─── Plan card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, onEdit, onDelete, index }) {
    return (
        <div
            className="plan-card relative bg-white rounded-2xl p-4 sm:p-5 flex flex-col shadow-sm shadow-gray-100/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-200/60"
            style={{
                border: plan.popular ? `2px solid ${theme.primary}` : "1px solid #f3f4f6",
                animationDelay: `${index * 80}ms`,
            }}
        >
            {plan.popular && (
                <span
                    className="absolute -top-3 left-5 text-[11px] font-bold px-3 py-1 rounded-full text-white shadow-sm animate-pulse-soft"
                    style={{ backgroundColor: theme.primary }}
                >
                    Most popular
                </span>
            )}

            <div className="flex items-start justify-between mb-3 gap-2">
                <p className="font-bold text-gray-900 text-base truncate">{plan.name}</p>
                <StatusBadge status={plan.status} />
            </div>

            <p className="text-2xl font-extrabold text-gray-900 mb-0.5">
                ₹{Number(plan.price).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400 mb-4">{plan.duration}</p>

            <ul className="text-sm text-gray-600 space-y-1.5 mb-4 flex-1">
                {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke={theme.primary} strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="break-words">{f}</span>
                    </li>
                ))}
            </ul>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                <p className="text-xs text-gray-400 font-medium truncate">
                    {plan.subscribers.toLocaleString("en-IN")} subscribers
                </p>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => onEdit(plan)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#bd201c] hover:bg-[#fef2f2] active:scale-90 transition-all duration-150"
                        aria-label="Edit plan"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(plan.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 active:scale-90 transition-all duration-150"
                        aria-label="Delete plan"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Add / Edit Modal ──────────────────────────────────────────────────────────
function PlanModal({ form, setForm, onClose, onSave }) {
    const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4 modal-overlay"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-5 sm:p-6 max-h-[92vh] overflow-y-auto modal-panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5 sticky top-0 bg-white pb-1">
                    <h2 className="text-lg font-bold text-gray-900">
                        {form.id ? "Edit plan" : "Add plan"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 active:scale-90 transition-all duration-150"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Plan name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={handleChange("name")}
                            placeholder="e.g. Gold"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-[#fef2f2] focus:border-[#fca5a5]"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Price (₹)</label>
                        <input
                            type="number"
                            value={form.price}
                            onChange={handleChange("price")}
                            placeholder="1499"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-[#fef2f2] focus:border-[#fca5a5]"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration</label>
                        <select
                            value={form.duration}
                            onChange={handleChange("duration")}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-[#fef2f2] focus:border-[#fca5a5]"
                        >
                            <option>1 month</option>
                            <option>3 months</option>
                            <option>6 months</option>
                            <option>12 months</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                        <select
                            value={form.status}
                            onChange={handleChange("status")}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-[#fef2f2] focus:border-[#fca5a5]"
                        >
                            <option>Active</option>
                            <option>Draft</option>
                            <option>Archived</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">
                            Features (one per line)
                        </label>
                        <textarea
                            rows={3}
                            value={form.features}
                            onChange={handleChange("features")}
                            placeholder={"Unlimited matches\nChat with matches\nSee who viewed profile"}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-[#fef2f2] focus:border-[#fca5a5] resize-none"
                        />
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4 sticky bottom-0 bg-white pt-1">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 sm:py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 active:scale-95 transition-all duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2.5 sm:py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-150"
                        style={{ backgroundColor: theme.primary }}
                    >
                        Save plan
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Plans() {
    const [plans, setPlans] = useState(SEED_PLANS);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const totalSubscribers = plans.reduce((sum, p) => sum + p.subscribers, 0);
    const mostPopular = plans.find((p) => p.popular)?.name || "—";
    const monthlyRevenue = plans.reduce((sum, p) => sum + p.price * (p.subscribers / 10), 0);

    const openAddModal = () => {
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    const openEditModal = (plan) => {
        setForm({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            duration: plan.duration,
            status: plan.status,
            features: plan.features.join("\n"),
        });
        setModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this plan? This cannot be undone.")) {
            setPlans((prev) => prev.filter((p) => p.id !== id));
        }
    };

    const handleSave = () => {
        if (!form.name.trim() || !form.price) return; // basic guard, swap for toast/validation

        const featuresArr = form.features
            .split("\n")
            .map((f) => f.trim())
            .filter(Boolean);

        if (form.id) {
            // Edit existing
            setPlans((prev) =>
                prev.map((p) =>
                    p.id === form.id
                        ? { ...p, name: form.name, price: Number(form.price), duration: form.duration, status: form.status, features: featuresArr }
                        : p
                )
            );
        } else {
            // Add new
            setPlans((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    name: form.name,
                    price: Number(form.price),
                    duration: form.duration,
                    status: form.status,
                    popular: false,
                    subscribers: 0,
                    features: featuresArr,
                },
            ]);
        }
        setModalOpen(false);
    };

    return (
        <div
            className="plans-page px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto"
            style={{ fontFamily: "'Rubik', sans-serif" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3 fade-in-down">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">Membership plans</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                        Manage subscription tiers shown to users
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 w-full sm:w-auto justify-center"
                    style={{ backgroundColor: theme.primary }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add plan
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
                {[
                    { label: "Total plans", value: plans.length },
                    { label: "Active subscribers", value: totalSubscribers.toLocaleString("en-IN") },
                    { label: "Monthly revenue", value: `₹${(monthlyRevenue / 100000).toFixed(1)}L` },
                    { label: "Most popular", value: mostPopular },
                ].map((s, i) => (
                    <div
                        key={s.label}
                        className="stat-card bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-sm shadow-gray-100/50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                        style={{ animationDelay: `${i * 60}ms` }}
                    >
                        <p className="text-[11px] sm:text-xs font-semibold text-gray-400 mb-1.5 truncate">{s.label}</p>
                        <p className="text-lg sm:text-xl font-extrabold text-gray-900 truncate">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan, i) => (
                    <PlanCard key={plan.id} plan={plan} index={i} onEdit={openEditModal} onDelete={handleDelete} />
                ))}
            </div>

            {modalOpen && (
                <PlanModal
                    form={form}
                    setForm={setForm}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                />
            )}

            <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes panelPopIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseSoft {
          0%, 100% { box-shadow: 0 0 0 0 rgba(189, 32, 28, 0.35); }
          50% { box-shadow: 0 0 0 4px rgba(189, 32, 28, 0); }
        }
        .fade-in-down { animation: fadeInDown 0.35s ease-out both; }
        .plan-card, .stat-card {
          animation: fadeInUp 0.4s ease-out both;
        }
        .animate-pulse-soft { animation: pulseSoft 2.2s ease-in-out infinite; }
        .modal-overlay { animation: overlayFadeIn 0.2s ease-out both; }
        .modal-panel { animation: panelPopIn 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.1) both; }

        @media (prefers-reduced-motion: reduce) {
          .fade-in-down, .plan-card, .stat-card, .animate-pulse-soft, .modal-overlay, .modal-panel {
            animation: none !important;
          }
        }
      `}</style>
        </div>
    );
}