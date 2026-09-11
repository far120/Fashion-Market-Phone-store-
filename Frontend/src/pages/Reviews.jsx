import { useEffect, useMemo, useState } from "react";
import { FiStar, FiMessageSquare, FiEdit2, FiTrash2, FiCheckCircle, FiUser } from "react-icons/fi";
import Spinner from "../components/ui/Spinner";
import Error from "../components/ui/Erorr";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  createReview,
  deleteReview,
  getProducts,
  getReviews,
  updateReview,
} from "../features/product/services/productApi";


export default function ReviewsPage() {
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function loadProducts() {
    const data = await getProducts({ page: 1, limit: 100, order: "desc" });
    const list = data.result || [];
    setProducts(list);

    if (list.length > 0 && !selectedProduct) {
      setSelectedProduct(list[0]._id);
    }
  }

  async function loadReviews(productId) {
    const data = await getReviews(productId ? { productId } : {});
    setReviews(data.reviews || []);
  }

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        await loadProducts();
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

    loadPage();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    let mounted = true;

    async function syncReviews() {
      try {
        await loadReviews(selectedProduct);
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      }
    }

    syncReviews();

    return () => {
      mounted = false;
    };
  }, [selectedProduct]);

  const myUserId = user?._id || user?.id;

  const selectedProductObj = useMemo(() => {
    return products.find((item) => item._id === selectedProduct);
  }, [products, selectedProduct]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "5.0";
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      toast?.warning("Please sign in to write a review");
      return;
    }

    if (!selectedProduct) {
      toast?.warning("Choose a product first");
      return;
    }

    if (!comment.trim()) {
      toast?.warning("Please write a comment for your review");
      return;
    }

    try {
      if (editingId) {
        await updateReview(editingId, { rating, comment });
        toast?.success("Review updated successfully ⭐");
      } else {
        await createReview({
          productId: selectedProduct,
          rating,
          comment,
        });
        toast?.success("Review published successfully! ⭐");
      }

      setEditingId(null);
      setRating(5);
      setComment("");
      await loadReviews(selectedProduct);
    } catch (err) {
      toast?.error(err.message);
    }
  }

  function handleEdit(review) {
    setEditingId(review._id);
    setRating(review.rating || 5);
    setComment(review.comment || "");
  }

  async function handleDelete(reviewId) {
    try {
      await deleteReview(reviewId);
      toast?.success("Review removed");
      await loadReviews(selectedProduct);
    } catch (err) {
      toast?.error(err.message);
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
      <div className="mx-auto mt-8 max-w-6xl px-4 text-white">
        <Error message={error.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* HEADER */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                Customer Ratings & Feedback
              </span>
              <h1 className="text-3xl font-extrabold text-white mt-3">
                Product Reviews & Ratings
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Read authentic customer feedback and share your product experience with the community.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-center">
                <span className="text-3xl font-black text-amber-400">{averageRating}</span>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Average Score</span>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div>
                <div className="flex items-center text-amber-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="fill-current" />
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-medium">{reviews.length} Verified Reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* DUAL CONTENT: FORM & REVIEWS LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SUBMIT REVIEW FORM */}
          <article className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiMessageSquare className="text-emerald-400" />
                {editingId ? "Edit Your Review" : "Write a Product Review"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Select a product and rate your experience.</p>
            </div>

            <div className="space-y-4">
              {/* Product Selector */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">
                  Select Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 font-medium"
                >
                  {products.map((prod) => (
                    <option key={prod._id} value={prod._id}>
                      {prod.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">
                  Overall Rating ({rating}/5 Stars)
                </label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition hover:scale-125 ${
                        star <= rating ? "text-amber-400 fill-current" : "text-slate-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">
                  Your Feedback
                </label>
                <textarea
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike about this product? Highlight performance, design, or warranty..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                {editingId ? "Update Review" : "Publish Review"}
              </button>
            </div>
          </article>

          {/* RIGHT: REVIEWS LIST */}
          <article className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  {selectedProductObj?.name || "Product"}
                </span>
                <h2 className="text-xl font-bold text-white">Community Reviews</h2>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                {reviews.length} Review{reviews.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-4">
              {reviews.map((rev) => {
                const reviewUserId = rev?.user?._id || rev?.user?.id;
                const canManage = myUserId && reviewUserId === myUserId;
                const revUser = rev?.user?.username || rev?.user?.email || "Verified Customer";

                return (
                  <div key={rev._id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                          <FiUser />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm flex items-center gap-2">
                            {revUser}
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <FiCheckCircle /> Verified Buyer
                            </span>
                          </h4>
                          <div className="flex items-center gap-1 text-amber-400 text-xs mt-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`text-xs ${i < (rev.rating || 5) ? "fill-current text-amber-400" : "text-slate-700"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(rev)}
                            className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition"
                            title="Edit Review"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rev._id)}
                            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                            title="Delete Review"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed pl-13">
                      {rev.comment || "Great product experience!"}
                    </p>
                  </div>
                );
              })}

              {reviews.length === 0 && (
                <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
                  No reviews published for this product yet. Be the first to review!
                </div>
              )}
            </div>
          </article>

        </div>
      </div>
    </div>
  );
}

