import { useEffect, useState } from "react";
import { FiActivity, FiSearch, FiClock, FiChevronLeft, FiChevronRight, FiCheckCircle } from "react-icons/fi";
import Error from "../../../components/ui/Erorr";
import Spinner from "../../../components/ui/Spinner";
import { getUserLogs } from "../services/userApi";

export default function AdminUserLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [emailInput, setEmailInput] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserLogs({
          page,
          limit: 10,
          order: "desc",
          email: emailFilter || undefined,
        });

        setLogs(data?.result || []);
        setPage(data?.page || 1);
        setTotalPages(data?.totalPages || 1);
        setTotalResults(data?.totalResults || 0);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, emailFilter]);

  function handleApplyFilter(e) {
    e.preventDefault();
    setPage(1);
    setEmailFilter(emailInput.trim());
  }

  function handleClearFilter() {
    setEmailInput("");
    setEmailFilter("");
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
              <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FiActivity /> System Audit Trail
              </span>
              <span className="text-xs font-extrabold text-slate-400 uppercase bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                {totalResults} Estimated Logs
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-3">
              User Activity & Request Audit Logs
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Inspect user actions, HTTP method types (GET, POST, PUT, DELETE), URL endpoints, status codes, and timestamps.
            </p>
          </div>
        </div>

        {/* SEARCH FILTER */}
        <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
          <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Search audit logs by email address..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500 transition"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-violet-500/20 flex items-center justify-center gap-1.5"
            >
              <FiSearch /> Search Logs
            </button>

            {emailFilter && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="px-5 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-semibold text-xs rounded-xl transition"
              >
                Clear Filter
              </button>
            )}
          </form>
        </div>

        {/* LOGS TABLE */}
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/90 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Endpoint URL</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-900/40 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white text-sm">{log.username || "System User"}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{log.email || "No email"}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                          {log.action || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold uppercase ${
                          log.method === "GET"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : log.method === "POST"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : log.method === "PUT"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : log.method === "DELETE"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {log.method || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="max-w-[200px] truncate text-xs font-mono text-slate-400" title={log.url}>
                          {log.url || "-"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          !log.statusCode
                            ? "bg-slate-800 text-slate-400"
                            : log.statusCode >= 200 && log.statusCode < 300
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : log.statusCode >= 300 && log.statusCode < 400
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {log.statusCode || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400 font-mono whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <FiActivity className="mx-auto text-3xl mb-2 text-slate-600" />
                      <p className="text-sm font-semibold">No audit logs found matching criteria.</p>
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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