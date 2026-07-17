// src/pages/admin/register/register.jsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterUser } from "../../../hooks/registerHooks/useRegister";

import MaskGroup from "../../../assets/Mask group.png";
import Layer1 from "../../../assets/Layer 1.png";

// API only accepts "Male" or "Female" (see endpoint spec)
const RELATION_GENDERS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

// Country codes with their dial codes
const COUNTRY_CODES = [
  { code: "+91" },
  { code: "+1" },
  { code: "+44" },
  { code: "+61" },
  { code: "+49" },
  { code: "+33" },
  { code: "+971" },
  { code: "+65" },
  { code: "+81" },
];

// Convert <input type="date"> value (YYYY-MM-DD) to API format (DD-MM-YYYY)
const toApiDate = (isoDate) => {
  if (!isoDate) return "";
  const [yyyy, mm, dd] = isoDate.split("-");
  return `${dd}-${mm}-${yyyy}`;
};

// Calculate max date based on gender
const getMaxDate = (gender) => {
  const today = new Date();
  let minAge = 18; // Default
    
  if (gender === "Male") {
    minAge = 21;
  } else if (gender === "Female") {
    minAge = 18;
  }
  
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  return maxDate.toISOString().split('T')[0];
};

export default function RegisterUser() {
  const navigate = useNavigate();
  const registerMutation = useRegisterUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate max date based on selected gender
  const maxDate = useMemo(() => getMaxDate(gender), [gender]);

  const validate = () => {
    const e = {};
    if (!firstName.trim() || firstName.trim().length < 2) e.firstName = "First name must be at least 2 characters";
    if (!lastName.trim() || lastName.trim().length < 2) e.lastName = "Last name must be at least 2 characters";
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      e.email = "Enter a valid email address";
    }
    if (!mobile.trim() || !/^\d{10}$/.test(mobile.trim())) {
      e.mobile = "Enter a valid 10-digit mobile number";
    }
    if (!gender) e.gender = "Please select gender";
    if (!dob) e.dob = "Date of birth is required";
    if (!acceptTerms) e.acceptTerms = "You must accept terms & conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setErrors({});

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...(email.trim() && { email: email.trim().toLowerCase() }),
      mobileNumber: mobile.trim(),
      countryCode: countryCode,
      gender,
      birthDate: toApiDate(dob),
    };

    registerMutation.mutate(payload, {
      onSuccess: (data) => {
        const registerData = {
          ...payload,
          userId: data.userId,
          platformId: data.platformId,
        };
        navigate("/admin/register/basic-details", { state: { registerData } });
      },
      onError: (error) => {
        setErrors({ submit: error.message || "Registration failed" });
      },
    });
  };

  const isLoading = registerMutation.isPending;

  const inputStyle = {
    width: "100%",
    padding: "14px 20px",
    fontSize: "16px",
    borderRadius: "50px",
    outline: "none",
    background: "#fff",
    color: "#333",
    boxSizing: "border-box",
    border: "1px solid #9B0424",
    boxShadow: "0 2px 10px rgba(155, 4, 36, 0.08)",
    fontFamily: "Rubik, sans-serif",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 20px center",
    cursor: "pointer",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-0 sm:px-4 font-[Rubik,sans-serif]">
      <div
        className="w-full sm:max-w-md min-h-screen sm:min-h-[85vh] sm:h-auto sm:rounded-2xl sm:shadow-2xl sm:my-8 flex flex-col relative overflow-hidden"
        style={{ background: "radial-gradient(circle at bottom, #FAFAFA 0%, #E6E1DB 80%)" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginTop: 40, marginBottom: 0, padding: "0 80px" }}>
          <img src={MaskGroup} alt="Bandhan Setu Logo" style={{ width: "100%", objectFit: "contain" }} />
        </div>

        {/* Ribbon */}
        <div style={{ width: "100%", marginTop: "-40px", marginBottom: "16px", lineHeight: 0, overflow: "hidden" }}>
          <img src={Layer1} alt="Ribbon" style={{ width: "100%", height: "auto", objectFit: "cover", opacity: 0.85 }} />
        </div>

        {/* Tagline */}
        <p
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: 700,
            color: "#9B0424",
            margin: "0 0 20px",
            fontFamily: "Rubik, sans-serif",
          }}
        >
          Register User...
        </p>

        {/* Form Area */}
        <div style={{ flex: 1, padding: "0px 28px 32px" }}>
          <form onSubmit={handleRegister}>
            {/* First Name / Last Name */}
            <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setErrors((p) => ({ ...p, firstName: "" }));
                  }}
                  placeholder="First Name"
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setErrors((p) => ({ ...p, lastName: "" }));
                  }}
                  placeholder="Last Name"
                  style={inputStyle}
                />
              </div>
            </div>
            {(errors.firstName || errors.lastName) && (
              <p style={{ fontSize: 11, color: "#9B0424", margin: "-10px 0 12px 16px" }}>
                {errors.firstName || errors.lastName}
              </p>
            )}

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder="Email"
                style={inputStyle}
              />
              {errors.email && (
                <p style={{ fontSize: 11, color: "#9B0424", margin: "5px 0 0 16px" }}>{errors.email}</p>
              )}
            </div>

            {/* Mobile with Country Code Dropdown */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8, position: "relative" }}>
                {/* Country Code Dropdown */}
                <div style={{ position: "relative", width: "100px" }}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                      ...inputStyle,
                      width: "100%",
                      padding: "14px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      background: "#fff",
                      border: "1px solid #9B0424",
                      borderRadius: "50px",
                      minWidth: "80px",
                    }}
                  >
                    <span style={{ fontWeight: 400, fontSize: "16px" }}>{countryCode}</span>
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#333"
                      style={{ 
                        transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        marginLeft: "4px"
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 100,
                        padding: "4px 0",
                      }}
                    >
                      {COUNTRY_CODES.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(item.code);
                            setIsDropdownOpen(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            border: "none",
                            background: countryCode === item.code ? "#fce4e4" : "transparent",
                            cursor: "pointer",
                            textAlign: "left",
                            fontSize: "14px",
                            color: "#333",
                            fontFamily: "Rubik, sans-serif",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (countryCode !== item.code) {
                              e.currentTarget.style.background = "#f5f5f5";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (countryCode !== item.code) {
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                        >
                          <span style={{ fontWeight: 400 }}>{item.code}</span>
                          {countryCode === item.code && (
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="#9B0424" 
                              strokeWidth="2.5"
                            >
                              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Number Input */}
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, ""));
                    setErrors((p) => ({ ...p, mobile: "" }));
                  }}
                  placeholder="Mobile Number"
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
              {errors.mobile && (
                <p style={{ fontSize: 11, color: "#9B0424", margin: "5px 0 0 16px" }}>{errors.mobile}</p>
              )}
            </div>

            {/* Gender - Updated to look like placeholder */}
            <div style={{ marginBottom: 16 }}>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setDob(""); // Reset DOB when gender changes
                  setErrors((p) => ({ ...p, gender: "" }));
                }}
                style={{
                  ...selectStyle,
                  color: gender === "" ? "#999" : "#333",
                }}
              >
                <option value="" style={{ color: "#999", fontWeight: 400 }}>
                  Gender
                </option>
                {RELATION_GENDERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p style={{ fontSize: 11, color: "#9B0424", margin: "5px 0 0 16px" }}>{errors.gender}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9B0424",
                    pointerEvents: "none",
                    display: "flex",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    setErrors((p) => ({ ...p, dob: "" }));
                  }}
                  max={maxDate} // Dynamic max date based on gender
                  placeholder="DD-MM-YYYY"
                  style={{ ...inputStyle, paddingLeft: 46, color: dob ? "#333" : "#999" }}
                />
              </div>
              {errors.dob && (
                <p style={{ fontSize: 11, color: "#9B0424", margin: "5px 0 0 16px" }}>{errors.dob}</p>
              )}
              <p style={{ fontSize: 10, color: "#999", margin: "5px 0 0 16px" }}>
                {gender === "Male" 
                  ? "Minimum age: 21 years" 
                  : gender === "Female" 
                    ? "Minimum age: 18 years" 
                    : "Minimum age: 21 for male, 18 for female"}
              </p>
            </div>

            <p style={{ textAlign: "center", fontSize: 11, color: "#333", margin: "0 0 24px 0" }}>
              OTP will be sent on this number
            </p>

            {/* Terms */}
            <div style={{ marginBottom: 24, paddingLeft: "10px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={() => {
                    setAcceptTerms(!acceptTerms);
                    setErrors((p) => ({ ...p, acceptTerms: "" }));
                  }}
                  style={{ width: 16, height: 16, marginTop: 2, accentColor: "#9B0424", cursor: "pointer" }}
                />
                <span style={{ fontSize: "12px", color: "#333", lineHeight: 1.4 }}>
                  I accept the{" "}
                  <a href="#" style={{ color: "#9B0424", textDecoration: "underline", fontWeight: 600 }}>
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" style={{ color: "#9B0424", textDecoration: "underline", fontWeight: 600 }}>
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.acceptTerms && (
                <p style={{ fontSize: 11, color: "#9B0424", margin: "5px 0 0 26px" }}>{errors.acceptTerms}</p>
              )}
              {errors.submit && (
                <p style={{ fontSize: 11, color: "#9B0424", margin: "5px 0 0 26px" }}>{errors.submit}</p>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "80%",
                margin: "0 auto 20px",
                padding: "14px",
                fontSize: "15px",
                fontWeight: 600,
                color: "#fff",
                background: isLoading ? "#9b9b9b" : "#9B0424",
                border: "none",
                borderRadius: 50,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: isLoading ? "none" : "0 4px 14px rgba(155,4,36,0.3)",
                fontFamily: "Rubik, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isLoading ? "Registering..." : (
                <>
                  Register for free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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