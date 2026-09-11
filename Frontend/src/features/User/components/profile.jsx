import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile, updateProfile } from "../services/userApi.js";
import Spinner from "../../../components/ui/Spinner.jsx";
import Error from "../../../components/ui/Erorr.jsx";
import { useInput } from "../../../hooks/useInput.js";
import { useToast } from "../../../context/ToastContext";
import { isEmail, isNotEmpty } from "../../../utils/validation";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { FiUser, FiMail, FiShield, FiKey, FiCheck } from "react-icons/fi";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [initialValues, setInitialValues] = useState({ username: "", email: "" });
  const toast = useToast();

  const {
    value: usernameValue,
    handleInputChange: handleUsernameChange,
    handleInputBlur: handleUsernameBlur,
    hasError: usernameHasError,
  } = useInput("", (value) => isNotEmpty(value));

  const {
    value: emailValue,
    handleInputChange: handleEmailChange,
    handleInputBlur: handleEmailBlur,
    hasError: emailHasError,
  } = useInput("", (value) => isEmail(value));

  const isUsernameValid = isNotEmpty(usernameValue);
  const isEmailValid = isEmail(emailValue);
  const hasChanges =
    usernameValue.trim() !== initialValues.username ||
    emailValue.trim() !== initialValues.email;
  const canSubmit = isUsernameValid && isEmailValid && hasChanges;
  const canReset = hasChanges;

  function syncFormValues(profileData) {
    const username = profileData?.username || "";
    const email = profileData?.email || "";
    handleUsernameChange({ target: { value: username } });
    handleEmailChange({ target: { value: email } });
    setInitialValues({ username, email });
  }

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const data = user || (await getProfile());
        syncFormValues(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (usernameHasError || emailHasError) return;
    setSaving(true);
    try {
      const profileData = {
        username: usernameValue.trim(),
        email: emailValue.trim(),
      };
      const updatedData = await updateProfile(profileData);
      setUser(updatedData);
      syncFormValues(updatedData);
      toast.success("Profile details saved! ✅");
    } catch (error) {
      toast.error(error.message || "Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) return <Error message={error.message} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
        
        {/* Header User Badge */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-2xl">
              {usernameValue?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {usernameValue || "Account Settings"}
            </h1>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Role: {user?.role?.toUpperCase() || "CUSTOMER"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Username</label>
            <div className="relative">
              <input
                type="text"
                value={usernameValue}
                onChange={handleUsernameChange}
                onBlur={handleUsernameBlur}
                className={`w-full bg-slate-900 border rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 outline-none transition ${
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
                className={`w-full bg-slate-900 border rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 outline-none transition ${
                  emailHasError ? "border-rose-500" : "border-slate-800 focus:border-emerald-500"
                }`}
              />
              <FiMail className="absolute left-4 top-3.5 text-slate-500 text-base" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={!canReset || saving}
              onClick={() => {
                handleUsernameChange({ target: { value: initialValues.username } });
                handleEmailChange({ target: { value: initialValues.email } });
              }}
              className="py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 text-xs font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Security Module */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FiShield className="text-emerald-400" /> Account Security
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Need to update your password or credential key?</p>
          </div>

          <Link
            to="/reset-password"
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 rounded-xl transition flex items-center gap-1.5"
          >
            <FiKey /> Reset Password
          </Link>
        </div>

      </div>
    </div>
  );
}