// src/pages/admin/GalleryPage.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

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

function SecureImage({ fileName, alt, style, className }) {
    const [imgSrc, setImgSrc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!fileName) {
            setImgSrc(null);
            return;
        }

        let isMounted = true;
        const controller = new AbortController();

        const fetchImage = async () => {
            setLoading(true);
            setError(false);
            try {
                const url = `${BASE_URL}/api/file/download/thumbnail_${fileName}`;
                const res = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "x-app-type": "admin",
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to download image");
                }

                const blob = await res.blob();
                if (isMounted) {
                    const objectUrl = URL.createObjectURL(blob);
                    setImgSrc(prevUrl => {
                        if (prevUrl) URL.revokeObjectURL(prevUrl);
                        return objectUrl;
                    });
                }
            } catch (err) {
                if (err.name !== "AbortError" && isMounted) {
                    setError(true);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [fileName]);

    useEffect(() => {
        return () => {
            if (imgSrc) {
                URL.revokeObjectURL(imgSrc);
            }
        };
    }, [imgSrc]);

    if (loading) {
        return (
            <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0e8e8" }} className={className}>
                <span style={{ fontSize: 12, color: "#9B0424" }}>Loading...</span>
            </div>
        );
    }

    if (error || !imgSrc) {
        return (
            <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0e8e8" }} className={className}>
                <span style={{ fontSize: 24 }}>🖼️</span>
            </div>
        );
    }

    return <img src={imgSrc} alt={alt} style={style} className={className} />;
}

function Lightbox({ fileName, onClose }) {
    if (!fileName) return null;
    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 40, height: 40, borderRadius: "50%", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <div onClick={e => e.stopPropagation()}>
                <SecureImage
                    fileName={fileName}
                    alt="Full view"
                    style={{ maxWidth: "92vw", maxHeight: "88vh", borderRadius: 16, objectFit: "contain", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
                />
            </div>
        </div>
    );
}

export default function GalleryPage() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { data: gallery = [], isLoading } = useUserGallery(userId);
    const [lightboxFileName, setLightboxFileName] = useState(null);

    const getImageUrl = (fileName) => `${IMAGE_DOWNLOAD_URL}${fileName}`;

    // Split into rows of 3
    const rows = [];
    for (let i = 0; i < gallery.length; i += 3) {
        rows.push(gallery.slice(i, i + 3));
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(165.4deg, rgba(255,246,222,0.9) 0.5%, rgba(255,255,255,0.9) 47.97%, rgba(255,246,222,0.9) 79.67%)",
            fontFamily: "Rubik, sans-serif",
            display: "flex", flexDirection: "column",
            maxWidth: 411, margin: "0 auto",
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center",
                padding: "48px 16px 16px",
                background: "transparent",
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: "none", border: "none", fontSize: 22, color: "#222", cursor: "pointer", padding: "0 8px 0 0", display: "flex", alignItems: "center" }}
                >←</button>
                <h2 style={{ fontWeight: 700, fontSize: 20, color: "#111", margin: 0 }}>My Photo Gallery</h2>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#e0e0e0", margin: "0 0 8px" }} />

            {/* Gallery grid */}
            <div style={{ flex: 1, padding: "16px 16px 40px" }}>
                {isLoading ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{ width: 94, height: 94, borderRadius: "50%", background: "#e0e0e0", animation: "gal-pulse 1.5s ease-in-out infinite" }} />
                        ))}
                    </div>
                ) : gallery.length === 0 ? (
                    <div style={{ textAlign: "center", paddingTop: 60, color: "#888" }}>
                        <p style={{ fontSize: 40, margin: 0 }}>🖼️</p>
                        <p style={{ marginTop: 12, fontWeight: 600 }}>No photos yet</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {rows.map((row, rowIdx) => (
                           <div
                                key={rowIdx}
                                data-testid={rowIdx === 0 ? "gallery-row-first" : "gallery-row"}
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    padding: "8px 10px",
                                    borderRadius: 61.68,
                                    border: rowIdx === 0 ? "2px solid #9B0424" : "none",
                                    background: rowIdx === 0 ? "rgba(155,4,36,0.04)" : "transparent",
                                    alignItems: "center",
                                }}
                            >
                                {row.map((img, colIdx) => {
                                    const fName = img.fileName || img.file_name;
                                    const isProfilePic = img.isProfilePicture || img.is_profile_picture || img.isProfilePicture === 1 || img.is_profile_picture === 1;
                                    return (
                                        <div
                                            key={fName || colIdx}
                                            data-testid={isProfilePic ? "profile-image" : "gallery-image"}
                                            onClick={() => setLightboxFileName(fName)}
                                            style={{
                                                position: "relative",
                                                width: 94,
                                                height: 94,
                                                borderRadius: "50%",
                                                overflow: "hidden",
                                                cursor: "pointer",
                                                background: "#f0e8e8",
                                                border: isProfilePic
                                                    ? "2.5px solid #9B0424"
                                                    : "2px solid #d1a0a0",
                                                flexShrink: 0,
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                            }}
                                        >
                                            <SecureImage
                                                fileName={fName}
                                                alt={`Photo ${rowIdx * 3 + colIdx + 1}`}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        {/* Red minus badge (display only) */}
                                        {/* Red minus badge (display only) */}
                                        <div data-testid="minus-badge" style={{
                                            position: "absolute", top: 4, right: 4,
                                            width: 20, height: 20, borderRadius: "50%",
                                            background: "#9B0424",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <span style={{ color: "#fff", fontSize: 14, lineHeight: 1, fontWeight: 700 }}>−</span>
                                        </div>
                                    </div>
                                );
                            })}

                                {/* Empty placeholder circles to fill row */}
                                {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, k) => (
                                    <div key={`empty-${k}`} data-testid="gallery-placeholder" style={{
                                        width: 94, height: 94, borderRadius: "50%",
                                        background: "rgba(155,4,36,0.06)",
                                        border: "2px dashed #d1a0a0",
                                        flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <span style={{ color: "#9B0424", fontSize: 28, fontWeight: 300 }}>+</span>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* If all rows full, show empty row with + */}
                        {gallery.length % 3 === 0 && (
                            <div style={{
                                display: "flex", gap: 12,
                                padding: "8px 10px",
                                borderRadius: 61.68,
                                alignItems: "center",
                            }}>
                                {[0, 1, 2].map(k => (
                                    <div key={k} style={{
                                        width: 94, height: 94, borderRadius: "50%",
                                        background: k === 2 ? "rgba(155,4,36,0.06)" : "rgba(155,4,36,0.04)",
                                        border: "2px dashed #d1a0a0",
                                        flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        {k === 2 && <span style={{ color: "#9B0424", fontSize: 28, fontWeight: 300 }}>+</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Lightbox fileName={lightboxFileName} onClose={() => setLightboxFileName(null)} />

            <style>{`
                @keyframes gal-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>
        </div>
    );
}