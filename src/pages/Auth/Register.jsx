// pages/auth/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "../../hooks/useAuthMutations";

export default function Register() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleChange = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { 
      setErrors(errs); 
      return; 
    }
    
    registerMutation.mutate(
      { name: form.name, email: form.email, password: form.password },
      {
        onSuccess: () => {
          // Redirect to login after 2 seconds
          setTimeout(() => navigate("/login"), 2000);
        },
      }
    );
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-gray-50 outline-none transition-all duration-150 focus:bg-white focus:border-red-500";

  const focusBorder = (e) => { e.target.style.borderColor = "#8B0000"; };
  const blurBorder  = (e) => { e.target.style.borderColor = "#e5e7eb"; };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #4a0000 0%, #8B0000 50%, #4a0000 100%)" }}
    >
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10 animate-pulse" style={{ background: "#ff4444" }} />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full opacity-10 animate-pulse delay-1000" style={{ background: "#ff4444" }} />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105">
          <div className="px-8 py-7 text-center" style={{ background: "linear-gradient(135deg, #4a0000, #8B0000)" }}>
            <div className="text-4xl mb-2 animate-bounce">💍</div>
            <h1 className="text-white text-2xl font-bold tracking-tight">BandhanSetu</h1>
            <p className="text-red-200 text-xs tracking-widest uppercase mt-1 font-medium">Admin Portal</p>
          </div>

          <div className="px-8 py-8">
            <h2 className="text-gray-800 text-xl font-semibold mb-1">Create Account</h2>
            <p className="text-gray-400 text-sm mb-6">Register as an admin user</p>

            {registerMutation.isSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-5 text-center animate-fade-in">
                <div className="text-2xl mb-2">✅</div>
                <p className="font-semibold">Registration Successful!</p>
                <p className="text-xs text-green-500 mt-1">Redirecting to login…</p>
                <div className="mt-3 w-full bg-green-200 rounded-full h-1 overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full animate-progress" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: "Full Name", name: "name", type: "text", placeholder: "Your full name" },
                  { label: "Email Address", name: "email", type: "email", placeholder: "you@example.com" },
                  { label: "Password", name: "password", type: "password", placeholder: "Min 6 characters" },
                  { label: "Confirm Password", name: "confirm", type: "password", placeholder: "Repeat password" },
                ].map(({ label, name, type, placeholder }) => (
                  <div key={name} className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {label}
                    </label>
                    <input
                      type={type}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className={inputClass}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                      disabled={registerMutation.isPending}
                    />
                    {errors[name] && (
                      <p className="text-xs text-red-500 flex items-center gap-1 animate-slide-in">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors[name]}
                      </p>
                    )}
                  </div>
                ))}

                {registerMutation.isError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2 animate-shake">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {registerMutation.error.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full text-white font-semibold py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: "#8B0000" }}
                  onMouseEnter={e => { if (!registerMutation.isPending) e.target.style.background = "#a80000"; }}
                  onMouseLeave={e => { if (!registerMutation.isPending) e.target.style.background = "#8B0000"; }}
                >
                  {registerMutation.isPending && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-gray-400 mt-5">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold hover:underline transition-colors" style={{ color: "#8B0000" }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-progress { animation: progress 2s linear forwards; }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </div>
  );
}