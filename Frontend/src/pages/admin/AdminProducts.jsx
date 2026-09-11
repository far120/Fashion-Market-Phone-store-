import { useEffect, useMemo, useState } from "react";
import { FiBox, FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiUploadCloud, FiRefreshCw, FiDollarSign } from "react-icons/fi";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../services/endpoints";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getBrands,
  getProducts,
  updateProduct,
} from "../../features/product/services/productApi";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  brand: "",
  available: "true",
};

export default function AdminProductsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);

  const backendBaseUrl = useMemo(() => {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }, []);

  function resolveImageUrl(imagePath) {
    if (!imagePath || imagePath === "default.png") {
      return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9";
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${backendBaseUrl}${normalizedPath}`;
  }

  async function refreshData() {
    try {
      setLoading(true);
      const [productsData, categoriesData, brandsData] = await Promise.all([
        getProducts({ page: 1, limit: 100, order: "desc" }),
        getCategories({ page: 1, limit: 100, order: "desc" }),
        getBrands({ page: 1, limit: 100, order: "desc" }),
      ]);

      setProducts(productsData.result || []);
      setCategories(categoriesData.result || []);
      setBrands(brandsData.result || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((item) => map.set(item._id, item.name));
    return map;
  }, [categories]);

  const brandMap = useMemo(() => {
    const map = new Map();
    brands.forEach((item) => map.set(item._id, item.name));
    return map;
  }, [brands]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const categoryName = categoryMap.get(product.category) || "";
      const brandName = brandMap.get(product.brand) || "";
      const matchesSearch = !term || `${product.name} ${categoryName} ${brandName}`.toLowerCase().includes(term);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && product.available) ||
        (availabilityFilter === "unavailable" && !product.available);

      return matchesSearch && matchesAvailability;
    });
  }, [products, searchTerm, categoryMap, brandMap, availabilityFilter]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function beginEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      category: typeof product.category === "object" ? product.category?._id || "" : product.category || "",
      brand: typeof product.brand === "object" ? product.brand?._id || "" : product.brand || "",
      available: product.available ? "true" : "false",
    });
    setImageFile(null);
  }

  function getCategoryName(product) {
    if (product.category && typeof product.category === "object") {
      return product.category.name || "Uncategorized";
    }

    return categoryMap.get(product.category) || "Uncategorized";
  }
  
  function getBrandName(product) {
    if (product.brand && typeof product.brand === "object") {
      return product.brand.name || "No brand";
    }
    return brandMap.get(product.brand) || "No brand";
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
    setImageFile(null);
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.category) {
      toast?.warning("Category is required");
      return;
    }

    if (!form.brand) {
      toast?.warning("Brand is required");
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("description", form.description);
    payload.append("price", Number(form.price));
    payload.append("stock", Number(form.stock));
    payload.append("category", form.category);
    payload.append("brand", form.brand);
    payload.append("available", form.available);

    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        toast?.success("Product updated successfully");
      } else {
        await createProduct(payload);
        toast?.success("Product created successfully");
      }

      resetForm();
      await refreshData();
    } catch (err) {
      toast?.error(err.message || "Failed to save product");
    }
  }

  async function handleDelete(productId) {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;
    try {
      await deleteProduct(productId);
      toast?.success("Product deleted successfully");
      await refreshData();
    } catch (err) {
      toast?.error(err.message || "Failed to delete product");
    }
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
        
        {/* HEADER BANNER */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FiBox /> Smartphone Inventory & Catalog
              </span>
              <span className="text-xs font-extrabold text-slate-400 uppercase bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                {products.length} Total Listings
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-3">
              Device Catalog Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Add new phone models, update price tags, modify stock availability, and manage device specs.
            </p>
          </div>
        </div>

        <section className="grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          
          {/* PRODUCT FORM PANEL */}
          <article className="glass-card rounded-3xl border border-slate-800 p-6 space-y-5 h-fit">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl">
                  {editingId ? <FiEdit2 /> : <FiPlus />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingId ? "Edit Smartphone Specs" : "Add New Smartphone"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {editingId ? "Update existing device details" : "Fill details to create catalog item"}
                  </p>
                </div>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
                >
                  <FiRefreshCw /> Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Device Model Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. iPhone 15 Pro Max 256GB"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Specifications & Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe processor, camera specs, battery capacity, color option..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Product Image Upload
                </label>
                <div className="relative">
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 transition cursor-pointer"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {editingId ? "Upload only if you want to replace current image" : "High quality device preview image"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Price ($)
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min={1}
                    value={form.price}
                    onChange={handleChange}
                    placeholder="999.00"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    name="stock"
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="25"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-xs font-bold text-slate-200 outline-none focus:border-emerald-500 transition"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Manufacturer Brand
                  </label>
                  <select
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-xs font-bold text-slate-200 outline-none focus:border-emerald-500 transition"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Storefront Status
                </label>
                <select
                  name="available"
                  value={form.available}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-xs font-bold text-slate-200 outline-none focus:border-emerald-500 transition"
                >
                  <option value="true">Available for Order</option>
                  <option value="false">Hidden / Out of Stock</option>
                </select>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {editingId ? <FiEdit2 /> : <FiPlus />}
                  {editingId ? "Update Product" : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white transition"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </article>

          {/* PRODUCTS LIST PANEL */}
          <article className="glass-card rounded-3xl border border-slate-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Active Products</h2>
                <p className="text-xs text-slate-400">{filteredProducts.length} matching inventory items</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search name/brand..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <select
                  value={availabilityFilter}
                  onChange={(event) => setAvailabilityFilter(event.target.value)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-emerald-500 transition"
                >
                  <option value="all">All Items</option>
                  <option value="available">Available Only</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={resolveImageUrl(product.image)}
                        alt={product.name}
                        onError={(event) => {
                          event.currentTarget.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9";
                        }}
                        className="h-16 w-16 rounded-xl object-cover border border-slate-800 bg-slate-950 flex-shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-white text-base">{product.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{product.description || "No description provided."}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-slate-300">
                            {getCategoryName(product)}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold border border-cyan-500/20">
                            {getBrandName(product)}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            product.available && (product.stock ?? 0) > 0
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {product.available ? `In Stock (${product.stock ?? 0})` : "Unavailable"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xl font-extrabold text-amber-400 font-mono">${Number(product.price || 0).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-800/60 pt-3">
                    <button
                      type="button"
                      onClick={() => beginEdit(product)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-400 border border-rose-500/20 transition flex items-center gap-1"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
                  <FiBox className="mx-auto text-3xl text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-400">No products found</p>
                  <p className="text-xs text-slate-500 mt-1">Try adding a new smartphone product or clearing search filters.</p>
                </div>
              )}
            </div>
          </article>
        </section>

      </div>
    </div>
  );
}

