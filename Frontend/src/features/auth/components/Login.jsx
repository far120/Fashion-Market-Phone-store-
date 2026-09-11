
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiMail, FiLock, FiSmartphone } from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasMinLength, isNotEmpty } from "../../../utils/validation.js";
import { useInput } from "../../../hooks/useInput.js";
import { useToast } from "../../../context/ToastContext.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  
  const {
    value: emailValue,
    handleInputChange: handleemailChange,
    handleInputBlur: handleemailBlur,
    hasError: emailHasError,
    handleReset: handleemailReset,
  } = useInput("", (value) => isNotEmpty(value));

  const {
    value: passwordValue,
    handleInputChange: handlePasswordChange,
    handleInputBlur: handlePasswordBlur,
    hasError: passwordHasError,
    handleReset: handlePasswordReset,
  } = useInput("", (value) => hasMinLength(value, 6));

  const isemailValid = isNotEmpty(emailValue);
  const isPasswordValid = hasMinLength(passwordValue, 6);
  const canSubmit = isemailValid && isPasswordValid;
  const canReset = emailValue.trim() !== "" || passwordValue !== "";

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await login(emailValue, passwordValue);
      toast.success("Welcome back! Login successful ✅");
      navigate("/profile", { replace: true });
    } catch (error) {
      toast.error(error.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
            <FiSmartphone />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your Fashion & Tech Market account</p>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="py-2.5 text-center text-xs font-bold text-slate-950 bg-emerald-500 rounded-xl shadow-md">
            Sign In
          </span>
          <Link
            to="/register"
            className="py-2.5 text-center text-xs font-bold text-slate-400 hover:text-white transition"
          >
            Register
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                onBlur={handleemailBlur}
                onChange={handleemailChange}
                value={emailValue}
                placeholder="name@example.com"
                className={`w-full bg-slate-900 border rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 outline-none transition ${
                  emailHasError ? "border-rose-500" : "border-slate-800 focus:border-emerald-500"
                }`}
              />
              <FiMail className="absolute left-4 top-3.5 text-slate-500 text-base" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Password</label>
              <Link to="/reset-password" className="text-xs text-emerald-400 hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                value={passwordValue}
                placeholder="••••••••"
                className={`w-full bg-slate-900 border rounded-xl px-4 py-3 pl-11 pr-11 text-sm text-white placeholder:text-slate-500 outline-none transition ${
                  passwordHasError ? "border-rose-500" : "border-slate-800 focus:border-emerald-500"
                }`}
              />
              <FiLock className="absolute left-4 top-3.5 text-slate-500 text-base" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={!canReset || loading}
              onClick={() => {
                handleemailReset();
                handlePasswordReset();
              }}
              className="py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 text-xs font-bold rounded-xl transition"
            >
              Reset Fields
            </button>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 text-xs font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}