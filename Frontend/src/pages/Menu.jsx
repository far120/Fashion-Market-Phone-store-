import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiFilter, FiShoppingCart, FiSearch, FiX, FiStar, FiGrid, FiSliders, FiCheck, FiShoppingBag } from "react-icons/fi";
import Spinner from "../components/ui/Spinner";
import Error from "../components/ui/Erorr";
import { getCategories, getProducts } from "../features/product/services/productApi";
import { addToCart, getCartItemQuantity, getCartTotals, readCart, syncCartWithInventory } from "../utils/cart";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../services/endpoints";

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "under-50", label: "Under $50" },
  { value: "50-200", label: "$50 - $200" },
  { value: "200-500", label: "$200 - $500" },
  { value: "500-plus", label: "$500+" },
];

export default function MenuPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [customMinPrice, setCustomMinPrice] = useState("");
  const [customMaxPrice, setCustomMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [cartItems, setCartItems] = useState([]);
  const toast = useToast();

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
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts({ page: 1, limit: 100, order: "desc" }),
          getCategories({ page: 1, limit: 100, order: "desc" }),
        ]);
        if (!mounted) {
          return;
        }

        const nextProducts = productsData.result || [];
        setProducts(nextProducts);
        setCategories(categoriesData.result || []);
        setCartItems(syncCartWithInventory(readCart(), nextProducts));
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

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => map.set(category._id, category.name));
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const hasCustomMin = customMinPrice !== "" && Number.isFinite(Number(customMinPrice));
    const hasCustomMax = customMaxPrice !== "" && Number.isFinite(Number(customMaxPrice));

    let result = products.filter((product) => {
      const candidate = `${product.name} ${product.description || ""} ${categoryMap.get(product.category) || ""}`.toLowerCase();
      const matchesSearch = !term || candidate.includes(term);

      const productCategoryId = typeof product.category === "object" ? product.category?._id : product.category;
      const matchesCategory = selectedCategory === "all" || productCategoryId === selectedCategory;

      const price = Number(product.price || 0);
      const matchesPresetPrice =
        selectedPriceRange === "all" ||
        (selectedPriceRange === "under-50" && price < 50) ||
        (selectedPriceRange === "50-200" && price >= 50 && price < 200) ||
        (selectedPriceRange === "200-500" && price >= 200 && price < 500) ||
        (selectedPriceRange === "500-plus" && price >= 500);

      const matchesCustomMin = !hasCustomMin || price >= Number(customMinPrice);
      const matchesCustomMax = !hasCustomMax || price <= Number(customMaxPrice);
      const matchesPrice = matchesPresetPrice && matchesCustomMin && matchesCustomMax;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [
    categoryMap,
    products,
    search,
    selectedCategory,
    selectedPriceRange,
    customMinPrice,
    customMaxPrice,
    sortBy,
  ]);

  const cartTotals = useMemo(() => getCartTotals(cartItems), [cartItems]);

  function getCategoryName(product) {
    if (product.category && typeof product.category === "object") {
      return product.category.name || "General Tech";
    }

    return categoryMap.get(product.category) || "General Tech";
  }

  function handleAdd(product) {
    const existingQuantity = getCartItemQuantity(cartItems, product._id);
    const stock = Number(product.stock || 0);

    if (!product.available || stock <= 0) {
      toast?.warning("This product is currently out of stock ⚠️");
      return;
    }

    if (existingQuantity >= stock) {
      toast?.warning("Maximum available stock already in cart ⚠️");
      return;
    }

    const nextCart = addToCart(product, 1);
    setCartItems(syncCartWithInventory(nextCart, products));
    window.dispatchEvent(new Event("storage"));
    toast?.success(`Added ${product.name} to cart 🛒`);
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategory("all");
    setSelectedPriceRange("all");
    setCustomMinPrice("");
    setCustomMaxPrice("");
    setSortBy("newest");
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
      <div className="mx-auto mt-8 max-w-6xl px-4 text-white">
        <Error message={error.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* TOP HEADER BANNER */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Store Catalog & Gear
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
                Explore Smartphones & Tech Marketplace
              </h1>
              <p className="mt-1.5 text-slate-400 text-sm max-w-2xl">
                Filter by category, search flagship devices, or set custom price ranges to discover genuine products.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                Showing <strong className="text-emerald-400">{filteredProducts.length}</strong> items
              </span>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT: SIDEBAR FILTERS + PRODUCT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SIDEBAR FILTERS */}
          <aside className="lg:col-span-3 space-y-6 glass-panel p-6 rounded-2xl border border-slate-800 sticky top-24">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FiSliders className="text-emerald-400" /> Filter Store
              </h3>
              {(search || selectedCategory !== "all" || selectedPriceRange !== "all" || customMinPrice || customMaxPrice) && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-rose-400 hover:underline flex items-center gap-1"
                >
                  <FiX /> Reset
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none transition"
                />
                <FiSearch className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex justify-between items-center ${
                    selectedCategory === "all"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full">{products.length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex justify-between items-center ${
                      selectedCategory === cat._id
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Preset Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Price Preset</label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Min/Max Price */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Custom Price ($)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={customMinPrice}
                  onChange={(e) => setCustomMinPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={customMaxPrice}
                  onChange={(e) => setCustomMaxPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

          </aside>

          {/* PRODUCT LIST CONTENT */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Sorting & Filter status bar */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FiFilter className="text-emerald-400" />
                <span>Showing results for</span>
                <span className="font-bold text-white">
                  {selectedCategory === "all" ? "All Products" : "Filtered Category"}
                </span>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Product Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* PRODUCT CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const stock = Number(product.stock || 0);
                const currentQtyInCart = getCartItemQuantity(cartItems, product._id);
                const isSoldOut = !product.available || stock <= 0;
                const isMaxInCart = currentQtyInCart >= stock;

                return (
                  <article
                    key={product._id}
                    className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-emerald-500/40 transition group"
                  >
                    <div>
                      {/* Image container */}
                      <div className="aspect-square rounded-xl bg-slate-900 overflow-hidden relative mb-4 border border-slate-800">
                        <img
                          src={resolveImageUrl(product.imagePath || product.image)}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border ${
                            isSoldOut
                              ? "bg-rose-950/80 text-rose-400 border-rose-500/30"
                              : "bg-slate-950/80 text-emerald-400 border-emerald-500/30"
                          }`}>
                            {isSoldOut ? "Out of Stock" : `In Stock (${stock})`}
                          </span>
                        </div>
                      </div>

                      {/* Category tag */}
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
                        {getCategoryName(product)}
                      </span>

                      {/* Rating */}
                      <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className="fill-current text-amber-400 text-[10px]" />
                        ))}
                        <span className="text-slate-400 text-[10px] ml-1 font-medium">(4.9)</span>
                      </div>

                      <h2 className="text-base font-bold text-white group-hover:text-emerald-400 transition line-clamp-1">
                        {product.name}
                      </h2>
                      
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                        {product.description || "Official genuine product with warranty support."}
                      </p>
                    </div>

                    {/* Price and Cart CTA */}
                    <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Price</span>
                        <span className="text-lg font-black text-emerald-400">
                          ${Number(product.price || 0).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdd(product)}
                        disabled={isSoldOut || isMaxInCart}
                        className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-lg ${
                          isSoldOut
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                            : isMaxInCart
                            ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                            : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                        }`}
                      >
                        <FiShoppingBag />
                        {isSoldOut ? "Sold Out" : isMaxInCart ? "In Cart" : "Add"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="glass-panel rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 mx-auto text-2xl">
                  <FiSearch />
                </div>
                <h3 className="text-lg font-bold text-white">No products found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search criteria, price filter, or category selection.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs rounded-xl hover:bg-slate-800 transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

