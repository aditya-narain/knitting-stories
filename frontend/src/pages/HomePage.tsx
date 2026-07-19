import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import type { Category, Page, ProductSummary } from "../types";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

export default function HomePage() {
  const [featured, setFeatured] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Page<ProductSummary>>("/products", { params: { featured: true, size: 4 } }),
      api.get<Category[]>("/categories"),
    ])
      .then(([p, c]) => {
        setFeatured(p.data.content);
        setCategories(c.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-cream-100 to-terracotta-50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-terracotta-600">
              Handmade with love
            </span>
            <h1 className="mt-5 font-display text-5xl leading-tight text-ink-900 md:text-6xl">
              Cosy crochet,
              <br />
              <span className="text-terracotta-500">stitched to last.</span>
            </h1>
            <p className="mt-5 max-w-md font-serif text-xl text-ink-700/90">
              Discover heirloom blankets, huggable amigurumi and everyday accessories —
              each piece lovingly crafted by our makers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary">
                Shop the collection
              </Link>
              <Link to="/register" className="btn-outline">
                Become a seller
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
              <img src="/products/granny-blanket-1.svg" alt="" className="card aspect-square w-full translate-y-4 object-cover" />
              <img src="/products/bunny-1.svg" alt="" className="card aspect-square w-full object-cover" />
              <img src="/products/tote-1.svg" alt="" className="card aspect-square w-full object-cover" />
              <img src="/products/beanie-1.svg" alt="" className="card aspect-square w-full -translate-y-4 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-cream-200 bg-cream-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3">
          <Value title="Made to order" text="Fresh stitches, never mass-produced." />
          <Value title="30-day returns" text="Changed your mind? Send it back within 30 days." />
          <Value title="Secure checkout" text="Razorpay-powered payments in ₹ INR." />
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-3xl text-ink-900">Shop by category</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="rounded-full border border-cream-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-800 shadow-sm transition-colors hover:border-terracotta-400 hover:text-terracotta-600"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl text-ink-900">Featured pieces</h2>
          <Link to="/products" className="text-sm font-medium text-terracotta-600 hover:underline">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Value({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div>
        <h3 className="font-display text-lg text-ink-900">{title}</h3>
        <p className="text-sm text-ink-700/80">{text}</p>
      </div>
    </div>
  );
}
