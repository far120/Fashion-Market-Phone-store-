import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiSmartphone, FiShoppingBag, FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiWatch, FiArrowRight, FiStar, FiZap, FiCheck } from "react-icons/fi";
import { getProducts } from "../features/product/services/productApi";
import { addToCart, readCart } from "../utils/cart";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import { API_BASE_URL } from "../services/endpoints";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendBaseUrl = useMemo(() => {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }, []);

  function resolveImageUrl(imagePath) {
    if (!imagePath || imagePath === "default.png") {
      return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop";
    }
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${backendBaseUrl}${normalizedPath}`;
  }

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await getProducts({ page: 1, limit: 6, order: "desc" });
        setFeaturedProducts(data.result || []);
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  function handleAddToCart(product) {
    addToCart(product, 1);
    toast.success(`Added ${product.name} to cart! 🛒`);
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Glow Effects background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider glow-emerald">
                <FiZap className="text-sm animate-pulse" />
                <span>Next-Gen Tech & Premium Fashion</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Unleash the Power of <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Smartphones</span> & Tech Gear.
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
                Explore high-performance smartphones, premium audio, wearable tech, and curated fashion accessories — all with express warranty and instant order tracking.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/menu"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-base rounded-2xl transition shadow-xl shadow-emerald-500/25 flex items-center gap-3 group"
                >
                  <FiShoppingBag className="text-xl" />
                  Explore Store Catalog
                  <FiArrowRight className="text-lg group-hover:translate-x-1 transition" />
                </Link>

                {!isAuthenticated ? (
                  <Link
                    to="/register"
                    className="px-7 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-base rounded-2xl transition"
                  >
                    Join as Member
                  </Link>
                ) : (
                  <Link
                    to="/orders"
                    className="px-7 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-base rounded-2xl transition"
                  >
                    View My Orders
                  </Link>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <h4 className="text-2xl font-black text-white">100%</h4>
                  <p className="text-xs text-slate-400 font-medium">Genuine Products</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-emerald-400">24h</h4>
                  <p className="text-xs text-slate-400 font-medium">Express Shipping</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-cyan-400">4.9★</h4>
                  <p className="text-xs text-slate-400 font-medium">Customer Rating</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="glass-card rounded-3xl p-6 relative z-10 shadow-2xl border border-slate-800">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 relative mb-5">
                    <img
                      src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop"
                      alt="Flagship Smartphone"
                      className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      FLAGSHIP TECH
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Premium Series</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">In Stock</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Ultra Smartphone Edition Pro</h3>
                    <p className="text-xs text-slate-400">5G High-Performance Processor, AMOLED 120Hz Display, Quad Camera System</p>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-2xl font-black text-emerald-400">$899.00</span>
                      <Link
                        to="/menu"
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-2xl border border-slate-700/60 shadow-xl hidden sm:flex items-center gap-3 z-20 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                    <FiShield />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">2-Year Warranty</h5>
                    <p className="text-[10px] text-slate-400">Official Brand Coverage</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BRAND PARTNERS SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <p className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6">
            Official Brands & Partners
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            {["APPLE", "SAMSUNG", "XIAOMI", "SONY", "ANKER", "NIKE", "ZARA"].map((brand) => (
              <span key={brand} className="text-lg md:text-xl font-black tracking-widest text-slate-300 hover:text-emerald-400 hover:opacity-100 transition cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Marketplace</span>
            <h2 className="text-3xl font-extrabold text-white">Featured Categories</h2>
          </div>
          <Link to="/menu" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            Browse All Categories <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Smartphones", count: "Flagship & Budget", icon: FiSmartphone, color: "from-emerald-500/20 to-teal-500/20 text-emerald-400", img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop" },
            { title: "Smart Wearables", count: "Watches & Fitness", icon: FiWatch, color: "from-cyan-500/20 to-blue-500/20 text-cyan-400", img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop" },
            { title: "Audio & Accessories", count: "Headphones & Chargers", icon: FiHeadphones, color: "from-purple-500/20 to-indigo-500/20 text-indigo-400", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop" },
            { title: "Fashion Gear", count: "Apparel & Bags", icon: FiShoppingBag, color: "from-rose-500/20 to-pink-500/20 text-rose-400", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop" },
          ].map((cat) => (
            <Link
              key={cat.title}
              to="/menu"
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition group flex flex-col justify-between h-64 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-slate-900/60 z-0 group-hover:bg-slate-900/40 transition" />
              <img src={cat.img} alt={cat.title} className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 group-hover:scale-110 transition duration-500" />
              
              <div className="relative z-10 flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl bg-slate-950/80 backdrop-blur-md flex items-center justify-center border border-slate-800 ${cat.color}`}>
                  <cat.icon className="text-xl" />
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800">
                  {cat.count}
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition">{cat.title}</h3>
                <p className="text-xs text-slate-300 font-medium flex items-center gap-1 mt-1">
                  Explore Products <FiArrowRight className="group-hover:translate-x-1 transition" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Trending Products</span>
            <h2 className="text-3xl font-extrabold text-white">Popular Store Arrivals</h2>
          </div>
          <Link to="/menu" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            View All Products <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 h-80 animate-pulse bg-slate-900/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product._id}
                className="glass-card rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between hover:border-emerald-500/40 transition group"
              >
                <div>
                  <div className="aspect-square rounded-xl bg-slate-900 overflow-hidden relative mb-4">
                    <img
                      src={resolveImageUrl(product.imagePath)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      {product.available ? "In Stock" : "Out of Stock"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="fill-current text-amber-400 text-xs" />
                    ))}
                    <span className="text-slate-400 text-[11px] ml-1 font-medium">(4.8)</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                    {product.description || "High performance genuine product with full warranty coverage."}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block -mb-1">Price</span>
                    <span className="text-xl font-black text-emerald-400">${Number(product.price).toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.available}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <FiShoppingBag /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VALUE PROPOSITION BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "24h Shipping", desc: "Fast delivery on all orders nationwide", icon: FiTruck, color: "text-emerald-400" },
            { title: "Official Warranty", desc: "2-year brand coverage included", icon: FiShield, color: "text-cyan-400" },
            { title: "Easy Returns", desc: "30-day money-back guarantee", icon: FiRefreshCw, color: "text-indigo-400" },
            { title: "24/7 Support", desc: "Dedicated tech support line", icon: FiHeadphones, color: "text-amber-400" },
          ].map((item) => (
            <div key={item.title} className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 ${item.color} text-2xl`}>
                <item.icon />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
