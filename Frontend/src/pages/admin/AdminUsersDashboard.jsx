import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiActivity, FiClock, FiShield, FiUserCheck, FiUsers, FiArrowRight } from "react-icons/fi";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { getUserLogs, getUsers } from "../../features/User/services/userApi";


export default function AdminUsersDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [logsData, setLogsData] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [usersResponse, logsResponse] = await Promise.all([
          getUsers({ page: 1, limit: 20, order: "desc" }),
          getUserLogs({ page: 1, limit: 8, order: "desc" }),
        ]);

        if (mounted) {
          setUsersData(usersResponse);
          setLogsData(logsResponse);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const users = usersData?.result || [];
  const logs = logsData?.result || [];

  const managersCount = useMemo(() => {
    return users.filter((item) => item.role === "manager").length;
  }, [users]);
  const adminsCount = useMemo(() => {
    return users.filter((item) => item.role === "admin").length;
  }, [users]);
  const usersCount = useMemo(() => {
    return users.filter((item) => item.role === "user").length;
  }, [users]);

  const activeCount = useMemo(() => {
    return users.filter((item) => item.isActive).length;
  }, [users]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto min-h-[60vh] max-w-6xl px-4 py-12 bg-slate-950">
        <Error message={error.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* HEADER */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FiUsers /> Accounts & Security Intelligence
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-3">
              People, Roles & Audit Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Inspect user roles, manage active status, review administrative privileges, and monitor system access audit logs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/admin/users"
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <FiUsers /> Manage Users
            </Link>
            <Link
              to="/admin/logs"
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <FiActivity /> System Audit Logs
            </Link>
            <Link
              to="/admin/dashboard"
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition"
            >
              Back to Hub
            </Link>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-lg">
              <FiUsers />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Users</p>
            <p className="text-3xl font-extrabold text-white">{usersData?.totalResults || users.length || 0}</p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-lg">
              <FiUserCheck />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Accounts</p>
            <p className="text-3xl font-extrabold text-white">{activeCount}</p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-lg">
              <FiShield />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Admins & Managers</p>
            <p className="text-3xl font-extrabold text-white">
              {adminsCount} <span className="text-xs text-slate-500 font-normal">admins</span> / {managersCount} <span className="text-xs text-slate-500 font-normal">managers</span>
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-lg">
              <FiActivity />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total System Logs</p>
            <p className="text-3xl font-extrabold text-white">{logsData?.totalResults || logs.length || 0}</p>
          </div>
        </div>

        {/* SPLIT GRID: RECENT USERS & LOGS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* RECENT USERS */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-xl">
                  <FiUserCheck />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Registered Account Directory</h2>
                  <p className="text-xs text-slate-400">Recent accounts and access roles</p>
                </div>
              </div>
              <Link to="/admin/users" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                View All <FiArrowRight />
              </Link>
            </div>

            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user._id} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white text-sm">{user.username || user.email || "User"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{user.email || "No email"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 uppercase">
                      {user.role || "user"}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No users found.</p>
              )}
            </div>
          </div>

          {/* LATEST AUDIT LOGS */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xl">
                  <FiClock />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Latest System Activity Logs</h2>
                  <p className="text-xs text-slate-400">Real-time HTTP requests and API actions</p>
                </div>
              </div>
              <Link to="/admin/logs" className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View All <FiArrowRight />
              </Link>
            </div>

            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={log._id} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white text-sm">{log.username || log.email || "System User"}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{log.action || log.url || "-"}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-cyan-400">
                    {log.method || "GET"}
                  </span>
                </div>
              ))}

              {logs.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No activity logs recorded.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

