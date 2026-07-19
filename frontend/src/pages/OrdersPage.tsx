import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import type { Order, Page } from "../types";
import { formatDate, formatINR, statusLabel } from "../lib/format";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Page<Order>>("/orders")
      .then((r) => setOrders(r.data.content))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl text-ink-900">My Orders</h1>
      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-cream-200 py-20 text-center text-ink-700/70">
          You haven't placed any orders yet.
          <div className="mt-4">
            <Link to="/products" className="btn-primary">
              Start shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="card block p-5 transition-shadow hover:shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink-900">Order #{o.orderNumber}</p>
                  <p className="text-sm text-ink-700/70">Placed {formatDate(o.placedAt ?? o.createdAt)}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {o.items.slice(0, 4).map((i) => (
                    <img
                      key={i.id}
                      src={i.imageUrl || "/products/marketbag-1.svg"}
                      alt=""
                      className="h-12 w-12 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-sm text-ink-700/70">{statusLabel(o.status)}</p>
                  <p className="font-display text-lg text-terracotta-600">{formatINR(o.total)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
