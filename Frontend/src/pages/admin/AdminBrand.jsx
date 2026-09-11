import { useEffect, useState } from "react";
import { FiAward, FiPlus, FiSearch, FiTrash2, FiTag } from "react-icons/fi";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { useToast } from "../../context/ToastContext";
import { createBrand, getBrands, deleteBrand } from "../../features/product/services/productApi";

export default function AdminBrandsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      toast?.warning("Brand name is required");
      return;
    }

    try {
      await createBrand({ name: name.trim() });
      setName("");
      toast?.success("Brand created successfully");
      await refreshData();
    } catch (err) {
      toast?.error(err.message || "Failed to create brand");
    }
  }

  async function refreshData() {
    try {
      setLoading(true);
      const data = await getBrands({ page: 1, limit: 100, order: "desc" });
      setBrands(data.result || []);
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

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  async function handleDelete(brandId) {
    const confirmDelete = window.confirm("Are you sure you want to delete this brand? This action cannot be undone.");
    if (!confirmDelete) {
      return;
    }
    try {
      await deleteBrand(brandId);
      setBrands((prev) => prev.filter((item) => item._id !== brandId));
      toast?.success("Brand deleted successfully");
    } catch (err) {
      toast?.error(err.message || "Failed to delete brand");
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
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FiAward /> Brand Partners Catalog
              </span>
              <span className="text-xs font-extrabold text-slate-400 uppercase bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                {brands.length} Total Brands
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-3">
              Device Brands Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Add and organize device manufacturer brands (e.g. Apple, Samsung, Google Pixel, Xiaomi, OnePlus).
            </p>
          </div>
        </div>

        <section className="grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          
          {/* CREATE BRAND FORM */}
          <article className="glass-card rounded-3xl border border-slate-800 p-6 space-y-5 h-fit">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl">
                <FiPlus />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add New Brand</h2>
                <p className="text-xs text-slate-400">Create a brand entry for phone product filtering.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Apple, Samsung, Sony..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <FiPlus className="text-lg" /> Create Brand
              </button>
            </form>
          </article>

          {/* BRANDS LIST PANEL */}
          <article className="glass-card rounded-3xl border border-slate-800 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-xl">
                  <FiTag />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Active Brands</h2>
                  <p className="text-xs text-slate-400">{filteredBrands.length} matching brand entries</p>
                </div>
              </div>

              <div className="relative w-full max-w-xs">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Filter brands..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredBrands.map((brand) => (
                <div
                  key={brand._id}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 hover:border-slate-700 transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 text-cyan-400 font-bold flex items-center justify-center text-sm">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-cyan-400 transition">{brand.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">ID: #{brand._id.slice(-6)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(brand._id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                    title="Delete Brand"
                  >
                    <FiTrash2 className="text-base" />
                  </button>
                </div>
              ))}

              {filteredBrands.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-800 p-8 text-center">
                  <FiTag className="mx-auto text-3xl text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-400">No brands found</p>
                  <p className="text-xs text-slate-500 mt-1">Try creating a new brand or modifying your search query.</p>
                </div>
              )}
            </div>
          </article>
        </section>

      </div>
    </div>
  );
}

