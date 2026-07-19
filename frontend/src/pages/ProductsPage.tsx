import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import type { Category, Page, ProductSummary } from "../types";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<Page<ProductSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState(params.get("q") ?? "");

  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "newest";
  const page = Number(params.get("page") ?? "0");

  const query = useMemo(
    () => ({
      q: params.get("q") || undefined,
      category: category || undefined,
      sort,
      page,
      size: 12,
    }),
    [params, category, sort, page],
  );

  useEffect(() => {
    api.get<Category[]>("/categories").then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get<Page<ProductSummary>>("/products", { params: query })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [query]);

  function update(next: Record<string, string | undefined>) {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v) merged.set(k, v);
      else merged.delete(k);
    });
    if (!("page" in next)) merged.set("page", "0");
    setParams(merged);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2 border-b border-cream-200 pb-6">
        <h1 className="font-display text-4xl text-ink-900">The Collection</h1>
        <p className="text-ink-700/80">Handmade crochet, ready to bring home.</p>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row">
        {/* Filters */}
        <aside className="lg:w-64 lg:shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: term || undefined });
            }}
            className="mb-5"
          >
            <label className="label">Search</label>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="Search products…"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
          </form>

          <div className="mb-5">
            <label className="label">Category</label>
            <div className="flex flex-col gap-1.5">
              <button
                className={`rounded-lg px-3 py-1.5 text-left text-sm ${
                  !category ? "bg-terracotta-50 font-medium text-terracotta-600" : "text-ink-700 hover:bg-cream-200"
                }`}
                onClick={() => update({ category: undefined })}
              >
                All products
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`rounded-lg px-3 py-1.5 text-left text-sm ${
                    category === c.slug
                      ? "bg-terracotta-50 font-medium text-terracotta-600"
                      : "text-ink-700 hover:bg-cream-200"
                  }`}
                  onClick={() => update({ category: c.slug })}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Sort by</label>
            <select className="input" value={sort} onChange={(e) => update({ sort: e.target.value })}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-24">
              <Spinner />
            </div>
          ) : !data || data.content.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-cream-200 py-24 text-center text-ink-700/70">
              No products found. Try a different search.
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-ink-700/70">{data.totalElements} products</p>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                {data.content.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {data.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    className="btn-outline"
                    disabled={page <= 0}
                    onClick={() => update({ page: String(page - 1) })}
                  >
                    Previous
                  </button>
                  <span className="px-3 text-sm text-ink-700">
                    Page {page + 1} of {data.totalPages}
                  </span>
                  <button
                    className="btn-outline"
                    disabled={page >= data.totalPages - 1}
                    onClick={() => update({ page: String(page + 1) })}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
