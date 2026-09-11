import { useEffect, useState } from "react";
import { FiUsers, FiSearch, FiShield, FiUserCheck, FiTrash2, FiRefreshCw, FiChevronLeft, FiChevronRight, FiFilter } from "react-icons/fi";
import Error from "../../../components/ui/Erorr";
import Spinner from "../../../components/ui/Spinner";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  activateUser,
  changeUserRole,
  deleteUser,
  getUsers,
} from "../services/userApi";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [actionLoadingUserId, setActionLoadingUserId] = useState("");
  const [dataInput, setDataInput] = useState({
    email: "",
    username: "",
    role: "",
    isActive: "",
  });

  const [usernameValue, setUsernameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [roleValue, setRoleValue] = useState("");
  const [statusValue, setStatusValue] = useState("");

  async function fetchUsers() { 
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers({
        page,
        limit: 10,
        order: "desc",
        email: dataInput.email || undefined,
        username: dataInput.username || undefined,
        role: dataInput.role || roleValue || undefined,
        isActive: dataInput.isActive || statusValue || undefined,
      });
      setUsers(data?.result || []);
      setPage(data?.page || 1);
      setTotalPages(data?.totalPages || 1);
      setTotalResults(data?.totalResults || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchUsers();
  }, [page, dataInput, statusValue, roleValue]);

  async function handleRoleChange(targetUser) {
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    setActionLoadingUserId(targetUser._id);

    try {
      await changeUserRole(targetUser._id, nextRole);
      setUsers((prev) =>
        prev.map((item) =>
          item._id === targetUser._id ? { ...item, role: nextRole } : item
        )
      );
      toast.success(`Role updated to ${nextRole}`);
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setActionLoadingUserId("");
    }
  }

  async function handleActivationToggle(targetUser) {
    setActionLoadingUserId(targetUser._id);
    try {
      await activateUser(targetUser._id);
      setUsers((prev) =>
        prev.map((item) =>
          item._id === targetUser._id ? { ...item, isActive: !item.isActive } : item
        )
      );
      toast.success(
        targetUser.isActive ? "User deactivated" : "User activated"
      );
    } catch (err) {
      toast.error(err.message || "Failed to activate/deactivate user");
    } finally {
      setActionLoadingUserId("");
    }
  }

  async function handleDelete(targetUser) {
    const confirmed = window.confirm(
      `Delete user ${targetUser.username || targetUser.email}?`
    );

    if (!confirmed) {
      return;
    }
    setActionLoadingUserId(targetUser._id);
    try {
      await deleteUser(targetUser._id);
      setUsers((prev) => prev.filter((item) => item._id !== targetUser._id));
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setActionLoadingUserId("");
    }
  }

  async function handleApplyFilter(e) {
    e.preventDefault();
    setDataInput({
      email: emailValue.trim(),
      username: usernameValue.trim(),
      role: roleValue,
      isActive: statusValue,
    });
    setPage(1);
  }

  async function handleClearFilter() {
    setUsernameValue("");
    setEmailValue("");
    setRoleValue("");
    setStatusValue("");
    setDataInput({ email: "", username: "", role: "", isActive: "" });
    setPage(1);
  }

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
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FiUsers /> Account Access Control
              </span>
              <span className="text-xs font-extrabold text-slate-400 uppercase bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                {totalResults} Total Users
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-3">
              User Directory & Role Permissions
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Search accounts, toggle user active status, update administrative roles (Admin/User), and delete registered profiles.
            </p>
          </div>
        </div>

        {/* SEARCH & FILTERS PANEL */}
        <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <FiFilter className="text-cyan-400 text-lg" />
            <h2 className="text-base font-bold text-white">Filter Accounts</h2>
          </div>

          <form onSubmit={handleApplyFilter} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={usernameValue}
                  onChange={(event) => setUsernameValue(event.target.value)}
                  placeholder="Search username..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={emailValue}
                  onChange={(event) => setEmailValue(event.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Role
                </label>
                <select
                  value={roleValue}
                  onChange={(event) => setRoleValue(event.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-200 outline-none focus:border-cyan-500 transition"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Account Status
                </label>
                <select
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-200 outline-none focus:border-cyan-500 transition"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
              >
                <FiSearch /> Apply Filters
              </button>
              <button
                type="button"
                onClick={handleClearFilter}
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-semibold text-xs rounded-xl transition"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* USERS TABLE */}
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/90 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((item) => {
                  const isCurrentUser = item._id === currentUser?._id;
                  const actionBusy = actionLoadingUserId === item._id;

                  return (
                    <tr key={item._id} className="hover:bg-slate-900/40 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{item.username || "User"}</p>
                        <p className="text-[10px] text-slate-500 font-mono">ID: #{item._id.slice(-6)}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{item.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          item.role === "admin"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}>
                          <FiShield className="text-xs" /> {item.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRoleChange(item)}
                            disabled={actionBusy || isCurrentUser}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            {item.role === "admin" ? "Make User" : "Make Admin"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleActivationToggle(item)}
                            disabled={actionBusy || isCurrentUser}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-bold text-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            {item.isActive ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={actionBusy || isCurrentUser}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            title="Delete User"
                          >
                            <FiTrash2 className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <FiUsers className="mx-auto text-3xl mb-2 text-slate-600" />
                      <p className="text-sm font-semibold">No user accounts found matching query.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between gap-4 glass-card rounded-2xl border border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
          >
            <FiChevronLeft /> Previous
          </button>

          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Page <span className="text-white font-extrabold">{page}</span> of <span className="text-white font-extrabold">{totalPages}</span>
          </p>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
          >
            Next <FiChevronRight />
          </button>
        </div>

      </div>
    </div>
  );
}