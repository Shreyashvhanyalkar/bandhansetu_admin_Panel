// src/pages/admin/register/PartenerPreference.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useMaritalStatuses,
  useReligions,
  useCastes,
  useSubcastes,
  useMotherTongues,
  useCountries,
  useStates,
  useCities,
  useEducationLevels,
  useEducationFields,
  useWorkingWith,
  useWorkingCategories,
  useWorkingSubcategories,
  useSavePartnerPreferences,
} from "../../../hooks/registerHooks/usePartenerDetails";

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

// ------------------------------------------------------------------
// Dual-handle range slider (age / height)
// ------------------------------------------------------------------
function DualRangeSlider({ min, max, valueMin, valueMax, onChange, formatLabel }) {
  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), valueMax - 1);
    onChange(val, valueMax);
  };
  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), valueMin + 1);
    onChange(valueMin, val);
  };

  const percentMin = ((valueMin - min) / (max - min)) * 100;
  const percentMax = ((valueMax - min) / (max - min)) * 100;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#9B0424" }}>{formatLabel(valueMin)}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#9B0424" }}>{formatLabel(valueMax)}</span>
      </div>
      <div style={{ position: "relative", height: 28 }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            height: 4,
            width: "100%",
            background: "#eee",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            height: 4,
            background: "#9B0424",
            borderRadius: 2,
            left: `${percentMin}%`,
            width: `${percentMax - percentMin}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={handleMinChange}
          className="dual-range-thumb"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={handleMaxChange}
          className="dual-range-thumb"
        />
      </div>
    </div>
  );
}

const inchesToFeetLabel = (totalInches) => {
  const ft = Math.floor(totalInches / 12);
  const inch = totalInches % 12;
  return `${ft}'${inch}"`;
};

