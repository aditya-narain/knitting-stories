import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import type { Page, ProductSummary } from "../../types";
import { formatINR, statusLabel } from "../../lib/format";
import Spinner from "../../components/Spinner";
import SellerNav from "../../components/SellerNav";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api
      .get<Page<ProductSummary>>("/seller/products", { params: { size: 100 } })
      .then((r) => setProducts(r.data.content))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function remove(id: string) {
    if (!confirm("Archive this product? It will be hidden from the store.")) return;
    await api.delete(`/seller/products/${id}`);
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SellerNav />
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink-900">Products</h2>
        <Link to="/seller/products/new" className="btn-primary">
          + Add product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-cream-200 py-20 text-center text-ink-700/70">
          No products yet. Add your first creation!
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-left text-ink-700/70">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-cream-200">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.primaryImageUrl || "/products/marketbag-1.svg"} alt="" className="h-11 w-11 rounded-lg object-cover" />
                      <span className="font-medium text-ink-900">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{formatINR(p.basePrice)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cream-200 px-2.5 py-1 text-xs text-ink-700">
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/seller/products/${p.id}/edit`} className="text-terracotta-600 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => remove(p.id)} className="ml-4 text-ink-700/60 hover:text-red-600">
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
