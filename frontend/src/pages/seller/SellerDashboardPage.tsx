import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import type { SellerAnalytics } from "../../types";
import { formatINR } from "../../lib/format";
import Spinner from "../../components/Spinner";
import SellerNav from "../../components/SellerNav";

export default function SellerDashboardPage() {
  const [data, setData] = useState<SellerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<SellerAnalytics>("/seller/analytics")
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SellerNav />
      {loading || !data ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Revenue" value={formatINR(data.totalRevenue)} accent />
            <Stat label="Paid orders" value={String(data.totalOrders)} />
            <Stat label="Units sold" value={String(data.unitsSold)} />
            <Stat label="Products" value={String(data.productCount)} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="card p-6 lg:col-span-2">
              <h2 className="font-display text-xl text-ink-900">Top products</h2>
              {data.topProducts.length === 0 ? (
                <p className="mt-4 text-sm text-ink-700/70">No sales yet.</p>
              ) : (
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="text-left text-ink-700/60">
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 text-right font-medium">Units</th>
                      <th className="pb-2 text-right font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((p) => (
                      <tr key={p.productTitle} className="border-t border-cream-200">
                        <td className="py-2.5 text-ink-900">{p.productTitle}</td>
                        <td className="py-2.5 text-right text-ink-700">{p.unitsSold}</td>
                        <td className="py-2.5 text-right font-medium text-ink-900">{formatINR(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card flex flex-col gap-4 p-6">
              <div>
                <p className="text-sm text-ink-700/70">Orders awaiting fulfilment</p>
                <p className="mt-1 font-display text-4xl text-terracotta-600">{data.pendingFulfilment}</p>
              </div>
              <Link to="/seller/orders" className="btn-outline">
                View orders
              </Link>
              <Link to="/seller/products/new" className="btn-primary">
                + Add product
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`card p-6 ${accent ? "bg-terracotta-500 text-cream-50" : ""}`}>
      <p className={`text-sm ${accent ? "text-cream-100" : "text-ink-700/70"}`}>{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}