export default function PartenerPreference() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data carried over from earlier steps
  const registerData = location.state?.registerData || null;
  const basicDetails = location.state?.basicDetails || null;
  const professionalDetails = location.state?.professionalDetails || null;
  const personalDetails = location.state?.personalDetails || null;
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

  const [ageMin, setAgeMin] = useState(24);
  const [ageMax, setAgeMax] = useState(32);
  const [heightMin, setHeightMin] = useState(54); // 4'6"
  const [heightMax, setHeightMax] = useState(69); // 5'9"

  const [form, setForm] = useState({
    maritalStatusId: "",
    maritalStatusLabel: "",
    religionId: "",
    religionLabel: "",
    casteId: "",
    casteLabel: "",
    subcasteId: "",
    subcasteLabel: "",
    motherTongueId: "",
    motherTongueLabel: "",
    countryId: "",
    countryLabel: "",
    stateId: "",
    stateLabel: "",
    cityId: "",
    cityLabel: "",
    educationLevelId: "",
    educationLevelLabel: "",
    educationFieldId: "",
    educationFieldLabel: "",
    workingWithId: "",
    workingWithLabel: "",
    workingCategoryId: "",
    workingCategoryLabel: "",
    subCategoryId: "",
    subCategoryLabel: "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // ✅ MASTER DATA QUERIES
  const maritalStatusesQuery = useMaritalStatuses();
  const religionsQuery = useReligions();
  const motherTonguesQuery = useMotherTongues();
  const countriesQuery = useCountries();
  const educationLevelsQuery = useEducationLevels();
  const workingWithQuery = useWorkingWith();

  // ✅ CASCADING QUERIES
  const castesQuery = useCastes(form.religionId ? form.religionId : null);
  const subcastesQuery = useSubcastes(form.casteId ? form.casteId : null);
  const statesQuery = useStates(form.countryId ? form.countryId : null);
  const citiesQuery = useCities(form.stateId ? form.stateId : null);
  const educationFieldsQuery = useEducationFields(form.educationLevelId ? form.educationLevelId : null);
  const workingCategoriesQuery = useWorkingCategories(form.workingWithId ? form.workingWithId : null);
  const workingSubcategoriesQuery = useWorkingSubcategories(form.workingCategoryId ? form.workingCategoryId : null);

  // ✅ SAVE MUTATION
  const savePartnerPreferencesMutation = useSavePartnerPreferences();

  const update = useCallback((key, idValue, labelValue) => {
    // Save scroll position before state update
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }

    setForm((prev) => {
      const next = { ...prev, [key]: idValue, [`${key.replace("Id", "Label")}`]: labelValue };
      
      // Reset cascading fields
      if (key === "religionId") {
        next.casteId = "";
        next.casteLabel = "";
        next.subcasteId = "";
        next.subcasteLabel = "";
      }
      if (key === "casteId") {
        next.subcasteId = "";
        next.subcasteLabel = "";
      }
      if (key === "countryId") {
        next.stateId = "";
        next.stateLabel = "";
        next.cityId = "";
        next.cityLabel = "";
      }
      if (key === "stateId") {
        next.cityId = "";
        next.cityLabel = "";
      }
      if (key === "workingWithId") {
        next.workingCategoryId = "";
        next.workingCategoryLabel = "";
        next.subCategoryId = "";
        next.subCategoryLabel = "";
      }
      if (key === "workingCategoryId") {
        next.subCategoryId = "";
        next.subCategoryLabel = "";
      }
      if (key === "educationLevelId") {
        next.educationFieldId = "";
        next.educationFieldLabel = "";
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
    
    // ❌ REMOVED: All select field validations (now optional)
    // Only age and height are required (they have default values)
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    const payload = {
      userId,
      ageFrom: ageMin,
      ageTo: ageMax,
      heightFromFeet: Math.floor(heightMin / 12),
      heightFromInches: heightMin % 12,
      heightToFeet: Math.floor(heightMax / 12),
      heightToInches: heightMax % 12,
    };

    // ✅ Only add optional fields if they have values
    if (form.maritalStatusId && form.maritalStatusLabel) {
      payload.maritalStatus = [form.maritalStatusLabel];
    }

    if (form.religionId && form.religionLabel) {
      payload.religionName = [form.religionLabel];
    }

    if (form.casteId && form.casteLabel) {
      payload.castName = [form.casteLabel];
    }

    if (form.subcasteId && form.subcasteLabel) {
      payload.subcastName = [form.subcasteLabel];
    }

    if (form.motherTongueId && form.motherTongueLabel) {
      payload.mothertongueName = [form.motherTongueLabel];
    }

    if (form.countryId && form.countryLabel) {
      payload.countryName = [form.countryLabel];
    }

    if (form.stateId && form.stateLabel) {
      payload.stateName = [form.stateLabel];
    }

    if (form.cityId && form.cityLabel) {
      payload.cityName = [form.cityLabel];
    }

    if (form.educationLevelId && form.educationLevelLabel) {
      payload.educationLevelName = [form.educationLevelLabel];
    }

    if (form.educationFieldId && form.educationFieldLabel) {
      payload.educationFieldName = [form.educationFieldLabel];
    }

    if (form.workingWithId && form.workingWithLabel) {
      payload.workingWithName = [form.workingWithLabel];
    }

    if (form.workingCategoryId && form.workingCategoryLabel) {
      payload.workingWithCategoryName = [form.workingCategoryLabel];
    }

    if (form.subCategoryId && form.subCategoryLabel) {
      payload.subcategoryName = [form.subCategoryLabel];
    }

    savePartnerPreferencesMutation.mutate(payload, {
      onSuccess: (data) => {
        setIsSaving(false);
        
        // Show success toast
        setToast({
          type: "success",
          title: "Success!",
          message: "Partner preferences saved successfully!",
        });

        // Navigate after a short delay to show the toast
        setTimeout(() => {
          navigate("/admin/requests");
        }, 1000);
      },
      onError: (error) => {
        console.error("❌ Save failed:", error);
        setIsSaving(false);
        
        // Show error toast
        setToast({
          type: "error",
          title: "Error!",
          message: error.message || "Failed to save partner preferences",
        });
        
        setErrors({ submit: error.message || "Failed to save partner preferences" });
      },
    });
  };

  // Loading state
  const isLoading = 
    maritalStatusesQuery.isLoading || 
    religionsQuery.isLoading || 
    motherTonguesQuery.isLoading || 
    countriesQuery.isLoading ||
    educationLevelsQuery.isLoading ||
    workingWithQuery.isLoading;

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
            Loading partner preferences...
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
    maritalStatusesQuery.isError || 
    religionsQuery.isError || 
    motherTonguesQuery.isError || 
    countriesQuery.isError ||
    educationLevelsQuery.isError ||
    workingWithQuery.isError;

  if (hasError) {
    const errorMessage = 
      maritalStatusesQuery.error?.message || 
      religionsQuery.error?.message || 
      motherTonguesQuery.error?.message || 
      countriesQuery.error?.message ||
      educationLevelsQuery.error?.message ||
      workingWithQuery.error?.message ||
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

  const SelectField = ({ label, name, value, data, placeholder, disabled, isLoading, required = false }) => {
    const fieldError = errors[name.replace("Id", "")];
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
          disabled={disabled || isLoading}
          style={{
            ...selectStyle(hasError),
            opacity: disabled || isLoading ? 0.6 : 1,
            cursor: disabled || isLoading ? "not-allowed" : "pointer",
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
            Partner Preference
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
            {/* Preferred Age Range - REQUIRED */}
            <div style={{ marginBottom: 24 }} id="field-age">
              <label style={labelStyle}>
                Preferred age range <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>
              </label>
              <DualRangeSlider
                min={18}
                max={60}
                valueMin={ageMin}
                valueMax={ageMax}
                onChange={(lo, hi) => {
                  setAgeMin(lo);
                  setAgeMax(hi);
                }}
                formatLabel={(v) => `${v}y`}
              />
            </div>

            {/* ALL SELECT FIELDS ARE NOW OPTIONAL */}
            <SelectField
              label="Marital Status (Optional)"
              name="maritalStatusId"
              value={form.maritalStatusId}
              data={maritalStatusesQuery.data}
              placeholder="Marital Status (optional)"
              isLoading={maritalStatusesQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Preferred Religion (Optional)"
              name="religionId"
              value={form.religionId}
              data={religionsQuery.data}
              placeholder="Religion (optional)"
              isLoading={religionsQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Preferred Caste (Optional)"
              name="casteId"
              value={form.casteId}
              data={castesQuery.data}
              placeholder="Caste (optional)"
              disabled={!form.religionId}
              isLoading={castesQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Preferred Subcaste (Optional)"
              name="subcasteId"
              value={form.subcasteId}
              data={subcastesQuery.data}
              placeholder="Subcaste (optional)"
              disabled={!form.casteId}
              isLoading={subcastesQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Mother Tongue (Optional)"
              name="motherTongueId"
              value={form.motherTongueId}
              data={motherTonguesQuery.data}
              placeholder="Mother Tongue (optional)"
              isLoading={motherTonguesQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Preferred Country (Optional)"
              name="countryId"
              value={form.countryId}
              data={countriesQuery.data}
              placeholder="Country (optional)"
              isLoading={countriesQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Preferred State (Optional)"
              name="stateId"
              value={form.stateId}
              data={statesQuery.data}
              placeholder="State (optional)"
              disabled={!form.countryId}
              isLoading={statesQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Preferred City (Optional)"
              name="cityId"
              value={form.cityId}
              data={citiesQuery.data}
              placeholder="City (optional)"
              disabled={!form.stateId}
              isLoading={citiesQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Education Level (Optional)"
              name="educationLevelId"
              value={form.educationLevelId}
              data={educationLevelsQuery.data}
              placeholder="Education Level (optional)"
              isLoading={educationLevelsQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Education Field (Optional)"
              name="educationFieldId"
              value={form.educationFieldId}
              data={educationFieldsQuery.data}
              placeholder="Education Field (optional)"
              disabled={!form.educationLevelId}
              isLoading={educationFieldsQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Working With (Optional)"
              name="workingWithId"
              value={form.workingWithId}
              data={workingWithQuery.data}
              placeholder="Working With (optional)"
              isLoading={workingWithQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Working With Category (Optional)"
              name="workingCategoryId"
              value={form.workingCategoryId}
              data={workingCategoriesQuery.data}
              placeholder="Category (optional)"
              disabled={!form.workingWithId}
              isLoading={workingCategoriesQuery.isLoading}
              required={false}
            />

            <SelectField
              label="Sub-Category (Optional)"
              name="subCategoryId"
              value={form.subCategoryId}
              data={workingSubcategoriesQuery.data}
              placeholder="Sub-Category (optional)"
              disabled={!form.workingCategoryId}
              isLoading={workingSubcategoriesQuery.isLoading}
              required={false}
            />

            {/* Height Preference - REQUIRED */}
            <div style={{ marginBottom: 24 }} id="field-height">
              <label style={labelStyle}>
                Height preference <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>
              </label>
              <DualRangeSlider
                min={48}
                max={84}
                valueMin={heightMin}
                valueMax={heightMax}
                onChange={(lo, hi) => {
                  setHeightMin(lo);
                  setHeightMax(hi);
                }}
                formatLabel={inchesToFeetLabel}
              />
            </div>

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

      {/* Dual range slider thumb styling (applies globally, scoped by class name) */}
      <style>{`
        .dual-range-thumb {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          transform: translateY(-50%);
          margin: 0;
          background: transparent;
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
        }
        .dual-range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #9B0424;
          border: 3px solid #fff;
          box-shadow: 0 2px 6px rgba(155,4,36,0.4);
          cursor: pointer;
        }
        .dual-range-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #9B0424;
          border: 3px solid #fff;
          box-shadow: 0 2px 6px rgba(155,4,36,0.4);
          cursor: pointer;
        }
        .dual-range-thumb::-webkit-slider-runnable-track {
          background: transparent;
        }
        .dual-range-thumb::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}