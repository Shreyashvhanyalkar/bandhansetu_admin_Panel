// pages/admin/ReligionManagement.jsx
import { useState } from "react";

// ─── Static Data ──────────────────────────────────────────────────────────────
const INITIAL_RELIGIONS = [
  {
    id: 1,
    name: "Hinduism",
    icon: "🕉️",
    description: "One of the world's oldest religions, originating in India.",
    status: "active",
    displayOrder: 1,
    userCount: 3240,
    featured: true,
    createdAt: "2024-01-01",
    casts: [
      {
        id: 101,
        name: "Brahmin",
        icon: "📿",
        description: "Priestly class, traditionally educators and spiritual leaders.",
        userCount: 892,
        displayOrder: 1,
        status: "active",
        subCasts: [
          { id: 1001, name: "Gaur Brahmin", userCount: 245, description: "North Indian Brahmins", status: "active" },
          { id: 1002, name: "Kanyakubj Brahmin", userCount: 198, description: "Central Indian Brahmins", status: "active" },
          { id: 1003, name: "Saryuparin Brahmin", userCount: 167, description: "Eastern UP Brahmins", status: "active" },
          { id: 1004, name: "Maithil Brahmin", userCount: 142, description: "Mithila region Brahmins", status: "active" },
          { id: 1005, name: "Utkal Brahmin", userCount: 98, description: "Odisha Brahmins", status: "active" },
        ]
      },
      {
        id: 102,
        name: "Kshatriya",
        icon: "⚔️",
        description: "Warrior and ruling class, traditionally kings and administrators.",
        userCount: 745,
        displayOrder: 2,
        status: "active",
        subCasts: [
          { id: 1006, name: "Rajput", userCount: 456, description: "Warrior clans of North India", status: "active" },
          { id: 1007, name: "Thakur", userCount: 189, description: "Landlord class", status: "active" },
          { id: 1008, name: "Singh", userCount: 100, description: "Common Kshatriya surname", status: "active" },
        ]
      },
      {
        id: 103,
        name: "Vaishya",
        icon: "💰",
        description: "Merchant and trading class, traditionally businessmen.",
        userCount: 567,
        displayOrder: 3,
        status: "active",
        subCasts: [
          { id: 1009, name: "Baniya", userCount: 234, description: "Trading community", status: "active" },
          { id: 1010, name: "Gupta", userCount: 178, description: "Merchant community", status: "active" },
          { id: 1011, name: "Agarwal", userCount: 155, description: "North Indian merchant community", status: "active" },
        ]
      },
      {
        id: 104,
        name: "Shudra",
        icon: "🛠️",
        description: "Working and service class, traditionally artisans and farmers.",
        userCount: 423,
        displayOrder: 4,
        status: "active",
        subCasts: [
          { id: 1012, name: "Yadav", userCount: 189, description: "Farmer community", status: "active" },
          { id: 1013, name: "Kurmi", userCount: 134, description: "Agricultural community", status: "active" },
          { id: 1014, name: "Kumhar", userCount: 100, description: "Potter community", status: "active" },
        ]
      },
      {
        id: 105,
        name: "Other Hindu Castes",
        icon: "🕊️",
        description: "Other communities and castes within Hinduism.",
        userCount: 613,
        displayOrder: 5,
        status: "active",
        subCasts: []
      }
    ]
  },
  {
    id: 2,
    name: "Islam",
    icon: "☪️",
    description: "Monotheistic religion based on the teachings of Prophet Muhammad.",
    status: "active",
    displayOrder: 2,
    userCount: 892,
    featured: true,
    createdAt: "2024-01-01",
    casts: [
      {
        id: 201,
        name: "Sunni",
        icon: "🕌",
        description: "Largest denomination of Islam.",
        userCount: 612,
        displayOrder: 1,
        status: "active",
        subCasts: [
          { id: 2001, name: "Hanafi", userCount: 345, description: "Most common Sunni school", status: "active" },
          { id: 2002, name: "Shafi'i", userCount: 167, description: "Common in South India", status: "active" },
          { id: 2003, name: "Hanbali", userCount: 100, description: "Conservative school", status: "active" },
        ]
      },
      {
        id: 202,
        name: "Shia",
        icon: "📿",
        description: "Second largest denomination of Islam.",
        userCount: 189,
        displayOrder: 2,
        status: "active",
        subCasts: [
          { id: 2004, name: "Ithna Ashari", userCount: 123, description: "Twelver Shia", status: "active" },
          { id: 2005, name: "Ismaili", userCount: 66, description: "Aga Khan followers", status: "active" },
        ]
      },
      {
        id: 203,
        name: "Other Muslim Sects",
        icon: "🕊️",
        description: "Other Islamic traditions and communities.",
        userCount: 91,
        displayOrder: 3,
        status: "active",
        subCasts: []
      }
    ]
  },
  {
    id: 3,
    name: "Sikhism",
    icon: "✡️",
    description: "Monotheistic religion founded in Punjab region.",
    status: "active",
    displayOrder: 3,
    userCount: 567,
    featured: true,
    createdAt: "2024-01-01",
    casts: [
      {
        id: 301,
        name: "Jat Sikh",
        icon: "🌾",
        description: "Largest Sikh community, traditionally farmers.",
        userCount: 289,
        displayOrder: 1,
        status: "active",
        subCasts: []
      },
      {
        id: 302,
        name: "Khatri Sikh",
        icon: "💼",
        description: "Merchant and trading community.",
        userCount: 134,
        displayOrder: 2,
        status: "active",
        subCasts: []
      },
      {
        id: 303,
        name: "Ramgarhia",
        icon: "🔨",
        description: "Artisan and carpenter community.",
        userCount: 89,
        displayOrder: 3,
        status: "active",
        subCasts: []
      },
      {
        id: 304,
        name: "Other Sikh Castes",
        icon: "🕊️",
        description: "Other Sikh communities.",
        userCount: 55,
        displayOrder: 4,
        status: "active",
        subCasts: []
      }
    ]
  },
  {
    id: 4,
    name: "Christianity",
    icon: "✝️",
    description: "Monotheistic religion based on the life and teachings of Jesus Christ.",
    status: "active",
    displayOrder: 4,
    userCount: 423,
    featured: false,
    createdAt: "2024-01-01",
    casts: [
      {
        id: 401,
        name: "Roman Catholic",
        icon: "⛪",
        description: "Largest Christian denomination.",
        userCount: 234,
        displayOrder: 1,
        status: "active",
        subCasts: []
      },
      {
        id: 402,
        name: "Protestant",
        icon: "📖",
        description: "Various Protestant denominations.",
        userCount: 123,
        displayOrder: 2,
        status: "active",
        subCasts: [
          { id: 4001, name: "Pentecostal", userCount: 67, description: "Charismatic Christian movement", status: "active" },
          { id: 4002, name: "Baptist", userCount: 56, description: "Baptist denomination", status: "active" },
        ]
      },
      {
        id: 403,
        name: "Orthodox",
        icon: "🕯️",
        description: "Eastern Orthodox Church.",
        userCount: 66,
        displayOrder: 3,
        status: "active",
        subCasts: []
      }
    ]
  },
  {
    id: 5,
    name: "Jainism",
    icon: "🔔",
    description: "Ancient Indian religion emphasizing non-violence.",
    status: "active",
    displayOrder: 5,
    userCount: 234,
    featured: false,
    createdAt: "2024-01-01",
    casts: [
      {
        id: 501,
        name: "Digambar",
        icon: "🌌",
        description: "Sky-clad tradition of Jainism.",
        userCount: 134,
        displayOrder: 1,
        status: "active",
        subCasts: []
      },
      {
        id: 502,
        name: "Shwetambar",
        icon: "👘",
        description: "White-clad tradition of Jainism.",
        userCount: 100,
        displayOrder: 2,
        status: "active",
        subCasts: [
          { id: 5001, name: "Murtipujak", userCount: 67, description: "Idol worshippers", status: "active" },
          { id: 5002, name: "Sthanakvasi", userCount: 33, description: "Non-idol worshippers", status: "active" },
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Buddhism",
    icon: "☸️",
    description: "Religion based on the teachings of Gautama Buddha.",
    status: "active",
    displayOrder: 6,
    userCount: 189,
    featured: false,
    createdAt: "2024-01-01",
    casts: [
      {
        id: 601,
        name: "Mahayana",
        icon: "🪷",
        description: "Great Vehicle tradition, common in East Asia.",
        userCount: 89,
        displayOrder: 1,
        status: "active",
        subCasts: []
      },
      {
        id: 602,
        name: "Theravada",
        icon: "📜",
        description: "Teaching of the Elders, common in Southeast Asia.",
        userCount: 67,
        displayOrder: 2,
        status: "active",
        subCasts: []
      },
      {
        id: 603,
        name: "Vajrayana",
        icon: "🔔",
        description: "Tantric Buddhism, common in Tibet.",
        userCount: 33,
        displayOrder: 3,
        status: "active",
        subCasts: []
      }
    ]
  },
  {
    id: 7,
    name: "Other Religions",
    icon: "🕊️",
    description: "Other religious communities and beliefs.",
    status: "active",
    displayOrder: 7,
    userCount: 189,
    featured: false,
    createdAt: "2024-01-01",
    casts: [
      {
        id: 701,
        name: "Zoroastrianism (Parsi)",
        icon: "🔥",
        description: "Ancient Persian religion.",
        userCount: 67,
        displayOrder: 1,
        status: "active",
        subCasts: []
      },
      {
        id: 702,
        name: "Judaism",
        icon: "✡️",
        description: "Monotheistic religion of the Jewish people.",
        userCount: 45,
        displayOrder: 2,
        status: "active",
        subCasts: []
      },
      {
        id: 703,
        name: "Baháʼí",
        icon: "⭐",
        description: "Faith emphasizing unity of all religions.",
        userCount: 33,
        displayOrder: 3,
        status: "active",
        subCasts: []
      },
      {
        id: 704,
        name: "No Religion (Atheist/Agnostic)",
        icon: "🤔",
        description: "Individuals with no religious affiliation.",
        userCount: 44,
        displayOrder: 4,
        status: "active",
        subCasts: []
      }
    ]
  }
];

function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function StatCard({ label, value, icon, trend, trendValue, color }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}%
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Modal Components ─────────────────────────────────────────────────────────
function AddReligionModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    icon: "🕉️",
    description: "",
    displayOrder: INITIAL_RELIGIONS.length + 1,
    featured: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    setTimeout(() => {
      onSave(formData);
      setSaving(false);
      onClose();
      setFormData({ name: "", icon: "🕉️", description: "", displayOrder: INITIAL_RELIGIONS.length + 1, featured: false });
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-scale-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-100 flex items-center justify-center text-lg">➕</div>
            <h2 className="text-xl font-bold text-gray-800">Add New Religion</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Religion Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Hinduism, Islam"
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Icon/Emoji</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🕉️"
              maxLength={2}
              className="mt-1 w-20 px-4 py-2.5 border border-gray-200 rounded-xl text-2xl text-center outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the religion..."
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Display Order</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              className="mt-1 w-24 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-fuchsia-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Featured Religion</label>
            <button
              onClick={() => setFormData({ ...formData, featured: !formData.featured })}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${formData.featured ? "bg-fuchsia-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${formData.featured ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !formData.name.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:shadow-lg transition disabled:opacity-50">
            {saving ? <><Spinner /> Saving...</> : "Add Religion"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddCastModal({ isOpen, onClose, onSave, religionId, religionName }) {
  const [formData, setFormData] = useState({ name: "", icon: "📿", description: "", displayOrder: 1 });
  const [saving, setSaving] = useState(false);

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    setTimeout(() => {
      onSave(religionId, formData);
      setSaving(false);
      onClose();
      setFormData({ name: "", icon: "📿", description: "", displayOrder: 1 });
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-scale-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-100 flex items-center justify-center text-lg">➕</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Add New Cast</h2>
              <p className="text-xs text-gray-400">for {religionName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Cast Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Brahmin, Rajput"
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Icon</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="📿"
              maxLength={2}
              className="mt-1 w-20 px-4 py-2.5 border border-gray-200 rounded-xl text-2xl text-center"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Description of this cast..."
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !formData.name.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:shadow-lg transition">
            {saving ? <><Spinner /> Adding...</> : "Add Cast"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddSubCastModal({ isOpen, onClose, onSave, religionName, castName }) {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    setTimeout(() => {
      onSave(formData);
      setSaving(false);
      onClose();
      setFormData({ name: "", description: "" });
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-scale-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-100 flex items-center justify-center text-lg">➕</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Add Sub-Cast</h2>
              <p className="text-xs text-gray-400">{religionName} › {castName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sub-Cast Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Gaur Brahmin, Rajput"
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Details about this sub-cast..."
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !formData.name.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:shadow-lg transition">
            {saving ? <><Spinner /> Adding...</> : "Add Sub-Cast"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Accordion Components ─────────────────────────────────────────────────────
function SubCastItem({ subCast, religionName, castName }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border-l-2 border-fuchsia-100 ml-4 pl-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDetails(!showDetails)} className="text-gray-400 hover:text-fuchsia-500 transition">
            <svg className={`w-3 h-3 transition-transform ${showDetails ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700">{subCast.name}</span>
          <span className="text-xs text-gray-400">({subCast.userCount} users)</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700">Active</span>
        </div>
        <div className="flex gap-1">
          <button className="p-1 text-gray-400 hover:text-fuchsia-600 transition">✏️</button>
          <button className="p-1 text-gray-400 hover:text-red-600 transition">🗑️</button>
        </div>
      </div>
      {showDetails && subCast.description && (
        <div className="mt-2 ml-5 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">{subCast.description}</div>
      )}
    </div>
  );
}

function CastItem({ cast, religionName, onAddSubCast }) {
  const [expanded, setExpanded] = useState(false);
  const [showSubCastModal, setShowSubCastModal] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl mb-3 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cast.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{cast.name}</span>
              <span className="text-xs text-gray-400">({cast.userCount} users)</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700">Active</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{cast.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAddSubCast(cast); setShowSubCastModal(true); }}
            className="px-2 py-1 text-xs rounded-lg bg-fuchsia-50 text-fuchsia-600 hover:bg-fuchsia-100 transition"
          >
            + Add Sub-Cast
          </button>
          <button onClick={(e) => e.stopPropagation()} className="p-1 text-gray-400 hover:text-fuchsia-600 transition">✏️</button>
          <button onClick={(e) => e.stopPropagation()} className="p-1 text-gray-400 hover:text-red-600 transition">🗑️</button>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 bg-white space-y-2">
          {cast.subCasts && cast.subCasts.length > 0 ? (
            cast.subCasts.map(subCast => (
              <SubCastItem key={subCast.id} subCast={subCast} religionName={religionName} castName={cast.name} />
            ))
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm">No sub-casts added yet. Click "Add Sub-Cast" to create one.</div>
          )}
        </div>
      )}

      <AddSubCastModal
        isOpen={showSubCastModal}
        onClose={() => setShowSubCastModal(false)}
        onSave={(data) => {
          const newSubCast = {
            id: Date.now(),
            name: data.name,
            description: data.description,
            userCount: 0,
            status: "active"
          };
          if (!cast.subCasts) cast.subCasts = [];
          cast.subCasts.push(newSubCast);
          onAddSubCast(cast.id, newSubCast);
        }}
        religionName={religionName}
        castName={cast.name}
      />
    </div>
  );
}

function ReligionAccordion({ religion, onAddCast, onAddSubCast }) {
  const [expanded, setExpanded] = useState(false);
  const [showCastModal, setShowCastModal] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-4">
          <span className="text-3xl">{religion.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800 text-lg">{religion.name}</span>
              <span className="text-xs text-gray-400">({religion.userCount} users)</span>
              {religion.featured && <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-700">⭐ Featured</span>}
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700">{religion.status}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{religion.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowCastModal(true); }}
            className="px-3 py-1.5 text-sm rounded-xl bg-fuchsia-50 text-fuchsia-600 hover:bg-fuchsia-100 transition font-medium"
          >
            + Add Cast
          </button>
          <button onClick={(e) => e.stopPropagation()} className="p-2 text-gray-400 hover:text-fuchsia-600 transition">✏️</button>
          <button onClick={(e) => e.stopPropagation()} className="p-2 text-gray-400 hover:text-red-600 transition">🗑️</button>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          {religion.casts && religion.casts.length > 0 ? (
            religion.casts.map(cast => (
              <CastItem key={cast.id} cast={cast} religionName={religion.name} onAddSubCast={(castId, subCastData) => onAddSubCast(religion.id, castId, subCastData)} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">No casts added yet. Click "Add Cast" to create one.</div>
          )}
        </div>
      )}

      <AddCastModal
        isOpen={showCastModal}
        onClose={() => setShowCastModal(false)}
        onSave={(relId, data) => onAddCast(relId, data)}
        religionId={religion.id}
        religionName={religion.name}
      />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ReligionManagement() {
  const [religions, setReligions] = useState(INITIAL_RELIGIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddReligionModal, setShowAddReligionModal] = useState(false);

  const filteredReligions = religions.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = religions.reduce((sum, r) => sum + r.userCount, 0);
  const totalCasts = religions.reduce((sum, r) => sum + (r.casts?.length || 0), 0);
  const totalSubCasts = religions.reduce((sum, r) => sum + (r.casts?.reduce((s, c) => s + (c.subCasts?.length || 0), 0) || 0), 0);

  const handleAddReligion = (data) => {
    const newReligion = {
      id: religions.length + 1,
      ...data,
      userCount: 0,
      status: "active",
      createdAt: new Date().toISOString().split('T')[0],
      casts: []
    };
    setReligions([...religions, newReligion]);
  };

  const handleAddCast = (relId, castData) => {
    const newCast = {
      id: Date.now(),
      ...castData,
      userCount: 0,
      displayOrder: 1,
      status: "active",
      subCasts: []
    };
    setReligions(prev => prev.map(rel => 
      rel.id === relId ? { ...rel, casts: [...(rel.casts || []), newCast] } : rel
    ));
  };

  const handleAddSubCast = (relId, castId, subCastData) => {
    setReligions(prev => prev.map(rel =>
      rel.id === relId ? {
        ...rel,
        casts: rel.casts.map(cast =>
          cast.id === castId ? {
            ...cast,
            subCasts: [...(cast.subCasts || []), subCastData]
          } : cast
        )
      } : rel
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className=" rounded-b-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
              <span className="text-xl">🕉️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Religion & Community</h1>
              <p className="text-gray-500 text-sm mt-0.5">Manage religions, casts, and sub-casts for your matrimony platform</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddReligionModal(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>➕</span> Add New Religion
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <StatCard label="Total Religions" value={religions.length} icon="🕉️" trend="up" trendValue="0" color="bg-fuchsia-50" />
        <StatCard label="Total Casts" value={totalCasts} icon="👥" trend="up" trendValue="5" color="bg-blue-50" />
        <StatCard label="Total Sub-Casts" value={totalSubCasts} icon="📋" trend="up" trendValue="8" color="bg-green-50" />
        <StatCard label="Total Users" value={totalUsers.toLocaleString()} icon="👤" trend="up" trendValue="12" color="bg-amber-50" />
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search religions, casts, or sub-casts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 transition"
          />
        </div>
      </div>

      {/* Religions Accordion List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-100 flex items-center justify-center text-sm">📋</div>
            <div>
              <h2 className="font-semibold text-gray-800">Religion Directory</h2>
              <p className="text-xs text-gray-400">{filteredReligions.length} religions found</p>
            </div>
          </div>
        </div>

        {filteredReligions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-4xl">🕉️</div>
            <p className="font-medium text-gray-500">No religions found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or add a new religion</p>
          </div>
        ) : (
          filteredReligions.map(religion => (
            <ReligionAccordion
              key={religion.id}
              religion={religion}
              onAddCast={handleAddCast}
              onAddSubCast={handleAddSubCast}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <AddReligionModal
        isOpen={showAddReligionModal}
        onClose={() => setShowAddReligionModal(false)}
        onSave={handleAddReligion}
      />

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.25s ease-out forwards; }
      `}</style>
    </div>
  );
}