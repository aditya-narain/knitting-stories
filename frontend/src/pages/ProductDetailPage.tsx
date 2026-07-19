import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api";
import type { Page, ProductDetail, Review, Variant } from "../types";
import { formatDate, formatINR } from "../lib/format";
import StarRating from "../components/StarRating";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get<ProductDetail>(`/products/${id}`),
      api.get<Page<Review>>(`/products/${id}/reviews`),
    ])
      .then(([p, r]) => {
        setProduct(p.data);
        setVariant(p.data.variants[0] ?? null);
        setReviews(r.data.content);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdd() {
    if (!variant) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    setAdding(true);
    setMessage(null);
    try {
      await addItem(variant.id, qty);
      setMessage({ type: "ok", text: "Added to your cart." });
    } catch (err) {
      setMessage({ type: "err", text: apiErrorMessage(err) });
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="center-screen">
        <Spinner />
      </div>
    );
  }
  if (!product) {
    return <div className="page-message">Product not found.</div>;
  }

  const images = product.imageUrls.length ? product.imageUrls : ["/products/marketbag-1.svg"];
  const canReview = isAuthenticated && user?.role === "CUSTOMER";

  return (
    <div className="page-wide">
      <nav className="mb-6 muted">
        <Link to="/products" className="hover:text-terracotta-600">
          Shop
        </Link>{" "}
        / <span className="text-ink-800">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="card aspect-square overflow-hidden bg-cream-200">
            <img src={images[activeImage]} alt={product.title} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${
                    i === activeImage ? "border-terracotta-500" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.sellerShopName && (
            <p className="eyebrow text-sm">{product.sellerShopName}</p>
          )}
          <h1 className="mt-1 title-page">{product.title}</h1>
          <div className="mt-3">
            <StarRating value={product.ratingAvg} count={product.ratingCount} size={18} />
          </div>
          <p className="mt-4 price-lg">
            {formatINR(variant?.price ?? product.basePrice)}
          </p>

          <p className="mt-5 font-serif text-lg leading-relaxed text-ink-700/90">{product.description}</p>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mt-6">
              <label className="label">Choose an option</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    disabled={v.stock === 0}
                    onClick={() => setVariant(v)}
                    className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                      variant?.id === v.id
                        ? "border-terracotta-500 bg-terracotta-50 text-terracotta-700"
                        : "border-cream-200 bg-white text-ink-800 hover:border-terracotta-400"
                    } ${v.stock === 0 ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    {v.name}
                    {v.stock === 0 && " (Sold out)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + add */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                className="qty-btn"
                onClick={() => setQty((q) => Math.min(variant?.stock ?? 1, q + 1))}
              >
                +
              </button>
            </div>
            <button className="btn-primary flex-1 sm:flex-none" onClick={handleAdd} disabled={adding || !variant || variant.stock === 0}>
              {variant && variant.stock === 0 ? "Sold out" : adding ? "Adding…" : "Add to cart"}
            </button>
          </div>
          {variant && variant.stock > 0 && variant.stock <= 5 && (
            <p className="mt-2 text-sm text-terracotta-500">Only {variant.stock} left in stock!</p>
          )}
          {message && (
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                message.type === "ok" ? "bg-sage-100 text-sage-600" : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
              {message.type === "ok" && (
                <>
                  {" "}
                  <Link to="/cart" className="font-medium underline">
                    View cart
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 border-t border-cream-200 pt-10">
        <h2 className="title-section">Reviews</h2>
        {canReview && <ReviewForm productId={product.id} onAdded={(r) => setReviews((prev) => [r, ...prev])} />}
        <div className="mt-8 space-y-5">
          {reviews.length === 0 ? (
            <p className="text-ink-700/70">No reviews yet — be the first to share your thoughts.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="panel">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-900">{r.authorName}</span>
                  <span className="text-xs text-ink-700/60">{formatDate(r.createdAt)}</span>
                </div>
                <div className="mt-1.5">
                  <StarRating value={r.rating} showCount={false} size={15} />
                </div>
                {r.comment && <p className="mt-2 text-ink-700/90">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function ReviewForm({ productId, onAdded }: { productId: string; onAdded: (r: Review) => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<Review>(`/products/${productId}/reviews`, { rating, comment });
      onAdded(res.data);
      setComment("");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mt-6 p-6">
      <h3 className="title-panel">Write a review</h3>
      <div className="mt-3">
        <label className="label">Your rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setRating(s)}
              className={`text-2xl ${s <= rating ? "text-terracotta-400" : "text-cream-200"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <label className="label">Comment</label>
        <textarea
          className="input min-h-[90px]"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others what you loved…"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button className="btn-primary mt-4" disabled={busy}>
        {busy ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
