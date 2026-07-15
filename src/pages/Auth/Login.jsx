// src/pages/auth/Login.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../../hooks/useAuthMutations";

import MaskGroup from "../../assets/Mask group.png";
import Layer1 from "../../assets/Layer 1.png";

export default function Login() {
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/admin/requests");
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(form);
  };

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

        {/* Form Area */}
        <div style={{ flex: 1, padding: "0px 28px 32px" }}>
          <h1 style={{ textAlign: "center", fontSize: 20, fontWeight: 600, color: "#333", marginBottom: 4 }}>
            Welcome back
          </h1>
          
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address *"
                required
                disabled={loginMutation.isPending}
                style={{ ...inputStyle, opacity: loginMutation.isPending ? 0.6 : 1 }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password *"
                  required
                  disabled={loginMutation.isPending}
                  style={{ ...inputStyle, paddingRight: 46, opacity: loginMutation.isPending ? 0.6 : 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9B0424",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {loginMutation.isError && (
              <div
                className="animate-shake"
                style={{
                  background: "#FDECEC",
                  border: "1px solid #f3b8b8",
                  color: "#9B0424",
                  fontSize: 12,
                  borderRadius: 12,
                  padding: "10px 16px",
                  margin: "8px 0 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {loginMutation.error.message}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                width: "80%",
                margin: "8px auto 20px",
                padding: "14px",
                fontSize: "15px",
                fontWeight: 600,
                color: "#fff",
                background: loginMutation.isPending ? "#9b9b9b" : "#9B0424",
                border: "none",
                borderRadius: 50,
                cursor: loginMutation.isPending ? "not-allowed" : "pointer",
                boxShadow: loginMutation.isPending ? "none" : "0 4px 14px rgba(155,4,36,0.3)",
                fontFamily: "Rubik, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loginMutation.isPending && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Register option */}
          
        </div>

        {/* Home Indicator */}
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 12 }}>
          <div style={{ width: 120, height: 4, borderRadius: 2, background: "#bbb" }} />
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}