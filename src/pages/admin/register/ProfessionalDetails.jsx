// src/pages/admin/register/ProfessionalDetails.jsx
import { useState, useMemo, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const EDUCATION_LEVELS = ["High School", "Diploma", "Bachelor's", "Master's", "Doctorate", "Other"];
const EDUCATION_FIELDS = ["Engineering", "Medicine", "Commerce", "Arts", "Science", "Law", "Management", "Other"];
const ANNUAL_INCOMES = ["Below ₹3 Lakh", "₹3 - 5 Lakh", "₹5 - 10 Lakh", "₹10 - 15 Lakh", "₹15 - 25 Lakh", "₹25 - 50 Lakh", "₹50 Lakh+"];
const WORKING_WITH = ["Government", "Private", "Business / Self Employed", "Defence", "Not Working"];

const WORKING_CATEGORY_BY_WORKING_WITH = {
  Government: ["Administrative", "Defence", "PSU", "Judiciary", "Other"],
  Private: ["IT / Software", "Banking / Finance", "Healthcare", "Education", "Other"],
  "Business / Self Employed": ["Trading", "Manufacturing", "Services", "Other"],
  Defence: ["Army", "Navy", "Air Force", "Other"],
  "Not Working": ["Other"],
};

const SUB_CATEGORY_BY_WORKING_CATEGORY = {
  "IT / Software": ["Software Developer", "IT Manager", "Data Analyst", "Other"],
  "Banking / Finance": ["Bank Officer", "Accountant", "Financial Analyst", "Other"],
  Healthcare: ["Doctor", "Nurse", "Pharmacist", "Other"],
  Education: ["Teacher", "Professor", "Administrator", "Other"],
  Administrative: ["Clerk", "Officer", "Manager", "Other"],
  PSU: ["Engineer", "Officer", "Manager", "Other"],
  default: ["Other"],
};

// Memoized Input Component
const TextInput = memo(({ label, name, value, placeholder, error, onChange }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ fontSize: "14px", fontWeight: 700, color: "#7a1220", marginBottom: 8, display: "block" }}>
      {label}
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
        color: "#333",
        boxSizing: "border-box",
        border: `1px solid ${error ? "#dc2626" : "#d98a9a"}`,
        fontFamily: "Rubik, sans-serif",
      }}
    />
    {error && <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0 4px" }}>{error}</p>}
  </div>
));

TextInput.displayName = "TextInput";

// Memoized Select Component
const SelectInput = memo(({ label, name, value, options, placeholder, disabled, error, onChange }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ fontSize: "14px", fontWeight: 700, color: "#7a1220", marginBottom: 8, display: "block" }}>
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "14px 20px",
        fontSize: "15px",
        borderRadius: "12px",
        outline: "none",
        background: "#f2f2f2",
        color: "#333",
        boxSizing: "border-box",
        border: `1px solid ${error ? "#dc2626" : "#d98a9a"}`,
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 18px center",
        cursor: "pointer",
        fontFamily: "Rubik, sans-serif",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0 4px" }}>{error}</p>}
  </div>
));

SelectInput.displayName = "SelectInput";

export default function ProfessionalDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const registerData = location.state?.registerData || null;
  const basicDetails = location.state?.basicDetails || null;

  const [form, setForm] = useState({
    collegeName: "",
    educationLevel: "",
    educationField: "",
    employerName: "",
    annualIncome: "",
    workingWith: "",
    workingCategory: "",
    subCategory: "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Memoized cascading options
  const workingCategoryOptions = useMemo(
    () => (form.workingWith ? WORKING_CATEGORY_BY_WORKING_WITH[form.workingWith] || [] : []),
    [form.workingWith]
  );

  const subCategoryOptions = useMemo(
    () =>
      form.workingCategory
        ? SUB_CATEGORY_BY_WORKING_CATEGORY[form.workingCategory] || SUB_CATEGORY_BY_WORKING_CATEGORY.default
        : [],
    [form.workingCategory]
  );

  // Single update function, memoized
  const handleChange = useCallback((field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Reset cascading fields
      if (field === "workingWith") {
        updated.workingCategory = "";
        updated.subCategory = "";
      } else if (field === "workingCategory") {
        updated.subCategory = "";
      }
      
      return updated;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.collegeName.trim()) e.collegeName = "College name is required";
    if (!form.educationLevel) e.educationLevel = "Please select education level";
    if (!form.educationField) e.educationField = "Please select education field";
    if (!form.employerName.trim()) e.employerName = "Employer name is required";
    if (!form.annualIncome) e.annualIncome = "Please select annual income";
    if (!form.workingWith) e.workingWith = "Please select working with";
    if (!form.workingCategory) e.workingCategory = "Please select working category";
    if (!form.subCategory) e.subCategory = "Please select sub category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      navigate("/admin/register/personal-details", {
        state: { registerData, basicDetails, professionalDetails: form },
      });
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-0 sm:px-4 font-[Rubik,sans-serif]">
      <div className="w-full sm:max-w-md min-h-screen sm:min-h-[85vh] sm:h-auto sm:rounded-2xl sm:shadow-2xl sm:my-8 flex flex-col relative overflow-hidden bg-white">
        {/* Header */}
        <div style={{ padding: "28px 24px 16px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#601000", margin: 0, fontFamily: "Rubik, sans-serif" }}>
            Professional Details
          </h1>
        </div>
        <div style={{ borderBottom: "1px solid #eee" }} />

        {/* Form */}
        <div style={{ flex: 1, padding: "20px 24px 32px", overflowY: "auto" }}>
          <form onSubmit={handleSave}>
            <TextInput
              label="College Name"
              name="collegeName"
              value={form.collegeName}
              placeholder="College name"
              error={errors.collegeName}
              onChange={(val) => handleChange("collegeName", val)}
            />

            <SelectInput
              label="Education Level"
              name="educationLevel"
              value={form.educationLevel}
              options={EDUCATION_LEVELS}
              placeholder="Education level"
              error={errors.educationLevel}
              onChange={(val) => handleChange("educationLevel", val)}
            />

            <SelectInput
              label="Education Field"
              name="educationField"
              value={form.educationField}
              options={EDUCATION_FIELDS}
              placeholder="Education field"
              error={errors.educationField}
              onChange={(val) => handleChange("educationField", val)}
            />

            <TextInput
              label="Employer Name"
              name="employerName"
              value={form.employerName}
              placeholder="Employer name"
              error={errors.employerName}
              onChange={(val) => handleChange("employerName", val)}
            />

            <SelectInput
              label="Annual Income (INR)"
              name="annualIncome"
              value={form.annualIncome}
              options={ANNUAL_INCOMES}
              placeholder="Annual income"
              error={errors.annualIncome}
              onChange={(val) => handleChange("annualIncome", val)}
            />

            <SelectInput
              label="Working With"
              name="workingWith"
              value={form.workingWith}
              options={WORKING_WITH}
              placeholder="Working with"
              error={errors.workingWith}
              onChange={(val) => handleChange("workingWith", val)}
            />

            <SelectInput
              label="Working Category"
              name="workingCategory"
              value={form.workingCategory}
              options={workingCategoryOptions}
              placeholder="Working category"
              disabled={!form.workingWith}
              error={errors.workingCategory}
              onChange={(val) => handleChange("workingCategory", val)}
            />

            <SelectInput
              label="Sub Category"
              name="subCategory"
              value={form.subCategory}
              options={subCategoryOptions}
              placeholder="Sub category"
              disabled={!form.workingCategory}
              error={errors.subCategory}
              onChange={(val) => handleChange("subCategory", val)}
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