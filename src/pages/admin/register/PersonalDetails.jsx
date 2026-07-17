// src/pages/admin/register/PersonalDetails.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useDiets,
  useBodyTypes,
  useSkinTones,
  useSavePersonalDetails,
} from "../../../hooks/registerHooks/usePersonalDetails";

// Toast Component
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className={`rounded-lg shadow-lg p-4 min-w-[300px] max-w-md ${
        toast.type === "success" ? "bg-green-50 border-l-4 border-green-500" : "bg-red-50 border-l-4 border-red-500"
      }`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className={`font-semibold ${toast.type === "success" ? "text-green-800" : "text-red-800"}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className="text-sm mt-1 text-gray-600">{toast.message}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PersonalDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data carried over from earlier steps
  const registerData = location.state?.registerData || null;
  const basicDetails = location.state?.basicDetails || null;
  const professionalDetails = location.state?.professionalDetails || null;
  const userId = registerData?.userId;

  // Refs for scroll preservation
  const formRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Check if user data exists
  useEffect(() => {
    if (!registerData || !userId) {
      console.warn("⚠️ No registration data found, redirecting...");
      navigate("/admin/register");
    }
  }, [registerData, userId, navigate]);

  // ✅ STATE INITIALIZATION
  const [form, setForm] = useState({
    dietId: "",
    dietLabel: "",
    smoke: "",
    drink: "",
    heightFeet: "",
    heightInches: "",
    userWeight: "",
    bodyTypeId: "",
    bodyTypeLabel: "",
    skinToneId: "",
    skinToneLabel: "",
    anyDisability: "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // ✅ MASTER DATA QUERIES
  const dietsQuery = useDiets();
  const bodyTypesQuery = useBodyTypes();
  const skinTonesQuery = useSkinTones();

  // ✅ SAVE MUTATION
  const savePersonalDetailsMutation = useSavePersonalDetails();

  // Update form with scroll preservation
  const update = useCallback((key, value, label) => {
    // Save current scroll position before state update
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }

    setForm((prev) => {
      const next = { ...prev, [key]: value };
      
      // Add label if provided
      if (label) {
        const labelKey = key.replace("Id", "Label");
        next[labelKey] = label;
      }

      return next;
    });
    setErrors((p) => ({ ...p, [key.replace("Id", "")]: "" }));

    // Restore scroll position after state update
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollPositionRef.current;
      }
    });
  }, []);

  const validate = () => {
    const e = {};
    
    // ✅ REQUIRED: Diet
    if (!form.dietId) e.dietId = "Please select diet";
    
    // ✅ REQUIRED: Height (both feet and inches)
    if (!form.heightFeet) e.heightFeet = "Please select feet";
    if (!form.heightInches) e.heightInches = "Please select inches";
    
    // ✅ REQUIRED: Weight
    if (!form.userWeight) e.userWeight = "Please select weight";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    // Parse height
    const heightFeet = parseInt(form.heightFeet);
    const heightInches = parseInt(form.heightInches);
    const userWeight = parseInt(form.userWeight);

    const payload = {
      userId,
      diet: form.dietLabel,
      heightFeet: heightFeet,
      heightInches: heightInches,
      userWeight: userWeight,
    };

    // ✅ Only add optional fields if they have values
    if (form.smoke) {
      payload.smoke = form.smoke;
    }

    if (form.drink) {
      payload.drink = form.drink;
    }

    if (form.bodyTypeId && form.bodyTypeLabel) {
      payload.bodyType = form.bodyTypeLabel;
    }

    if (form.skinToneId && form.skinToneLabel) {
      payload.skinTone = form.skinToneLabel;
    }

    if (form.anyDisability) {
      payload.anyDisability = form.anyDisability;
    }

    savePersonalDetailsMutation.mutate(payload, {
      onSuccess: (data) => {
        setIsSaving(false);
        
        // Show success toast
        setToast({
          type: "success",
          title: "Success!",
          message: "Personal details saved successfully!",
        });

        // Navigate after a short delay to show the toast
        setTimeout(() => {
          navigate("/admin/register/partner-preference", {
            state: { 
              registerData, 
              basicDetails, 
              professionalDetails, 
              personalDetails: form 
            },
          });
        }, 1000);
      },
      onError: (error) => {
        console.error("❌ Save failed:", error);
        setIsSaving(false);
        
        // Show error toast
        setToast({
          type: "error",
          title: "Error!",
          message: error.message || "Failed to save personal details",
        });
        
        setErrors({ submit: error.message || "Failed to save personal details" });
      },
    });
  };

  // Loading state
  const isLoading = 
    dietsQuery.isLoading || 
    bodyTypesQuery.isLoading || 
    skinTonesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb]">
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ 
            width: 50, 
            height: 50, 
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #601000",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }} />
          <h3 style={{ color: "#601000", fontFamily: "Rubik, sans-serif" }}>
            Loading personal details...
          </h3>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  const hasError = 
    dietsQuery.isError || 
    bodyTypesQuery.isError || 
    skinTonesQuery.isError;

  if (hasError) {
    const errorMessage = 
      dietsQuery.error?.message || 
      bodyTypesQuery.error?.message || 
      skinTonesQuery.error?.message || 
      "Failed to load required data";

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-4">
        <div style={{ 
          textAlign: "center", 
          padding: 40, 
          maxWidth: 400,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ color: "#dc2626", fontFamily: "Rubik, sans-serif", marginBottom: 8 }}>
            Error Loading Data
          </h3>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
            {errorMessage}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 32px",
              background: "#601000",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "Rubik, sans-serif",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectStyle = (hasError) => ({
    width: "100%",
    padding: "14px 20px",
    fontSize: "15px",
    borderRadius: "12px",
    outline: "none",
    background: "#f2f2f2",
    color: "#333",
    boxSizing: "border-box",
    border: `1px solid ${hasError ? "#dc2626" : "#d98a9a"}`,
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 18px center",
    cursor: "pointer",
    fontFamily: "Rubik, sans-serif",
  });

  const labelStyle = {
    fontSize: "14px",
    fontWeight: 700,
    color: "#7a1220",
    marginBottom: 8,
    display: "block",
    fontFamily: "Rubik, sans-serif",
  };

  // SelectField component
  const SelectField = ({ label, name, value, data, placeholder, isLoading, required = false }) => {
    const fieldError = errors[name];
    const hasError = !!fieldError;
    const isPlaceholder = !value;
    
    return (
      <div style={{ marginBottom: 20 }} id={`field-${name}`}>
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>}
        </label>
        <select
          value={value || ""}
          onChange={(e) => {
            const selectedItem = data?.find((item) => item.id === e.target.value);
            update(name, e.target.value, selectedItem?.label || "");
          }}
          disabled={isLoading}
          style={{
            ...selectStyle(hasError),
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
            color: isPlaceholder ? "#999" : "#333",
          }}
        >
          <option value="" style={{ color: "#999", fontWeight: 400 }}>
            {isLoading ? "Loading..." : placeholder}
          </option>
          {data?.map((item) => (
            <option key={item.id} value={item.id} style={{ color: "#333", fontWeight: 400 }}>
              {item.label}
            </option>
          ))}
        </select>
        {hasError && (
          <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0 4px" }}>
            {fieldError}
          </p>
        )}
      </div>
    );
  };

  // SimpleSelectField component
  const SimpleSelectField = ({ label, name, value, options, placeholder, required = false }) => {
    const fieldError = errors[name];
    const hasError = !!fieldError;
    const isPlaceholder = !value;
    
    return (
      <div style={{ marginBottom: 20 }} id={`field-${name}`}>
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>}
        </label>
        <select
          value={value || ""}
          onChange={(e) => update(name, e.target.value)}
          style={{
            ...selectStyle(hasError),
            color: isPlaceholder ? "#999" : "#333",
          }}
        >
          <option value="" style={{ color: "#999", fontWeight: 400 }}>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} style={{ color: "#333", fontWeight: 400 }}>
              {opt}
            </option>
          ))}
        </select>
        {hasError && (
          <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0 4px" }}>
            {fieldError}
          </p>
        )}
      </div>
    );
  };

  // Height options
  const FEET_OPTIONS = ["4", "5", "6", "7"];
  const INCH_OPTIONS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
  const WEIGHT_OPTIONS = [
    "Below 40",
    "40",
    "45",
    "50",
    "55",
    "60",
    "65",
    "70",
    "75",
    "80",
    "85",
    "90",
    "95",
    "100",
    "105",
    "110",
    "115",
    "120",
    "125",
    "130+",
  ];
  const SMOKE_OPTIONS = ["No", "Occasionally", "Yes"];
  const DRINK_OPTIONS = ["No", "Occasionally", "Yes"];
  const DISABILITY_OPTIONS = ["No", "Yes"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-0 sm:px-4 font-[Rubik,sans-serif]">
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <div 
        className="w-full sm:max-w-md min-h-screen sm:min-h-[85vh] sm:h-auto sm:rounded-2xl sm:shadow-2xl sm:my-8 flex flex-col relative overflow-hidden bg-white"
        ref={formRef}
      >
        {/* Header */}
        <div style={{ padding: "28px 24px 16px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#601000", margin: 0, fontFamily: "Rubik, sans-serif" }}>
            Personal Details
          </h1>
        </div>
        <div style={{ borderBottom: "1px solid #eee" }} />

        {/* Form */}
        <div 
          ref={scrollContainerRef}
          style={{ 
            flex: 1, 
            padding: "20px 24px 32px", 
            overflowY: "auto",
            maxHeight: "calc(100vh - 200px)",
          }}
        >
          <form onSubmit={handleSave}>
            {/* Diet - REQUIRED */}
            <SelectField
              label="Diet"
              name="dietId"
              value={form.dietId}
              data={dietsQuery.data}
              placeholder="Select Diet"
              isLoading={dietsQuery.isLoading}
              required={true}
            />

            {/* Smoke - OPTIONAL */}
            <SimpleSelectField
              label="Smoke (Optional)"
              name="smoke"
              value={form.smoke}
              options={SMOKE_OPTIONS}
              placeholder="Do you smoke? (optional)"
              required={false}
            />

            {/* Drink - OPTIONAL */}
            <SimpleSelectField
              label="Drink (Optional)"
              name="drink"
              value={form.drink}
              options={DRINK_OPTIONS}
              placeholder="Do you drink? (optional)"
              required={false}
            />

            {/* Height: Feet + Inches - REQUIRED */}
            <div style={{ marginBottom: 20 }} id="field-height">
              <label style={labelStyle}>
                Height <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <select
                    value={form.heightFeet}
                    onChange={(e) => update("heightFeet", e.target.value)}
                    style={{
                      ...selectStyle(!!errors.heightFeet),
                      color: !form.heightFeet ? "#999" : "#333",
                    }}
                  >
                    <option value="" style={{ color: "#999", fontWeight: 400 }}>Feet</option>
                    {FEET_OPTIONS.map((ft) => (
                      <option key={ft} value={ft} style={{ color: "#333", fontWeight: 400 }}>
                        {ft} ft
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <select
                    value={form.heightInches}
                    onChange={(e) => update("heightInches", e.target.value)}
                    style={{
                      ...selectStyle(!!errors.heightInches),
                      color: !form.heightInches ? "#999" : "#333",
                    }}
                  >
                    <option value="" style={{ color: "#999", fontWeight: 400 }}>Inches</option>
                    {INCH_OPTIONS.map((inch) => (
                      <option key={inch} value={inch} style={{ color: "#333", fontWeight: 400 }}>
                        {inch} in
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(errors.heightFeet || errors.heightInches) && (
                <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0 4px" }}>
                  {errors.heightFeet || errors.heightInches}
                </p>
              )}
            </div>

            {/* Weight - REQUIRED */}
            <SimpleSelectField
              label="Weight (kg)"
              name="userWeight"
              value={form.userWeight}
              options={WEIGHT_OPTIONS}
              placeholder="Select Weight"
              required={true}
            />

            {/* Body Type - OPTIONAL */}
            <SelectField
              label="Body Type (Optional)"
              name="bodyTypeId"
              value={form.bodyTypeId}
              data={bodyTypesQuery.data}
              placeholder="Select Body Type (optional)"
              isLoading={bodyTypesQuery.isLoading}
              required={false}
            />

            {/* Skin Tone - OPTIONAL */}
            <SelectField
              label="Skin Tone (Optional)"
              name="skinToneId"
              value={form.skinToneId}
              data={skinTonesQuery.data}
              placeholder="Select Skin Tone (optional)"
              isLoading={skinTonesQuery.isLoading}
              required={false}
            />

            {/* Any Disability - OPTIONAL */}
            <SimpleSelectField
              label="Any Disability (Optional)"
              name="anyDisability"
              value={form.anyDisability}
              options={DISABILITY_OPTIONS}
              placeholder="Select Disability (optional)"
              required={false}
            />

            {/* Submit Error */}
            {errors.submit && (
              <p style={{ fontSize: 11, color: "#dc2626", margin: "12px 0 0 4px" }}>
                {errors.submit}
              </p>
            )}

            {/* Save and Continue Button */}
            <button
              type="submit"
              disabled={isSaving}
              style={{
                width: "100%",
                padding: "15px",
                fontSize: "15px",
                fontWeight: 700,
                color: "#fff",
                background: isSaving ? "#9b9b9b" : "linear-gradient(135deg, #8a0420, #601000)",
                border: "none",
                borderRadius: 50,
                cursor: isSaving ? "not-allowed" : "pointer",
                boxShadow: isSaving ? "none" : "0 4px 14px rgba(96,16,0,0.35)",
                fontFamily: "Rubik, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginTop: 24,
              }}
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" strokeLinejoin="round" />
                    <polyline points="17 21 17 13 7 13 7 21" strokeLinejoin="round" />
                    <polyline points="7 3 7 8 15 8" strokeLinejoin="round" />
                  </svg>
                  Save and Continue
                </>
              )}
            </button>
          </form>
        </div>

        {/* Home Indicator */}
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 12 }}>
          <div style={{ width: 120, height: 4, borderRadius: 2, background: "#bbb" }} />
        </div>
      </div>
    </div>
  );
}