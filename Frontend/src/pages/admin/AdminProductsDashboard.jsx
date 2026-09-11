import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiBox, FiClock, FiLayers, FiShoppingBag, FiAward, FiTrendingUp, FiDollarSign, FiArrowRight } from "react-icons/fi";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { getCategories, getOrders, getProducts, getBrands, getstatistics } from "../../features/product/services/productApi";


export default function AdminProductsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);
  const [brandsData, setBrandsData] = useState(null);
  const [ordersData, setOrdersData] = useState(null);
  const [statisticsData, setStatisticsData] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse, ordersResponse, statisticsResponse, brandsResponse] = await Promise.all([
          getProducts({ page: 1, limit: 20, order: "desc" }),
          getCategories({ page: 1, limit: 20, order: "desc" }),
          getOrders({ page: 1, limit: 20, order: "desc" }),
          getstatistics({ page: 1, limit: 20, order: "desc" }),
          getBrands({ page: 1, limit: 20, order: "desc" }),
        ]);

        if (mounted) {
          setProductsData(productsResponse);
          setCategoriesData(categoriesResponse);
          setBrandsData(brandsResponse);
          setOrdersData(ordersResponse);
          setStatisticsData(statisticsResponse);
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

  const products = productsData?.result || [];
  const orders = ordersData?.result || [];
  const brands = brandsData?.result || [];
  const statistics = statisticsData?.data || {};

  const unavailableCount = useMemo(() => {
    return products.filter((item) => !item.available).length;
  }, [products]);

  const recentProducts = useMemo(() => products.slice(0, 5), [products]);
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

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
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FiTrendingUp /> Commerce Intelligence & Analytics
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-3">
              Catalog & Sales Overview
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Monitor total sales revenue, order volumes, inventory availability, category health, and recent store activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/admin/products"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <FiBox /> Manage Products
            </Link>
            <Link
              to="/admin/orders"
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <FiShoppingBag /> Manage Orders
            </Link>
            <Link
              to="/admin/categories"
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <FiLayers /> Categories
            </Link>
            <Link
              to="/admin/brands"
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <FiAward /> Brands
            </Link>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-lg">
              <FiDollarSign />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</p>
            <p className="text-3xl font-extrabold text-white">${Number(statistics.totalRevenue || 0).toFixed(2)}</p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-lg">
              <FiShoppingBag />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders Count</p>
            <p className="text-3xl font-extrabold text-white">{statistics.totalOrdersCount || orders.length || 0}</p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-lg">
              <FiBox />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Products In Catalog</p>
            <p className="text-3xl font-extrabold text-white">{productsData?.totalResults || products.length || 0}</p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-lg">
              <FiAward />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Brands & Categories</p>
            <p className="text-3xl font-extrabold text-white">
              {brands.length} <span className="text-xs text-slate-500 font-normal">brands</span> / {categoriesData?.totalResults || 0} <span className="text-xs text-slate-500 font-normal">cats</span>
            </p>
          </div>
        </div>

        {/* STATUS BREAKDOWN CARDS */}
        {statistics.byStatus && statistics.byStatus.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {statistics.byStatus.map((statusItem) => (
              <div key={statusItem._id} className="glass-card rounded-2xl border border-slate-800 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Status: {statusItem._id}</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">${Number(statusItem.totalPrice || 0).toFixed(2)}</p>
                </div>
                <span className="text-xs font-bold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-slate-300">
                  {statusItem.count || 0} orders
                </span>
              </div>
            ))}
          </div>
        )}

        {/* RECENT CATALOG & ORDERS SPLIT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* RECENT PRODUCTS */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xl">
                  <FiBox />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Recent Catalog Products</h2>
                  <p className="text-xs text-slate-400">Latest additions to storefront inventory</p>
                </div>
              </div>
              <Link to="/admin/products" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                View All <FiArrowRight />
              </Link>
            </div>

            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div key={product._id} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white text-sm">{product.name || "Product"}</p>
                    <p className="text-xs text-amber-400 font-mono mt-0.5">${Number(product.price || 0).toFixed(2)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    product.available
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {product.available ? "Available" : "Unavailable"}
                  </span>
                </div>
              ))}

              {recentProducts.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No products found in catalog.</p>
              )}
            </div>
          </div>

          {/* RECENT ORDERS */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-xl">
                  <FiShoppingBag />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Recent Customer Orders</h2>
                  <p className="text-xs text-slate-400">Latest transactions across storefront</p>
                </div>
              </div>
              <Link to="/admin/orders" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                View All <FiArrowRight />
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => {
                const customerName = order?.user && typeof order.user === "object"
                  ? order.user.username || order.user.email || "Customer"
                  : "Customer";

                return (
                  <div key={order._id} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white text-sm">{customerName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {order.items?.length || 0} items · <span className="text-slate-200 font-bold">${Number(order.totalAmount || 0).toFixed(2)}</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 uppercase">
                      {order.status || "pending"}
                    </span>
                  </div>
                );
              })}

              {recentOrders.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No recent orders found.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

