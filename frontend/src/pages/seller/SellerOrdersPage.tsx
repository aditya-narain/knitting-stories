import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../../lib/api";
import type { Order, Page } from "../../types";
import { formatDate, formatINR } from "../../lib/format";
import Spinner from "../../components/Spinner";
import SellerNav from "../../components/SellerNav";
import StatusBadge from "../../components/StatusBadge";

const NEXT_STATUS: Record<string, { label: string; status: string }[]> = {
  PLACED: [
    { label: "Confirm", status: "CONFIRMED" },
    { label: "Mark shipped", status: "SHIPPED" },
  ],
  CONFIRMED: [{ label: "Mark shipped", status: "SHIPPED" }],
  SHIPPED: [{ label: "Mark delivered", status: "DELIVERED" }],
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api
      .get<Page<Order>>("/seller/orders", { params: { size: 100 } })
      .then((r) => setOrders(r.data.content))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateStatus(orderId: string, status: string) {
    setError(null);
    try {
      const r = await api.patch<Order>(`/seller/orders/${orderId}/status`, { status });
      setOrders((os) => os.map((o) => (o.id === orderId ? r.data : o)));
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SellerNav />
      <h2 className="font-display text-2xl text-ink-900">Orders</h2>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-cream-200 py-20 text-center text-ink-700/70">
          No orders yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink-900">Order #{o.orderNumber}</p>
                  <p className="text-sm text-ink-700/70">
                    {formatDate(o.placedAt ?? o.createdAt)} · {o.shipName}, {o.shipCity}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <div className="mt-4 space-y-2 border-t border-cream-200 pt-4">
                {o.items.map((i) => (
                  <div key={i.id} className="flex items-center gap-3 text-sm">
                    <img src={i.imageUrl || "/products/marketbag-1.svg"} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <span className="flex-1 text-ink-800">
                      {i.productTitle} · {i.variantName} × {i.quantity}
                    </span>
                    <span className="text-ink-700">{formatINR(i.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium text-ink-900">Total {formatINR(o.total)}</span>
                <div className="flex gap-2">
                  {(NEXT_STATUS[o.status] ?? []).map((a) => (
                    <button key={a.status} className="btn-outline text-sm" onClick={() => updateStatus(o.id, a.status)}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
