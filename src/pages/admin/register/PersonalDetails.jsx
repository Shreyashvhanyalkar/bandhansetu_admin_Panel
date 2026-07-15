// src/pages/admin/register/PersonalDetails.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useDiets,
  useBodyTypes,
  useSkinTones,
  useSavePersonalDetails,
} from "../../../hooks/registerHooks/usePersonalDetails";

export default function PersonalDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data carried over from earlier steps
  const registerData = location.state?.registerData || null;
  const basicDetails = location.state?.basicDetails || null;
  const professionalDetails = location.state?.professionalDetails || null;
  const userId = registerData?.userId;

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
    anyDisability: "No",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // ✅ MASTER DATA QUERIES
  const dietsQuery = useDiets();
  const bodyTypesQuery = useBodyTypes();
  const skinTonesQuery = useSkinTones();

  // ✅ SAVE MUTATION
  const savePersonalDetailsMutation = useSavePersonalDetails();

  // Update form
  const update = (key, value, label) => {
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
  };

  const validate = () => {
    const e = {};
    
    if (!form.dietId) e.dietId = "Please select diet";
    if (!form.smoke) e.smoke = "Please select an option";
    if (!form.drink) e.drink = "Please select an option";
    if (!form.heightFeet) e.heightFeet = "Please select feet";
    if (!form.heightInches) e.heightInches = "Please select inches";
    if (!form.userWeight) e.userWeight = "Please select weight";
    if (!form.bodyTypeId) e.bodyTypeId = "Please select body type";
    if (!form.skinToneId) e.skinToneId = "Please select skin tone";
    if (!form.anyDisability) e.anyDisability = "Please select an option";
    
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
      smoke: form.smoke,
      drink: form.drink,
      anyDisability: form.anyDisability,
      bodyType: form.bodyTypeLabel,
      skinTone: form.skinToneLabel,
    };

    console.log("📤 Sending personal details payload:", payload);

    savePersonalDetailsMutation.mutate(payload, {
      onSuccess: (data) => {
        console.log("✅ Personal details saved:", data);
        setIsSaving(false);
        navigate("/admin/register/partner-preference", {
          state: { 
            registerData, 
            basicDetails, 
            professionalDetails, 
            personalDetails: form 
          },
        });
      },
      onError: (error) => {
        console.error("❌ Save failed:", error);
        setIsSaving(false);
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

  const SelectField = ({ label, name, value, data, placeholder, isLoading }) => {
    const fieldError = errors[name];
    const hasError = !!fieldError;
    
    return (
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>{label}</label>
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
          }}
        >
          <option value="">
            {isLoading ? "Loading..." : placeholder}
          </option>
          {data?.map((item) => (
            <option key={item.id} value={item.id}>
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

  const SimpleSelectField = ({ label, name, value, options, placeholder }) => {
    const fieldError = errors[name];
    const hasError = !!fieldError;
    
    return (
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>{label}</label>
        <select
          value={value || ""}
          onChange={(e) => update(name, e.target.value)}
          style={selectStyle(hasError)}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
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
      <div className="w-full sm:max-w-md min-h-screen sm:min-h-[85vh] sm:h-auto sm:rounded-2xl sm:shadow-2xl sm:my-8 flex flex-col relative overflow-hidden bg-white">
        {/* Header */}
        <div style={{ padding: "28px 24px 16px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#601000", margin: 0, fontFamily: "Rubik, sans-serif" }}>
            Personal Details
          </h1>
          {userId && (
            <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
              User ID: {userId}
            </p>
          )}
        </div>
        <div style={{ borderBottom: "1px solid #eee" }} />

        {/* Form */}
        <div style={{ flex: 1, padding: "20px 24px 32px", overflowY: "auto" }}>
          <form onSubmit={handleSave}>
            {/* Diet */}
            <SelectField
              label="Diet"
              name="dietId"
              value={form.dietId}
              data={dietsQuery.data}
              placeholder="Select Diet"
              isLoading={dietsQuery.isLoading}
            />

            {/* Smoke */}
            <SimpleSelectField
              label="Smoke"
              name="smoke"
              value={form.smoke}
              options={SMOKE_OPTIONS}
              placeholder="Do you smoke?"
            />

            {/* Drink */}
            <SimpleSelectField
              label="Drink"
              name="drink"
              value={form.drink}
              options={DRINK_OPTIONS}
              placeholder="Do you drink?"
            />

            {/* Height: Feet + Inches */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Height</label>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <select
                    value={form.heightFeet}
                    onChange={(e) => update("heightFeet", e.target.value)}
                    style={selectStyle(!!errors.heightFeet)}
                  >
                    <option value="">Feet</option>
                    {FEET_OPTIONS.map((ft) => (
                      <option key={ft} value={ft}>
                        {ft} ft
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <select
                    value={form.heightInches}
                    onChange={(e) => update("heightInches", e.target.value)}
                    style={selectStyle(!!errors.heightInches)}
                  >
                    <option value="">Inches</option>
                    {INCH_OPTIONS.map((inch) => (
                      <option key={inch} value={inch}>
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

            {/* Weight */}
            <SimpleSelectField
              label="Weight (kg)"
              name="userWeight"
              value={form.userWeight}
              options={WEIGHT_OPTIONS}
              placeholder="Select Weight"
            />

            {/* Body Type */}
            <SelectField
              label="Body Type"
              name="bodyTypeId"
              value={form.bodyTypeId}
              data={bodyTypesQuery.data}
              placeholder="Select Body Type"
              isLoading={bodyTypesQuery.isLoading}
            />

            {/* Skin Tone */}
            <SelectField
              label="Skin Tone"
              name="skinToneId"
              value={form.skinToneId}
              data={skinTonesQuery.data}
              placeholder="Select Skin Tone"
              isLoading={skinTonesQuery.isLoading}
            />

            {/* Any Disability */}
            <SimpleSelectField
              label="Any Disability"
              name="anyDisability"
              value={form.anyDisability}
              options={DISABILITY_OPTIONS}
              placeholder="Select Disability"
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
                marginTop: 8,
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