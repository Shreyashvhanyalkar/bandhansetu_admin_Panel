// src/pages/admin/profileDetails.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "x-app-type": "admin",
});

// ─── Fetch user by paginating through list ────────────────────────────────────
// No direct GET /users/:id endpoint (returns 405).
// We page through the list with limit=100 until we find the matching id.
const fetchUserById = async (userId) => {
    const LIMIT = 100;
    let page = 1;

    while (true) {
        const res = await fetch(
            `${BASE_URL}/api/auth/admin/users?page=${page}&limit=${LIMIT}`,
            { headers: getAuthHeaders() }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Failed to fetch users");
        }

        const data = await res.json();
        const users = data.users || [];

        // Find user in this page
        const found = users.find((u) => u.id === userId);
        if (found) return found;

        // Stop if last page or empty
        const totalPages = data.pagination?.total_pages ?? 1;
        if (page >= totalPages || users.length === 0) break;
        page++;
    }

    throw new Error("User not found");
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
const useUserDetail = (userId) =>
    useQuery({
        queryKey: ["admin", "userDetail", userId],
        queryFn: () => fetchUserById(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const val = (v, fallback = "—") =>
    v !== undefined && v !== null && v !== "" ? v : fallback;

function Section({ title, rows }) {
    return (
        <div>
            <h3 style={{
                color: "#601000", fontSize: 16, fontWeight: 700,
                marginBottom: 8, marginTop: 0,
                fontFamily: "Rubik, sans-serif",
            }}>
                {title}
            </h3>
            <div style={{
                display: "flex", flexDirection: "column", gap: 4,
                fontFamily: "Rubik, sans-serif", fontWeight: 500,
                fontSize: 14, lineHeight: "160%", color: "#000",
            }}>
                {rows.map(([label, value]) => (
                    <div key={label}>
                        <span style={{ color: "#bd201c" }}>{label}:</span>{" "}
                        {val(value)}
                    </div>
                ))}
            </div>
            <hr style={{ borderTop: "1px solid #e0e0e0", margin: "16px 0" }} />
        </div>
    );
}

function Skeleton() {
    return (
        <div style={{ padding: "0 16px", marginTop: 120 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: 40,
                    background: "#e0e0e0", margin: "0 auto 12px",
                    animation: "pd-pulse 1.5s ease-in-out infinite"
                }} />
                <div style={{ height: 14, width: 160, background: "#e0e0e0", borderRadius: 6, margin: "0 auto 8px", animation: "pd-pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: 10, width: 100, background: "#eee", borderRadius: 6, margin: "0 auto", animation: "pd-pulse 1.5s ease-in-out infinite" }} />
            </div>
            {[200, 160, 180, 140, 120].map((w, i) => (
                <div key={i} style={{
                    height: 13, width: w, background: "#e0e0e0", borderRadius: 6,
                    marginBottom: 14, animation: "pd-pulse 1.5s ease-in-out infinite"
                }} />
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfileDetails() {
    const navigate = useNavigate();
    const { userId } = useParams();

    const { data: user, isLoading, isError, error } = useUserDetail(userId);

    // Normalise — API returns camelCase
    const u = user || {};
    const fullName = [u.firstName, u.middleName, u.lastName]
        .filter(Boolean).join(" ") || val(u.name);

    const initials = fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-0 sm:px-4 font-[Rubik,sans-serif]">
            <div className="w-full sm:max-w-md min-h-screen sm:min-h-[85vh] sm:h-auto bg-[#ffffff] sm:rounded-2xl sm:shadow-2xl sm:my-8 flex flex-col relative overflow-hidden">

                {/* ── Red Gradient Header ── */}
                <div style={{
                    height: 242,
                    background: "linear-gradient(180deg, #601000 0%, #9C0425 100%)",
                    flexShrink: 0,
                }}>
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between",
                        padding: "40px 20px 20px 20px"
                    }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: "none", border: "none",
                                fontSize: 24, color: "#fff", padding: 0, cursor: "pointer"
                            }}
                        >
                            ←
                        </button>
                        <h2 style={{
                            fontFamily: "Rubik, sans-serif", fontWeight: 700,
                            fontSize: 22, color: "#fff", margin: 0,
                            textAlign: "center", flex: 1
                        }}>
                            Profile
                        </h2>
                        <div style={{ width: 24 }} />
                    </div>
                </div>

                {/* ── Content overlapping header ── */}
                <div style={{
                    flex: 1, padding: "0 16px 20px",
                    marginTop: -109, overflowY: "auto",
                }}>

                    {isLoading ? (
                        <Skeleton />
                    ) : isError ? (
                        <div style={{
                            marginTop: 120, textAlign: "center",
                            padding: "32px 16px",
                            background: "#fff5f5", borderRadius: 16
                        }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                            <p style={{ color: "#9B0424", fontWeight: 700, fontSize: 16 }}>
                                Failed to load profile
                            </p>
                            <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                                {error?.message}
                            </p>
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    marginTop: 20, padding: "10px 28px", borderRadius: 50,
                                    background: "#9B0424", color: "#fff", border: "none",
                                    fontWeight: 600, cursor: "pointer", fontSize: 14,
                                    fontFamily: "Rubik, sans-serif",
                                }}
                            >
                                ← Go Back
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* ── Cover Card ── */}
                            <div style={{
                                width: "100%", height: 205, borderRadius: 28,
                                marginBottom: 24, boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                                overflow: "hidden", position: "relative",
                                background: "linear-gradient(135deg, #601000 0%, #9C0425 100%)",
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: 40,
                                    background: "rgba(255,255,255,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 900, fontSize: 32, color: "#fff",
                                    marginBottom: 10, letterSpacing: 1,
                                }}>
                                    {initials}
                                </div>
                                <p style={{
                                    color: "#fff", fontWeight: 700,
                                    fontSize: 18, margin: 0,
                                    fontFamily: "Rubik, sans-serif"
                                }}>
                                    {fullName}
                                </p>
                                <p style={{
                                    color: "rgba(255,255,255,0.7)",
                                    fontSize: 12, margin: "4px 0 0",
                                    fontFamily: "Rubik, sans-serif"
                                }}>
                                    {val(u.platformId)} · {val(u.gender)}
                                </p>

                                {/* Status badge */}
                                <div style={{
                                    position: "absolute", top: 12, right: 12,
                                    padding: "4px 12px", borderRadius: 20,
                                    fontSize: 11, fontWeight: 700,
                                    background: u.status === 1 ? "#22c55e" : "#f59e0b",
                                    color: "#fff",
                                }}>
                                    {u.status === 1 ? "Active" : "Inactive"}
                                </div>
                            </div>

                            <div style={{ background: "#ffffff" }}>

                                {/* Bio */}
                                <p style={{
                                    fontFamily: "Rubik, sans-serif", fontWeight: 400,
                                    fontSize: 14, lineHeight: "160%",
                                    textAlign: "justify", color: "#555",
                                    marginBottom: 24, padding: "0 2px"
                                }}>
                                    {val(u.aboutMe, "No bio added yet.")}
                                </p>

                                {/* ── Basic Details ── */}
                                <Section title="Basic Details" rows={[
                                    ["ID", u.platformId],
                                    ["Name", fullName],
                                    ["Mobile", u.mobileNumber
                                        ? `${u.countryCode || "+91"} ${u.mobileNumber}`
                                        : undefined],
                                    ["Email", u.email],
                                    ["Age", u.age],
                                    ["Date of Birth", u.birthDate],
                                    ["Gender", u.gender],
                                    ["Religion", u.religionName],
                                    ["Caste", u.castName],
                                    ["Sub-Caste", u.subcastName],
                                    ["Marital Status", u.maritalStatus],
                                    ["Mother Tongue", u.mothertongueName],
                                    ["Children", u.childStatus === "Yes"
                                        ? `Yes (${u.numberOfChildrens})`
                                        : u.childStatus],
                                    ["Height", u.heightFeet
                                        ? `${u.heightFeet}' ${u.heightInches}"`
                                        : u.userHeight],
                                    ["Weight", u.userWeight ? `${u.userWeight} kg` : undefined],
                                    ["Disability", u.anyDisability],
                                    ["Location", [u.cityName, u.stateName, u.countryName]
                                        .filter(Boolean).join(", ")],
                                    ["Profile Complete", u.profileCompleteness
                                        ? `${u.profileCompleteness}%`
                                        : undefined],
                                ]} />

                                {/* ── Education ── */}
                                <Section title="Education" rows={[
                                    ["Level", u.educationLevelName],
                                    ["Field", u.educationFieldName],
                                    ["College", u.collegeName],
                                ]} />

                                {/* ── Work & Package ── */}
                                <Section title="Work & Package" rows={[
                                    ["Employer", u.employerName],
                                    ["Category", u.categoryName],
                                    ["Role", u.subcategoryName],
                                    ["Working With", u.workingWithName],
                                    ["Annual Income", u.annualIncomeName],
                                    ["Currency", u.currencyType],
                                ]} />

                                {/* ── Lifestyle ── */}
                                <Section title="Lifestyle & Appearance" rows={[
                                    ["Diet", u.diet],
                                    ["Smoke", u.smoke],
                                    ["Drink", u.drink],
                                    ["Body Type", u.bodyType],
                                    ["Skin Tone", u.skinTone],
                                ]} />

                                {/* ── Back Button ── */}
                                <button
                                    onClick={() => navigate(-1)}
                                    style={{
                                        width: "80%", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        margin: "32px auto 40px", padding: 14,
                                        fontSize: 15, fontWeight: 600,
                                        color: "#fff", background: "#9B0424",
                                        border: "none", borderRadius: 50,
                                        cursor: "pointer",
                                        boxShadow: "0 4px 14px rgba(155,4,36,0.3)",
                                        fontFamily: "Rubik, sans-serif",
                                    }}
                                >
                                    ← Back
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Home Indicator */}
                <div style={{
                    display: "flex", justifyContent: "center",
                    paddingBottom: 12, background: "#ffffff", flexShrink: 0,
                }}>
                    <div style={{
                        width: 120, height: 4,
                        borderRadius: 2, background: "#ccc"
                    }} />
                </div>
            </div>

            <style>{`
        @keyframes pd-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
        </div>
    );
}
////////////////// End of file
 