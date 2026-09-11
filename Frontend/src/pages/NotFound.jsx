import { FiAlertTriangle, FiHome, FiGrid } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 border border-slate-800 text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-4xl mx-auto">
          <FiAlertTriangle />
        </div>
        <div>
          <h1 className="text-7xl font-black text-white tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-200 mt-2">Page Not Found</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            The page or catalog item you are trying to reach does not exist or has been relocated.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <FiHome /> Go to Home
          </Link>
          <Link
            to="/menu"
            className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-2"
          >
            <FiGrid /> Store Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}