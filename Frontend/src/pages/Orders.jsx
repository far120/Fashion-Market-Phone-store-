import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiShoppingBag, FiClock, FiCheckCircle, FiXCircle, FiPackage, FiTruck, FiTrash2, FiArrowRight } from "react-icons/fi";
import Spinner from "../components/ui/Spinner";
import Error from "../components/ui/Erorr";
import { useAuth } from "../features/auth/hooks/useAuth";
import { createOrder, getOrders, getProducts, updateOrder } from "../features/product/services/productApi";
import { clearCart, getCartTotals, readCart, removeCartItem, syncCartWithInventory, updateCartItem } from "../utils/cart";
import { useToast } from "../context/ToastContext";

const statusList = ["pending", "processing", "delivered", "cancelled"];

export default function OrdersPage() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadOrders(page = currentPage, status = statusFilter) {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = { page, limit: 10, order: "desc" };
      if (status !== "all") {
        params.status = status;
      }

      const data = await getOrders(params);
      const ownOrders = (data.result || []).filter((order) => {
        const orderUserId = order?.user && typeof order.user === "object" ? order.user?._id : order?.user;
        return !user?._id || String(orderUserId) === String(user._id);
      });

      setOrders(ownOrders);
      setCurrentPage(data.page || page);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function syncInventory() {
      try {
        const data = await getProducts({ page: 1, limit: 100, order: "desc" });
        if (!mounted) {
          return;
        }

        setInventory(data.result || []);
        setCart(syncCartWithInventory(readCart(), data.result || []));
      } catch {
        if (mounted) {
          setCart(readCart());
        }
      }
    }

    syncInventory();
    loadOrders(1, statusFilter);

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders(1, statusFilter);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (inventory.length > 0) {
      setCart((currentCart) => syncCartWithInventory(currentCart, inventory));
    }
  }, [inventory]);

  const totals = useMemo(() => getCartTotals(cart), [cart]);

  const orderItemCount = useMemo(() => {
    return orders.reduce((count, order) => {
      return count + (order.items || []).length;
    }, 0);
  }, [orders]);

  function getStatusStyles(status) {
    switch (status) {
      case "processing":
        return "border-amber-500/30 bg-amber-500/10 text-amber-400";
      case "delivered":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case "cancelled":
        return "border-rose-500/30 bg-rose-500/10 text-rose-400";
      default:
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";
    }
  }

  function renderOrderUser(order) {
    const orderUser = order?.user;

    if (orderUser && typeof orderUser === "object") {
      return orderUser.username || orderUser.email || "Customer";
    }

    if (typeof orderUser === "string" && orderUser.length > 0) {
      return `Customer #${orderUser.slice(-6)}`;
    }

    return "Customer";
  }

  function renderOrderItems(order) {
    return (order.items || []).map((item, index) => {
      const product = item?.product;
      const productName = product && typeof product === "object" ? product.name : product || "Product";
      const unitPrice = Number(item?.price || product?.price || 0);

      return (
        <div
          key={`${order._id}-${index}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs"
        >
          <div>
            <p className="font-semibold text-white">{productName}</p>
            <p className="text-slate-400 mt-0.5">
              Qty {item.quantity} · ${unitPrice.toFixed(2)} each
            </p>
          </div>
          <p className="font-bold text-emerald-400">${(unitPrice * item.quantity).toFixed(2)}</p>
        </div>
      );
    });
  }

  async function handlePlaceOrder() {
    if (!isAuthenticated) {
      toast?.warning("Please login first");
      return;
    }

    if (cart.length === 0) {
      toast?.info("Cart is empty");
      return;
    }

    try {
      setSubmitting(true);
      const syncedCart = syncCartWithInventory(cart, inventory);
      if (syncedCart.length === 0) {
        toast?.warning("Your cart has no available items");
        return;
      }

      await createOrder({
        items: syncedCart.map((item) => ({ product: item.productId, quantity: item.quantity })),
      });

      clearCart();
      setCart([]);
      window.dispatchEvent(new Event("storage"));
      toast?.success("Order placed successfully! 🎉");
      await loadOrders(currentPage, statusFilter);
    } catch (err) {
      setError(err);
      toast?.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOrderUpdate(orderId, status) {
    try {
      setSubmitting(true);
      await updateOrder(orderId, isAdmin ? { status } : {});
      toast?.success(isAdmin ? "Order status updated" : "Order cancelled");
      await loadOrders(currentPage, statusFilter);
    } catch (err) {
      toast?.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mx-auto">
            <FiShoppingBag />
          </div>
          <h1 className="text-2xl font-bold text-white">Sign In Required</h1>
          <p className="text-slate-400 text-sm">Please sign in to place and track your tech & fashion orders.</p>
          <Link
            to="/login"
            className="block w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* HEADER STATS */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Order Dashboard
              </span>
              <h1 className="text-3xl font-extrabold text-white mt-3">
                Order Checkout & Order History
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Submit active cart items or review previous orders, tracking statuses, and total invoices.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Cart Items</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">{totals.itemsCount}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Tracked Orders</span>
                <span className="text-xl font-black text-cyan-400 mt-1 block">{orders.length}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Order Lines</span>
                <span className="text-xl font-black text-indigo-400 mt-1 block">{orderItemCount}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Cart Total</span>
                <span className="text-xl font-black text-amber-400 mt-1 block">${totals.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHECKOUT & HISTORY DUAL PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CHECKOUT PANEL */}
          <article id="checkout" className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Checkout</span>
                <h2 className="text-xl font-bold text-white">Create Order</h2>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Subtotal: ${totals.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.productId} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-400">${Number(item.price).toFixed(2)} each</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = removeCartItem(item.productId);
                        setCart(updated);
                        window.dispatchEvent(new Event("storage"));
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      title="Remove item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Qty:</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = updateCartItem(item.productId, Number(e.target.value || 1));
                          setCart(updated);
                          window.dispatchEvent(new Event("storage"));
                        }}
                        className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-10 px-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                  <FiShoppingBag className="text-3xl text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Your cart is empty.</p>
                  <Link to="/menu" className="text-xs font-bold text-emerald-400 hover:underline mt-2 inline-block">
                    Explore Store Catalog →
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-sm font-bold text-white">
                <span>Total Amount:</span>
                <span className="text-xl text-emerald-400">${totals.totalAmount.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting || cart.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {submitting ? "Submitting Order..." : "Place Order Now"} <FiArrowRight />
              </button>
            </div>
          </article>

          {/* RIGHT: ORDER HISTORY PANEL */}
          <article id="history" className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">History</span>
                <h2 className="text-xl font-bold text-white">Order History & Tracking</h2>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-medium"
              >
                <option value="all">All Statuses</option>
                {statusList.map((st) => (
                  <option key={st} value={st}>
                    {st.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <Spinner />
              </div>
            ) : error ? (
              <Error message={error.message} />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-slate-500">
                          ID: #{order._id?.slice(-8)}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-0.5">{renderOrderUser(order)}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recent Order"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusStyles(order.status)}`}>
                          {order.status}
                        </span>
                        <p className="text-base font-black text-emerald-400 mt-1">
                          ${Number(order.totalAmount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">{renderOrderItems(order)}</div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-xs text-slate-400">
                        {(order.items || []).length} product line(s)
                      </span>

                      {isAdmin ? (
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderUpdate(order._id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-emerald-400 font-bold outline-none"
                        >
                          {statusList.map((st) => (
                            <option key={st} value={st}>
                              Set Status: {st}
                            </option>
                          ))}
                        </select>
                      ) : (
                        order.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleOrderUpdate(order._id, "cancelled")}
                            className="px-3 py-1.5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition"
                          >
                            Cancel Order
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
                    No order records found under this filter.
                  </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={currentPage <= 1 || loading}
                    onClick={() => loadOrders(currentPage - 1, statusFilter)}
                    className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 disabled:opacity-50 text-xs font-bold text-slate-300 rounded-xl hover:bg-slate-800 transition"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => loadOrders(currentPage + 1, statusFilter)}
                    className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 disabled:opacity-50 text-xs font-bold text-slate-300 rounded-xl hover:bg-slate-800 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </article>
        </div>

      </div>
    </div>
  );
}

