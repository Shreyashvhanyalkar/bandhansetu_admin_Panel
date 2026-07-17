// src/pages/admin/register/ProfessionalDetails.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useEducationLevels,
  useEducationFields,
  useIncomes,
  useWorkingWith,
  useWorkingCategories,
  useWorkingSubcategories,
  useSaveProfessionalDetails,
} from "../../../hooks/registerHooks/useProfessionaldetails";

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

export default function ProfessionalDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const registerData = location.state?.registerData || null;
  const basicDetails = location.state?.basicDetails || null;
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

  // ✅ STATE
  const [form, setForm] = useState({
    collegeName: "",
    educationLevelId: "",
    educationLevelLabel: "",
    educationFieldId: "",
    educationFieldLabel: "",
    employerName: "",
    annualIncomeId: "",
    annualIncomeLabel: "",
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
  const educationLevelsQuery = useEducationLevels();
  const incomesQuery = useIncomes();
  const workingWithQuery = useWorkingWith();

  // ✅ CASCADING QUERIES
  const educationFieldsQuery = useEducationFields(form.educationLevelId || null);
  const workingCategoriesQuery = useWorkingCategories(form.workingWithId || null);
  const workingSubcategoriesQuery = useWorkingSubcategories(form.workingCategoryId || null);

  // ✅ SAVE MUTATION
  const saveProfessionalDetailsMutation = useSaveProfessionalDetails();

  // Update function with scroll preservation
  const update = useCallback((key, idValue, labelValue) => {
    // Save scroll position before state update
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }

    setForm((prev) => {
      const next = { ...prev, [key]: idValue };
      
      // Add label if provided
      if (labelValue !== undefined) {
        const labelKey = key.replace("Id", "Label");
        next[labelKey] = labelValue;
      }

      // Reset cascading fields
      if (key === "educationLevelId") {
        next.educationFieldId = "";
        next.educationFieldLabel = "";
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

  // Handle text input changes
  const handleTextChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  }, []);

  const validate = () => {
    const e = {};
    
    // ✅ REQUIRED: Education level
    if (!form.educationLevelId) e.educationLevelId = "Please select education level";
    
    // ✅ REQUIRED: Annual income
    if (!form.annualIncomeId) e.annualIncomeId = "Please select annual income";
    
    // ✅ REQUIRED: Working with
    if (!form.workingWithId) e.workingWithId = "Please select working with";
    
    // ✅ REQUIRED: Working category
    if (!form.workingCategoryId) e.workingCategoryId = "Please select working category";
    
    // ✅ REQUIRED: Sub category
    if (!form.subCategoryId) e.subCategoryId = "Please select sub category";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    const payload = {
      userId,
      educationLevelName: form.educationLevelLabel,
      annualIncomeName: form.annualIncomeLabel,
      workingWithName: form.workingWithLabel,
      categoryName: form.workingCategoryLabel,
      subcategoryName: form.subCategoryLabel,
      currencyType: "INR",
    };

    // ✅ Only add optional fields if they have values
    if (form.collegeName?.trim()) {
      payload.collegeName = form.collegeName.trim();
    }

    if (form.educationFieldId && form.educationFieldLabel) {
      payload.educationFieldName = form.educationFieldLabel;
    }

    if (form.employerName?.trim()) {
      payload.employerName = form.employerName.trim();
    }

    // Remove undefined/empty fields
    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined && value !== "")
    );

    saveProfessionalDetailsMutation.mutate(cleanedPayload, {
      onSuccess: (data) => {
        setIsSaving(false);
        
        // Show success toast
        setToast({
          type: "success",
          title: "Success!",
          message: "Professional details saved successfully!",
        });

        // Navigate after a short delay to show the toast
        setTimeout(() => {
          navigate("/admin/register/personal-details", {
            state: { registerData, basicDetails, professionalDetails: form },
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
          message: error.message || "Failed to save professional details",
        });
        
        setErrors({ submit: error.message || "Failed to save professional details" });
      },
    });
  };

  // Loading state
  const isLoading = 
    educationLevelsQuery.isLoading || 
    incomesQuery.isLoading || 
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
            Loading professional details...
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
    educationLevelsQuery.isError || 
    incomesQuery.isError || 
    workingWithQuery.isError;

  if (hasError) {
    const errorMessage = 
      educationLevelsQuery.error?.message || 
      incomesQuery.error?.message || 
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

  // Text Input Component
  const TextInput = ({ label, name, value, placeholder, error, onChange, required = false }) => {
    const isPlaceholder = !value;
    
    return (
      <div style={{ marginBottom: 20 }} id={`field-${name}`}>
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          style={{
            width: "100%",
            padding: "14px 20px",
            fontSize: "15px",
            borderRadius: "12px",
            outline: "none",
            background: "#f2f2f2",
            color: isPlaceholder ? "#999" : "#333",
            boxSizing: "border-box",
            border: `1px solid ${error ? "#dc2626" : "#d98a9a"}`,
            fontFamily: "Rubik, sans-serif",
          }}
        />
        {error && <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0 4px" }}>{error}</p>}
      </div>
    );
  };

  // Select Component
  const SelectInput = ({ label, name, value, data, placeholder, disabled, isLoading, error, onChange, required = false }) => {
    const hasError = !!error;
    const isPlaceholder = !value;
    
    return (
      <div style={{ marginBottom: 20 }} id={`field-${name}`}>
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>}
        </label>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
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
        {error && <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0 4px" }}>{error}</p>}
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
            Professional Details
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
            {/* ✅ OPTIONAL - No asterisk */}
            <TextInput
              label="College Name (Optional)"
              name="collegeName"
              value={form.collegeName}
              placeholder="College name (optional)"
              error={errors.collegeName}
              onChange={(val) => handleTextChange("collegeName", val)}
              required={false}
            />

            {/* REQUIRED */}
            <SelectInput
              label="Education Level"
              name="educationLevelId"
              value={form.educationLevelId}
              data={educationLevelsQuery.data}
              placeholder="Education Level"
              isLoading={educationLevelsQuery.isLoading}
              error={errors.educationLevelId}
              onChange={(val) => {
                const selected = educationLevelsQuery.data?.find(item => item.id === val);
                update("educationLevelId", val, selected?.label || "");
              }}
              required={true}
            />

            {/* ✅ OPTIONAL - No asterisk */}
            <SelectInput
              label="Education Field (Optional)"
              name="educationFieldId"
              value={form.educationFieldId}
              data={educationFieldsQuery.data}
              placeholder="Education Field (optional)"
              disabled={!form.educationLevelId}
              isLoading={educationFieldsQuery.isLoading}
              error={errors.educationFieldId}
              onChange={(val) => {
                const selected = educationFieldsQuery.data?.find(item => item.id === val);
                update("educationFieldId", val, selected?.label || "");
              }}
              required={false}
            />

            {/* ✅ OPTIONAL - No asterisk */}
            <TextInput
              label="Employer Name (Optional)"
              name="employerName"
              value={form.employerName}
              placeholder="Employer name (optional)"
              error={errors.employerName}
              onChange={(val) => handleTextChange("employerName", val)}
              required={false}
            />

            {/* REQUIRED */}
            <SelectInput
              label="Annual Income (INR)"
              name="annualIncomeId"
              value={form.annualIncomeId}
              data={incomesQuery.data}
              placeholder="Annual Income"
              isLoading={incomesQuery.isLoading}
              error={errors.annualIncomeId}
              onChange={(val) => {
                const selected = incomesQuery.data?.find(item => item.id === val);
                update("annualIncomeId", val, selected?.label || "");
              }}
              required={true}
            />

            {/* REQUIRED */}
            <SelectInput
              label="Working With"
              name="workingWithId"
              value={form.workingWithId}
              data={workingWithQuery.data}
              placeholder="Working With"
              isLoading={workingWithQuery.isLoading}
              error={errors.workingWithId}
              onChange={(val) => {
                const selected = workingWithQuery.data?.find(item => item.id === val);
                update("workingWithId", val, selected?.label || "");
              }}
              required={true}
            />

            {/* REQUIRED */}
            <SelectInput
              label="Working Category"
              name="workingCategoryId"
              value={form.workingCategoryId}
              data={workingCategoriesQuery.data}
              placeholder="Working Category"
              disabled={!form.workingWithId}
              isLoading={workingCategoriesQuery.isLoading}
              error={errors.workingCategoryId}
              onChange={(val) => {
                const selected = workingCategoriesQuery.data?.find(item => item.id === val);
                update("workingCategoryId", val, selected?.label || "");
              }}
              required={true}
            />

            {/* REQUIRED */}
            <SelectInput
              label="Sub Category"
              name="subCategoryId"
              value={form.subCategoryId}
              data={workingSubcategoriesQuery.data}
              placeholder="Sub Category"
              disabled={!form.workingCategoryId}
              isLoading={workingSubcategoriesQuery.isLoading}
              error={errors.subCategoryId}
              onChange={(val) => {
                const selected = workingSubcategoriesQuery.data?.find(item => item.id === val);
                update("subCategoryId", val, selected?.label || "");
              }}
              required={true}
            />

            {errors.submit && (
              <p style={{ fontSize: 11, color: "#dc2626", margin: "12px 0 0 4px" }}>{errors.submit}</p>
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