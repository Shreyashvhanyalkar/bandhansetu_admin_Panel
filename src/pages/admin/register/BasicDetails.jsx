// src/pages/admin/register/BasicDetails.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useReligions,
  useCastes,
  useSubcastes,
  useCountries,
  useStates,
  useCities,
  useMotherTongues,
  useMaritalStatuses,
  useSaveBasicDetails,
} from "../../../hooks/registerHooks/useBasicdetail";

export default function BasicDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data from previous step (Register)
  const registerData = location.state?.registerData || null;
  const userId = registerData?.userId;

  // Ref to track which field is being interacted with
  const activeFieldRef = useRef(null);
  const formRef = useRef(null);

  // ✅ STEP 1: ALL useState hooks FIRST
  const [form, setForm] = useState({
    religionId: "",
    religionLabel: "",
    casteId: "",
    casteLabel: "",
    subcasteId: "",
    subcasteLabel: "",
    countryId: "",
    countryLabel: "",
    stateId: "",
    stateLabel: "",
    cityId: "",
    cityLabel: "",
    maritalStatusId: "",
    maritalStatusLabel: "",
    maritalStatusShowsChildren: false,
    childStatus: "",
    numberOfChildren: "",
    motherTongueId: "",
    motherTongueLabel: "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // ✅ STEP 2: Master data queries (don't depend on form)
  const religionsQuery = useReligions();
  const maritalStatusesQuery = useMaritalStatuses();
  const motherTonguesQuery = useMotherTongues();
  const countriesQuery = useCountries();

  // ✅ STEP 3: Cascading queries (NOW form is defined)
  const castesQuery = useCastes(
    form.religionId ? form.religionId : null
  );
  const subcastesQuery = useSubcastes(
    form.casteId ? form.casteId : null
  );
  const statesQuery = useStates(
    form.countryId ? form.countryId : null
  );
  const citiesQuery = useCities(
    form.stateId ? form.stateId : null
  );

  // ✅ STEP 4: Save mutation
  const saveBasicDetailsMutation = useSaveBasicDetails();

  // ✅ STEP 5: useEffect hooks
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Update form and handle cascading resets
  const update = useCallback((key, idValue, labelValue) => {
    setForm((prev) => {
      const next = { ...prev, [key]: idValue, [`${key.replace("Id", "Label")}`]: labelValue };

      // Reset cascading fields when parent changes
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

      // Handle marital status selection
      if (key === "maritalStatusId") {
        const showsChildren = labelValue === "Divorced" || labelValue === "Widowed";
        next.maritalStatusShowsChildren = showsChildren;
        if (!showsChildren) {
          next.childStatus = "";
          next.numberOfChildren = "";
        }
      }

      return next;
    });
    // Clear error for this field
    setErrors((p) => ({ ...p, [key.replace("Id", "")]: "" }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.religionId) e.religion = "Please select religion";
    if (!form.casteId) e.caste = "Please select caste";
    if (!form.countryId) e.country = "Please select country";
    if (!form.stateId) e.state = "Please select state";
    if (!form.cityId) e.city = "Please select city";
    if (!form.maritalStatusId) e.maritalStatus = "Please select marital status";
    if (form.maritalStatusShowsChildren) {
      if (!form.childStatus) e.childStatus = "Please select if you have children";
      if (form.childStatus === "Yes" && !form.numberOfChildren) {
        e.numberOfChildren = "Please enter number of children";
      }
      if (form.childStatus === "Yes" && form.numberOfChildren && form.numberOfChildren < 1) {
        e.numberOfChildren = "Must be at least 1";
      }
    }
    if (!form.motherTongueId) e.motherTongue = "Please select mother tongue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    const payload = {
      userId,
      religionName: form.religionLabel,
      castName: form.casteLabel,
      ...(form.subcasteLabel && { subcastName: form.subcasteLabel }),
      countryName: form.countryLabel,
      stateName: form.stateLabel,
      cityName: form.cityLabel,
      maritalStatus: form.maritalStatusLabel,
      ...(form.maritalStatusShowsChildren && form.childStatus && {
        childStatus: form.childStatus,
      }),
      ...(form.maritalStatusShowsChildren && form.childStatus === "Yes" && {
        numberOfChildrens: Number(form.numberOfChildren),
      }),
      mothertongueName: form.motherTongueLabel,
    };

    saveBasicDetailsMutation.mutate(payload, {
      onSuccess: (data) => {
        setIsSaving(false);
        navigate("/admin/register/professional-details", {
          state: { registerData, basicDetails: form },
        });
      },
      onError: (error) => {
        setIsSaving(false);
        setErrors({ submit: error.message || "Failed to save basic details" });
      },
    });
  };

  // Loading state
  if (religionsQuery.isLoading || countriesQuery.isLoading) {
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
          <h3 style={{ color: "#601000" }}>Loading...</h3>
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
  if (religionsQuery.isError || countriesQuery.isError) {
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
          <h3 style={{ color: "#dc2626" }}>Error Loading Data</h3>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
            {religionsQuery.error?.message || countriesQuery.error?.message || "Failed to load data"}
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

  const Field = ({ label, name, value, data, placeholder, disabled, isLoading }) => {
    const fieldName = name.replace("Id", "");
    const hasError = !!errors[fieldName];
    
    // Handle focus to track active field
    const handleFocus = () => {
      activeFieldRef.current = name;
    };

    return (
      <div style={{ marginBottom: 20 }} id={`field-${name}`}>
        <label style={labelStyle}>{label}</label>
        <select
          value={value || ""}
          onFocus={handleFocus}
          onChange={(e) => {
            const selectedItem = data?.find((item) => item.id === e.target.value);
            update(name, e.target.value, selectedItem?.label || "");
          }}
          disabled={disabled || isLoading}
          style={{
            ...selectStyle(hasError),
            opacity: disabled || isLoading ? 0.6 : 1,
            cursor: disabled || isLoading ? "not-allowed" : "pointer",
          }}
        >
          <option value="">{isLoading ? "Loading..." : placeholder}</option>
          {data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        {hasError && (
          <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0 4px" }}>
            {errors[fieldName]}
          </p>
        )}
      </div>
    );
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "14px 20px",
    fontSize: "15px",
    borderRadius: "12px",
    outline: "none",
    background: "#f2f2f2",
    color: "#333",
    boxSizing: "border-box",
    border: `1px solid ${hasError ? "#dc2626" : "#d98a9a"}`,
    fontFamily: "Rubik, sans-serif",
  });

  // Handle number input change
  const handleNumberChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, numberOfChildren: value }));
    setErrors((p) => ({ ...p, numberOfChildren: "" }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-0 sm:px-4 font-[Rubik,sans-serif]">
      <div 
        className="w-full sm:max-w-md min-h-screen sm:min-h-[85vh] sm:h-auto sm:rounded-2xl sm:shadow-2xl sm:my-8 flex flex-col relative overflow-hidden bg-white"
        ref={formRef}
      >
        {/* Header */}
        <div style={{ padding: "28px 24px 16px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#601000", margin: 0, fontFamily: "Rubik, sans-serif" }}>
            Basic Details
          </h1>
          {userId && (
            <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
              User ID: {userId}
            </p>
          )}
        </div>
        <div style={{ borderBottom: "1px solid #eee" }} />

        {/* Form */}
        <div 
          style={{ 
            flex: 1, 
            padding: "20px 24px 32px", 
            overflowY: "auto",
          }}
        >
          <form onSubmit={handleSave}>
            <Field
              label="Religion"
              name="religionId"
              value={form.religionId}
              data={religionsQuery.data}
              placeholder="Religion"
              isLoading={religionsQuery.isLoading}
            />

            <Field
              label="Caste"
              name="casteId"
              value={form.casteId}
              data={castesQuery.data}
              placeholder="Caste"
              disabled={!form.religionId}
              isLoading={castesQuery.isLoading}
            />

            <Field
              label="Sub Caste"
              name="subcasteId"
              value={form.subcasteId}
              data={subcastesQuery.data}
              placeholder="Sub Caste (optional)"
              disabled={!form.casteId}
              isLoading={subcastesQuery.isLoading}
            />

            <Field
              label="Country"
              name="countryId"
              value={form.countryId}
              data={countriesQuery.data}
              placeholder="Country"
              isLoading={countriesQuery.isLoading}
            />

            <Field
              label="State"
              name="stateId"
              value={form.stateId}
              data={statesQuery.data}
              placeholder="State"
              disabled={!form.countryId}
              isLoading={statesQuery.isLoading}
            />

            <Field
              label="City"
              name="cityId"
              value={form.cityId}
              data={citiesQuery.data}
              placeholder="City"
              disabled={!form.stateId}
              isLoading={citiesQuery.isLoading}
            />

            <Field
              label="Marital Status"
              name="maritalStatusId"
              value={form.maritalStatusId}
              data={maritalStatusesQuery.data}
              placeholder="Marital Status"
              isLoading={maritalStatusesQuery.isLoading}
            />

            {/* Conditional Children Fields (for Divorced/Widowed) */}
            {form.maritalStatusShowsChildren && (
              <>
                <Field
                  label="Do you have children?"
                  name="childStatusId"
                  value={form.childStatus}
                  data={[
                    { id: "Yes", label: "Yes" },
                    { id: "No", label: "No" },
                  ]}
                  placeholder="Select an option"
                />

                {form.childStatus === "Yes" && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Number of Children</label>
                    <input
                      type="number"
                      min="1"
                      value={form.numberOfChildren || ""}
                      onChange={handleNumberChange}
                      placeholder="Enter number"
                      style={inputStyle(!!errors.numberOfChildren)}
                    />
                    {errors.numberOfChildren && (
                      <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0 4px" }}>
                        {errors.numberOfChildren}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            <Field
              label="Mother Tongue"
              name="motherTongueId"
              value={form.motherTongueId}
              data={motherTonguesQuery.data}
              placeholder="Mother tongue"
              isLoading={motherTonguesQuery.isLoading}
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