import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { resetMyPassword } from "../services/userApi";
import { hasMinLength } from "../../../utils/validation";
import { FiLock, FiKey, FiShield } from "react-icons/fi";

export default function ResetPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validCurrent = hasMinLength(currentPassword, 6);
  const validNew = hasMinLength(newPassword, 6);
  const validConfirm = confirmPassword === newPassword && hasMinLength(confirmPassword, 6);
  const canSubmit = validCurrent && validNew && validConfirm;
  const canReset = currentPassword || newPassword || confirmPassword;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);

    try {
      await resetMyPassword({ currentPassword, newPassword });
      toast.success("Password changed successfully. Please sign in again.");
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mx-auto">
            <FiKey />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-xs text-slate-400">Update your security credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Current Password</label>
            <div className="relative">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition"
              />
              <FiLock className="absolute left-4 top-3.5 text-slate-500 text-base" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">New Password</label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition"
              />
              <FiLock className="absolute left-4 top-3.5 text-slate-500 text-base" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Confirm New Password</label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retype new password"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition"
              />
              <FiLock className="absolute left-4 top-3.5 text-slate-500 text-base" />
            </div>
            {!validConfirm && confirmPassword && (
              <p className="text-[10px] text-rose-400 font-medium mt-1">Passwords do not match.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={!canReset || loading}
              onClick={handleReset}
              className="py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 text-xs font-bold rounded-xl transition"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 text-xs font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

