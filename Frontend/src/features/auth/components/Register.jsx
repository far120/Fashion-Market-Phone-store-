import { Link } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { hasMinLength, isEmail, isEqualsToOtherValue, isNotEmpty } from "../../../utils/validation";
import { useInput } from "../../../hooks/useInput.js";
import { useCheckbox } from "../../../hooks/useCheckBox.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { FiUser, FiMail, FiLock, FiSmartphone } from "react-icons/fi";

export default function Register() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const {
    value: usernameValue,
    handleInputChange: handleUsernameChange,
    handleInputBlur: handleUsernameBlur,
    hasError: usernameHasError,
    handleReset: handleUsernameReset,
  } = useInput("", (value) => isNotEmpty(value));

  const {
    value: emailValue,
    handleInputChange: handleEmailChange,
    handleInputBlur: handleEmailBlur,
    hasError: emailHasError,
    handleReset: handleEmailReset,
  } = useInput("", (value) => isEmail(value));

  const {
    value: passwordValue,
    handleInputChange: handlePasswordChange,
    handleInputBlur: handlePasswordBlur,
    hasError: passwordHasError,
    handleReset: handlePasswordReset,
  } = useInput("", (value) => hasMinLength(value, 6));

  const {
    value: confirmPasswordValue,
    handleInputChange: handleConfirmPasswordChange,
    handleInputBlur: handleConfirmPasswordBlur,
    hasError: confirmPasswordHasError,
    handleReset: handleConfirmPasswordReset,
  } = useInput("", (value) => hasMinLength(value, 6) && isEqualsToOtherValue(value, passwordValue));

  const {
    value: termsAccepted,
    handleChange: handleTermsChange,
    hasError: termsHasError,
    reset: handleTermsReset,
  } = useCheckbox(false, (value) => value === true);

  const isUsernameValid = isNotEmpty(usernameValue);
  const isEmailValid = isEmail(emailValue);
  const isPasswordValid = hasMinLength(passwordValue, 6);
  const isConfirmPasswordValid = hasMinLength(confirmPasswordValue, 6) && isEqualsToOtherValue(confirmPasswordValue, passwordValue);
  const canSubmit = isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && termsAccepted;
  const canReset = usernameValue.trim() !== "" || emailValue.trim() !== "" || passwordValue !== "" || confirmPasswordValue !== "" || termsAccepted;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const userData = {
        email: emailValue,
        password: passwordValue,
        username: usernameValue,
      };

      await register(userData);
      toast.success("Account created successfully! 🎉");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Registration failed ❌");
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
          <h2 className="text-2xl font-extrabold text-white">Create Account</h2>
          <p className="text-xs text-slate-400">Join Fashion & Tech Market for exclusive member deals</p>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <Link
            to="/login"
            className="py-2.5 text-center text-xs font-bold text-slate-400 hover:text-white transition"
          >
            Sign In
          </Link>
          <span className="py-2.5 text-center text-xs font-bold text-slate-950 bg-emerald-500 rounded-xl shadow-md">
            Register
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Username</label>
            <div className="relative">
              <input
                type="text"
                value={usernameValue}
                onChange={handleUsernameChange}
                onBlur={handleUsernameBlur}
                placeholder="Choose username"
                className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 pl-11 text-sm text-white placeholder:text-slate-500 outline-none transition ${
                  usernameHasError ? "border-rose-500" : "border-slate-800 focus:border-emerald-500"
                }`}
              />
              <FiUser className="absolute left-4 top-3.5 text-slate-500 text-base" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={emailValue}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="name@example.com"
                className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 pl-11 text-sm text-white placeholder:text-slate-500 outline-none transition ${
                  emailHasError ? "border-rose-500" : "border-slate-800 focus:border-emerald-500"
                }`}
              />
              <FiMail className="absolute left-4 top-3.5 text-slate-500 text-base" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Password</label>
            <div className="relative">
              <input
                type="password"
                value={passwordValue}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                placeholder="Min 6 characters"
                className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 pl-11 text-sm text-white placeholder:text-slate-500 outline-none transition ${
                  passwordHasError ? "border-rose-500" : "border-slate-800 focus:border-emerald-500"
                }`}
              />
              <FiLock className="absolute left-4 top-3.5 text-slate-500 text-base" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                value={confirmPasswordValue}
                onChange={handleConfirmPasswordChange}
                onBlur={handleConfirmPasswordBlur}
                placeholder="Retype password"
                className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 pl-11 text-sm text-white placeholder:text-slate-500 outline-none transition ${
                  confirmPasswordHasError ? "border-rose-500" : "border-slate-800 focus:border-emerald-500"
                }`}
              />
              <FiLock className="absolute left-4 top-3.5 text-slate-500 text-base" />
            </div>
            {confirmPasswordHasError && (
              <p className="text-[10px] text-rose-400 font-medium">Passwords do not match.</p>
            )}
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={handleTermsChange}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <span>I agree to the terms and privacy conditions</span>
            </label>
            {termsHasError && (
              <p className="text-[10px] text-rose-400 font-medium mt-1">You must accept the terms.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={!canReset || loading}
              onClick={() => {
                handleUsernameReset();
                handleEmailReset();
                handlePasswordReset();
                handleConfirmPasswordReset();
                handleTermsReset();
              }}
              className="py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 text-xs font-bold rounded-xl transition"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 text-xs font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}