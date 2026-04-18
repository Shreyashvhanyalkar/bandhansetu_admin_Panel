// src/pages/auth/Login.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../../hooks/useAuthMutations";

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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #4a0000 0%, #8B0000 50%, #4a0000 100%)" }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10 animate-pulse"
        style={{ background: "#ff4444" }} />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full opacity-10 animate-pulse delay-1000"
        style={{ background: "#ff4444" }} />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105">
          {/* Top banner */}
          <div className="px-8 py-7 text-center" style={{ background: "linear-gradient(135deg, #4a0000, #8B0000)" }}>
            <div className="text-4xl mb-2 animate-bounce">💍</div>
            <h1 className="text-white text-2xl font-bold tracking-tight">BandhanSetu</h1>
            <p className="text-red-200 text-xs tracking-widest uppercase mt-1 font-medium">Admin Portal</p>
          </div>

          <div className="px-8 py-8">
            <h2 className="text-gray-800 text-xl font-semibold mb-1">Welcome back</h2>
            <p className="text-gray-400 text-sm mb-6">Sign in to manage matrimony requests</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@test.com"
                  required
                  disabled={loginMutation.isPending}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-gray-50 outline-none transition-all duration-150 focus:bg-white focus:border-red-500 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="it@123"
                    required
                    disabled={loginMutation.isPending}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-11 text-sm text-gray-800 bg-gray-50 outline-none transition-all duration-150 focus:bg-white focus:border-red-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
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
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2 animate-shake">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {loginMutation.error.message}
                </div>
              )}

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full text-white font-semibold py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: "#8B0000" }}
                onMouseEnter={e => { if (!loginMutation.isPending) e.target.style.background = "#a80000"; }}
                onMouseLeave={e => { if (!loginMutation.isPending) e.target.style.background = "#8B0000"; }}
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

            <p className="text-center text-sm text-gray-400 mt-5">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold hover:underline transition-colors" style={{ color: "#8B0000" }}>
                Register
              </Link>
            </p>

            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-center">
              <p className="text-xs font-semibold text-amber-700">Demo Credentials</p>
              <p className="text-xs text-amber-600 mt-0.5">admin@bandhansetu.com / Admin@1234</p>
            </div>
          </div>
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
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}