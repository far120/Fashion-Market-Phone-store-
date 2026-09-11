import { useEffect, useState } from "react";
import { FiShoppingBag, FiClock, FiFilter, FiUser, FiPackage, FiCheckCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { useToast } from "../../context/ToastContext";
import { getOrders, updateOrder } from "../../features/product/services/productApi";
;

const statusList = ["pending", "processing", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  async function refreshOrders(page = currentPage, status = statusFilter) {
    try {
      setLoading(true);
      const params = { page, limit: 10, order: "desc" };
      if (status !== "all") {
        params.status = status;
      }

      const data = await getOrders(params);
      setOrders(data.result || []);
      setCurrentPage(data.page || page);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshOrders(1, statusFilter);
  }, []);

  useEffect(() => {
    refreshOrders(1, statusFilter);
  }, [statusFilter]);

  async function handleStatusChange(orderId, status) {
    try {
      await updateOrder(orderId, { status });
      toast?.success("Order status updated successfully");
      await refreshOrders(currentPage, statusFilter);
    } catch (err) {
      toast?.error(err.message || "Failed to update order status");
    }
  }

  function getStatusStyles(status) {
    switch (status) {
      case "processing":
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";
      case "delivered":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case "cancelled":
        return "border-rose-500/30 bg-rose-500/10 text-rose-400";
      default:
        return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    }
  }

  function getOrderCustomer(order) {
    const customer = order?.user;

    if (customer && typeof customer === "object") {
      return {
        name: customer.username || customer.email || "Customer",
        email: customer.email || "No email",
      };
    }

    if (typeof customer === "string" && customer.length > 0) {
      return {
        name: `Customer #${customer.slice(-6)}`,
        email: "User details not populated",
      };
    }

    return {
      name: "Customer",
      email: "User details not available",
    };
  }

  function renderItems(order) {
    return (order.items || []).map((item, index) => {
      const product = item?.product;
      const productName = product && typeof product === "object" ? product.name : product || "Item";
      const unitPrice = Number(item?.price || product?.price || 0);

      return (
        <div key={`${order._id}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-200 text-sm">{productName}</p>
              <p className="text-xs text-slate-500">
                Qty {item.quantity} · ${unitPrice.toFixed(2)} each
              </p>
            </div>
            <p className="text-sm font-bold text-white">${(unitPrice * item.quantity).toFixed(2)}</p>
          </div>
        </div>
      );
    });
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
        
        {/* HEADER & FILTER */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FiShoppingBag /> Order Fulfillment Center
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-3">
              Store Orders Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review customer device orders, track line items, update delivery status, and inspect checkout totals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <FiFilter className="text-slate-400 text-lg" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 uppercase outline-none focus:border-emerald-500 transition"
            >
              <option value="all">All Order Statuses</option>
              {statusList.map((status) => (
                <option key={status} value={status}>
                  {status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-xl">
              <FiShoppingBag />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Orders On Screen</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">{orders.length}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl">
              <FiPackage />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Items Processed</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">
                {orders.reduce((count, order) => count + (order.items || []).length, 0)}
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xl">
              <FiCheckCircle />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Page Value</p>
              <p className="text-2xl font-extrabold text-amber-400 mt-0.5">
                ${orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* ORDERS LIST GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => {
            const customer = getOrderCustomer(order);

            return (
              <article key={order._id} className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4 hover:border-slate-700 transition">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
                      <FiUser />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                        Order #{order._id?.slice(-6)}
                      </p>
                      <h2 className="text-lg font-bold text-white">{customer.name}</h2>
                      <p className="text-xs text-slate-400">{customer.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                      <FiClock /> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recent"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">{renderItems(order)}</div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Total</p>
                    <p className="text-2xl font-extrabold text-white">${Number(order.totalAmount || 0).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">Update Status:</span>
                    <select
                      value={order.status}
                      onChange={(event) => handleStatusChange(order._id, event.target.value)}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-100 outline-none focus:border-emerald-500 transition"
                    >
                      {statusList.map((status) => (
                        <option key={status} value={status}>
                          {status.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </article>
            );
          })}

          {orders.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-800 p-12 text-center">
              <FiShoppingBag className="mx-auto text-4xl text-slate-600 mb-3" />
              <p className="text-base font-bold text-slate-300">No orders found</p>
              <p className="text-xs text-slate-500 mt-1">There are no orders matching your current status filter.</p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between gap-4 glass-card rounded-2xl border border-slate-800 px-6 py-4">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => refreshOrders(currentPage - 1, statusFilter)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
          >
            <FiChevronLeft /> Previous
          </button>

          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Page <span className="text-white font-extrabold">{currentPage}</span> of <span className="text-white font-extrabold">{totalPages}</span>
          </p>

          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => refreshOrders(currentPage + 1, statusFilter)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
          >
            Next <FiChevronRight />
          </button>
        </div>

      </div>
    </div>
  );
}

