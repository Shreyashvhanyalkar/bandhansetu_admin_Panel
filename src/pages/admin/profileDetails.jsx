// src/pages/admin/profileDetails.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const IMAGE_DOWNLOAD_URL = `${BASE_URL}/api/file/download/thumbnail_`;

const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "x-app-type": "admin",
});

const fetchUserGallery = async (userId) => {
    const res = await fetch(`${BASE_URL}/api/auth/user/gallery/${userId}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [];
    return arr.sort((a, b) => (b.isProfilePicture ? 1 : 0) - (a.isProfilePicture ? 1 : 0));
};

const useUserGallery = (userId) =>
    useQuery({
        queryKey: ["admin", "userGallery", userId],
        queryFn: () => fetchUserGallery(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

const fetchUserProfile = async (userId) => {
    const res = await fetch(
        `${BASE_URL}/api/auth/admin/userprofile/${userId}`,
        { headers: getAuthHeaders() }
    );
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch user profile");
    }
    return await res.json();
};

const useUserProfile = (userId) =>
    useQuery({
        queryKey: ["admin", "userProfile", userId],
        queryFn: () => fetchUserProfile(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

const val = (v, fallback = "—") =>
    v !== undefined && v !== null && v !== "" ? v : fallback;

// How tall the red header is
const HEADER_HEIGHT = 280;
// How tall the cover image is
const COVER_HEIGHT = 233;
// Cover image starts this many px from top of screen (inside the red header)
const COVER_TOP = 120;

function Section({ title, rows }) {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <h3 style={{ color: "#601000", fontSize: 15, fontWeight: 700, margin: 0, fontFamily: "Rubik, sans-serif" }}>
                    {title}
                </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, fontFamily: "Rubik, sans-serif", fontWeight: 500, fontSize: 13.5, lineHeight: "175%", color: "#111" }}>
                {rows.map(([label, value]) => (
                    <div key={label}>
                        <span style={{ color: "#bd201c" }}>{label}:</span>{" "}{val(value)}
                    </div>
                ))}
            </div>
            <hr style={{ borderTop: "1px solid #e0e0e0", margin: "14px 0" }} />
        </div>
    );
}

function Skeleton() {
    return (
        <div style={{ padding: "0 16px", marginTop: 80 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: 40, background: "#e0e0e0", margin: "0 auto 12px", animation: "pd-pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: 14, width: 160, background: "#e0e0e0", borderRadius: 6, margin: "0 auto 8px", animation: "pd-pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: 10, width: 100, background: "#eee", borderRadius: 6, margin: "0 auto", animation: "pd-pulse 1.5s ease-in-out infinite" }} />
            </div>
            {[200, 160, 180, 140, 120].map((w, i) => (
                <div key={i} style={{ height: 13, width: w, background: "#e0e0e0", borderRadius: 6, marginBottom: 14, animation: "pd-pulse 1.5s ease-in-out infinite" }} />
            ))}
        </div>
    );
}

function Lightbox({ src, onClose }) {
    if (!src) return null;
    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 40, height: 40, borderRadius: "50%", fontSize: 20, cursor: "pointer" }}>✕</button>
            <img src={src} alt="Full view" onClick={e => e.stopPropagation()} style={{ maxWidth: "92vw", maxHeight: "88vh", borderRadius: 16, objectFit: "contain", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }} />
        </div>
    );
}

export default function ProfileDetails() {
    const navigate = useNavigate();
    const { userId } = useParams();

    const { data: profileData, isLoading, isError, error } = useUserProfile(userId);
    const { data: gallery = [] } = useUserGallery(userId);
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const [galleryStart, setGalleryStart] = useState(0);

    const getImageUrl = (fileName) => `${IMAGE_DOWNLOAD_URL}${fileName}`;

    const ud = profileData?.userDetails || {};
    const primary = profileData?.userPrimaryDetails || {};
    const religion = profileData?.userReligionDetails || {};
    const education = profileData?.userEducationalDetails || {};
    const work = profileData?.userWorkingDetails || {};
    const lifestyle = profileData?.userLifeStyleDetails || {};
    const aboutMe = profileData?.userAboutMeDetails || {};
    const address = profileData?.userAddressDetails || {};
    const family = profileData?.userFamilyDetails || {};

    const fullName = [ud.firstName, ud.lastName].filter(Boolean).join(" ") || "—";
    const initials = fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

    const profilePic = gallery.find(img => img.isProfilePicture);
    const profilePicFileName = profilePic?.fileName || ud.profilePicture;

    const VISIBLE = 2;
    const visibleGallery = gallery.slice(galleryStart, galleryStart + VISIBLE);
    const canPrev = galleryStart > 0;
    const canNext = galleryStart + VISIBLE < gallery.length;

    // The cover image bottom edge = COVER_TOP + COVER_HEIGHT
    // Content in the scroll area starts after that
    const COVER_BOTTOM = COVER_TOP + COVER_HEIGHT; // = 355
    // How far the cover extends below the header
    const COVER_BELOW_HEADER = COVER_BOTTOM - HEADER_HEIGHT; // = 75

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-0 sm:px-4 font-[Rubik,sans-serif]">

            {/* Outer wrapper — NOT overflow:hidden so cover image can overlap header */}
            <div className="w-full sm:max-w-md min-h-screen sm:min-h-[85vh] sm:h-auto bg-[#ffffff] sm:rounded-2xl sm:shadow-2xl sm:my-8 flex flex-col relative">

                {/* ── Red Gradient Header ── */}
                <div style={{
                    height: HEADER_HEIGHT,
                    background: "linear-gradient(180deg, #601000 0%, #9B0424 100%)",
                    flexShrink: 0,
                    borderRadius: "16px 16px 0 0",
                    position: "relative",
                    zIndex: 1,
                }}>
                    {/* Title row */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "44px 20px 0",
                    }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{ background: "none", border: "none", fontSize: 24, color: "#fff", padding: 0, cursor: "pointer" }}
                        >←</button>
                        <h2 style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", margin: 0, textAlign: "center", flex: 1 }}>
                            My Profile
                        </h2>
                        <div style={{ width: 24 }} />
                    </div>

                    {/* ── Cover Card — absolutely positioned so it straddles header / gray area ── */}
                    <div style={{
                        position: "absolute",
                        top: COVER_TOP,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 377,
                        height: COVER_HEIGHT,
                        zIndex: 10,
                        borderRadius: 20,
                        overflow: "hidden",
                        boxShadow: "0 6px 24px rgba(0,0,0,0.22)",
                        background: "linear-gradient(135deg, #601000 0%, #9B0424 100%)",
                    }}>
                        {profilePicFileName ? (
                            <img
                                src={getImageUrl(profilePicFileName)}
                                alt="Profile"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    objectPosition: "top center",
                                }}
                            />
                        ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ width: 80, height: 80, borderRadius: 40, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 32, color: "#fff", marginBottom: 10 }}>
                                    {initials}
                                </div>
                                <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: 0 }}>{fullName}</p>
                                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: "4px 0 0" }}>
                                    {val(ud.platformId)} · {val(ud.gender)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Scrollable Content ── */}
                <div style={{ flex: 1, overflowY: "auto" }}>

                    {isLoading ? <Skeleton /> : isError ? (
                        <div style={{ margin: "32px 16px 0", textAlign: "center", padding: "32px 16px", background: "#fff5f5", borderRadius: 16 }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                            <p style={{ color: "#9B0424", fontWeight: 700, fontSize: 16 }}>Failed to load profile</p>
                            <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>{error?.message}</p>
                            <button
                                onClick={() => navigate(-1)}
                                style={{ marginTop: 20, padding: "10px 28px", borderRadius: 50, background: "#9B0424", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "Rubik, sans-serif" }}
                            >← Go Back</button>
                        </div>
                    ) : (
                        <>
                            {/* ── Gray background area ── */}
                            <div style={{
                                background: "#EAEAEA",

                                paddingBottom: 20,
                                // Push content down so it clears the cover image that overlaps from the header
                                paddingTop: COVER_BELOW_HEADER + 16,
                            }}>
                                {/* ── Gallery Section ── */}
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 10,
                                    padding: "0 16px 6px",
                                }}>


                                    {visibleGallery.map((img, i) => (
                                        <div
                                            key={img.fileName || i}
                                            onClick={() => setLightboxSrc(getImageUrl(img.fileName))}
                                            style={{
                                                width: 70, height: 70,
                                                borderRadius: 14,
                                                overflow: "hidden",
                                                border: "2px solid #9B0424",
                                                flexShrink: 0,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <img
                                                src={getImageUrl(img.fileName)}
                                                alt={`Gallery ${i + 1}`}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        </div>
                                    ))}




                                </div>

                                {/* ── About Me ── */}
                                <div style={{ padding: "14px 16px 4px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                        <h3 style={{ color: "#601000", fontSize: 16, fontWeight: 700, margin: 0, fontFamily: "Rubik, sans-serif" }}>About me</h3>
                                    </div>
                                    <p style={{ fontFamily: "Rubik, sans-serif", fontWeight: 400, fontSize: 13.5, lineHeight: "165%", textAlign: "justify", color: "#333", margin: 0 }}>
                                        {val(aboutMe.aboutMe, "No bio added yet.")}
                                    </p>
                                </div>
                            </div>

                            {/* ── White Sections ── */}
                            <div style={{ background: "#ffffff", padding: "0 16px" }}>

                                <Section title="Basic Details" rows={[
                                    ["ID", ud.platformId],
                                    ["Name", fullName],
                                    ["Mobile", ud.mobileNumber ? `${ud.countryCode || "+91"} ${ud.mobileNumber}` : undefined],
                                    ["Email", ud.email],
                                    ["Age", ud.age],
                                    ["Date of Birth", ud.dateOfBirth],
                                    ["Gender", ud.gender],
                                    ["Profile Created By", ud.profileCreatedBy],
                                ]} />

                                <Section title="Religion & Community" rows={[
                                    ["Religion", religion.religionName],
                                    ["Caste", religion.castName],
                                    ["Sub-Caste", religion.subcastName],
                                ]} />

                                <Section title="Primary Details" rows={[
                                    ["Marital Status", primary.maritalStatus],
                                    ["Mother Tongue", primary.mothertongueName],
                                    ["Children", primary.childStatus === "Yes" ? `Yes (${primary.numberOfChildrens})` : primary.childStatus],
                                    ["Location", [primary.cityName, primary.stateName, primary.countryName].filter(Boolean).join(", ")],
                                ]} />

                                <Section title="Education" rows={[
                                    ["Level", education.educationLevelName],
                                    ["Field", education.educationFieldName],
                                    ["College", education.collegeName],
                                ]} />

                                <Section title="Work & Package" rows={[
                                    ["Employer", work.employerName],
                                    ["Category", work.categoryName],
                                    ["Role", work.subcategoryName],
                                    ["Working With", work.workingWithName],
                                    ["Annual Income", work.annualIncomeName],
                                    ["Currency", work.currencyType],
                                ]} />

                                <Section title="Lifestyle & Appearance" rows={[
                                    ["Diet", lifestyle.diet],
                                    ["Smoke", lifestyle.smoke],
                                    ["Drink", lifestyle.drink],
                                    ["Height", lifestyle.heightFeet ? `${lifestyle.heightFeet}' ${lifestyle.heightInches}"` : undefined],
                                    ["Body Type", lifestyle.bodyType],
                                    ["Skin Tone", lifestyle.skinTone],
                                    ["Disability", aboutMe.anyDisability != null ? (aboutMe.anyDisability ? "Yes" : "No") : undefined],
                                ]} />

                                <Section title="Family" rows={[
                                    ["Father's Status", family.fatherStatusCategory],
                                    ["Mother's Status", family.motherStatusCategory],
                                    ["Brothers", family.numberOfBrothers != null ? `${family.numberOfBrothers} (${family.numberOfMarriedBrothers ?? 0} married)` : undefined],
                                    ["Sisters", family.numberOfSisters != null ? `${family.numberOfSisters} (${family.numberOfMarriedSisters ?? 0} married)` : undefined],
                                    ["Family Affluence", family.familyAffluenceCategory],
                                    ["Family Location", family.placeOfFamily],
                                ]} />

                                <Section title="Address" rows={[
                                    ["Address Line 1", address.addressLine1],
                                    ["Address Line 2", address.addressLine2],
                                    ["Pincode", address.pincode],
                                ]} />

                                <button
                                    onClick={() => navigate(-1)}
                                    style={{
                                        width: "80%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "24px auto 40px",
                                        padding: 14,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: "#fff",
                                        background: "#9B0424",
                                        border: "none",
                                        borderRadius: 50,
                                        cursor: "pointer",
                                        boxShadow: "0 4px 14px rgba(155,4,36,0.3)",
                                        fontFamily: "Rubik, sans-serif",
                                    }}
                                >← Back</button>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Home Indicator Bar ── */}
                <div style={{ display: "flex", justifyContent: "center", paddingBottom: 12, background: "#ffffff", flexShrink: 0 }}>
                    <div style={{ width: 120, height: 4, borderRadius: 2, background: "#ccc" }} />
                </div>
            </div>

            <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

            <style>{`
                @keyframes pd-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>
        </div>
    );
}