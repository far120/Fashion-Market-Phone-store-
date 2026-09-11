import { Link } from "react-router-dom";
import { FiPackage, FiUsers, FiShoppingBag, FiActivity, FiTag, FiAward, FiShield, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../auth/hooks/useAuth";

export default function AdminDashboard() {
  const { isAdmin, isManager, user } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* HEADER */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FiShield /> Admin Hub Panel
                </span>
                <span className="text-xs font-extrabold text-slate-400 uppercase bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                  Signed as {isAdmin ? "ADMIN" : "MANAGER"}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white mt-3">
                Store Management Hub
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Manage product inventory, brand catalogs, category hierarchies, user permissions, and order statuses.
              </p>
            </div>
          </div>
        </div>

        {/* QUICK NAVIGATION MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isAdmin && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-2xl">
                  <FiPackage />
                </div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  Commerce Hub
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Product & Order Operations</h3>
                <p className="text-xs text-slate-400 mt-1">Manage catalog listings, price rules, stock quantities, and order statuses.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/admin/products"
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-white rounded-xl transition flex items-center justify-between"
                >
                  <span>Products</span> <FiArrowRight />
                </Link>
                <Link
                  to="/admin/orders"
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-white rounded-xl transition flex items-center justify-between"
                >
                  <span>Orders</span> <FiArrowRight />
                </Link>
                <Link
                  to="/admin/categories"
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-white rounded-xl transition flex items-center justify-between"
                >
                  <span>Categories</span> <FiArrowRight />
                </Link>
                <Link
                  to="/admin/brands"
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-white rounded-xl transition flex items-center justify-between"
                >
                  <span>Brands</span> <FiArrowRight />
                </Link>
              </div>
            </div>
          )}

          {isManager && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-2xl">
                  <FiUsers />
                </div>
                <span className="text-[10px] font-extrabold uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">
                  User & Security Hub
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">People & System Audit</h3>
                <p className="text-xs text-slate-400 mt-1">Review user roles, manage registered accounts, and inspect system access logs.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/admin/users"
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-bold text-white rounded-xl transition flex items-center justify-between"
                >
                  <span>Users</span> <FiArrowRight />
                </Link>
                <Link
                  to="/admin/logs"
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-bold text-white rounded-xl transition flex items-center justify-between"
                >
                  <span>System Logs</span> <FiArrowRight />
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

