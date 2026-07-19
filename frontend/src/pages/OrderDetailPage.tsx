import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api";
import type { Order } from "../types";
import { formatDate, formatINR } from "../lib/format";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";

const TIMELINE = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = (location.state as { justPlaced?: boolean } | null)?.justPlaced;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReturn, setShowReturn] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  const load = useCallback(() => {
    if (!id) return;
    api
      .get<Order>(`/orders/${id}`)
      .then((r) => setOrder(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => load(), [load]);

  async function cancel() {
    if (!order || !confirm("Cancel this order?")) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.post<Order>(`/orders/${order.id}/cancel`, {});
      setOrder(r.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function requestReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.post<Order>(`/orders/${order.id}/return`, { reason: returnReason });
      setOrder(r.data);
      setShowReturn(false);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!order) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-ink-700">Order not found.</div>;
  }

  const cancelled = order.status === "CANCELLED";
  const currentStep = TIMELINE.indexOf(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/orders" className="text-sm text-ink-700/70 hover:text-terracotta-600">
        ← Back to orders
      </Link>

      {justPlaced && (
        <div className="mt-4 rounded-2xl bg-sage-100 px-5 py-4 text-sage-600">
          <p className="font-display text-lg">Thank you! Your order is confirmed.</p>
          <p className="text-sm">We'll start crafting right away.</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-ink-700/70">Placed {formatDate(order.placedAt ?? order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Tracking timeline */}
      {!cancelled && order.status !== "RETURNED" && order.status !== "RETURN_REQUESTED" && (
        <div className="card mt-6 p-6">
          <div className="flex items-center justify-between">
            {TIMELINE.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div className={`h-0.5 flex-1 ${i === 0 ? "bg-transparent" : i <= currentStep ? "bg-terracotta-400" : "bg-cream-200"}`} />
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                      i <= currentStep ? "bg-terracotta-500 text-cream-50" : "bg-cream-200 text-ink-700/50"
                    }`}
                  >
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <div className={`h-0.5 flex-1 ${i === TIMELINE.length - 1 ? "bg-transparent" : i < currentStep ? "bg-terracotta-400" : "bg-cream-200"}`} />
                </div>
                <span className={`mt-2 text-xs ${i <= currentStep ? "font-medium text-ink-900" : "text-ink-700/50"}`}>
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {cancelled && (
        <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-red-700">
          This order was cancelled{order.cancelledAt ? ` on ${formatDate(order.cancelledAt)}` : ""}.
        </div>
      )}
      {order.returnStatus !== "NONE" && (
        <div className="mt-6 rounded-2xl bg-orange-50 px-5 py-4 text-orange-700">
          Return {order.returnStatus.toLowerCase()}. {order.returnReason && `Reason: ${order.returnReason}`}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-3 lg:col-span-2">
          {order.items.map((i) => (
            <div key={i.id} className="card flex items-center gap-4 p-4">
              <img src={i.imageUrl || "/products/marketbag-1.svg"} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-medium text-ink-900">{i.productTitle}</p>
                <p className="text-sm text-ink-700/70">
                  {i.variantName} · Qty {i.quantity}
                </p>
              </div>
              <span className="font-medium text-ink-900">{formatINR(i.lineTotal)}</span>
            </div>
          ))}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            {order.cancellable && (
              <button className="btn-outline" onClick={cancel} disabled={busy}>
                Cancel order
              </button>
            )}
            {order.returnable && !showReturn && (
              <button className="btn-outline" onClick={() => setShowReturn(true)}>
                Request return
              </button>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}

          {showReturn && (
            <form onSubmit={requestReturn} className="card p-5">
              <h3 className="font-display text-lg text-ink-900">Request a return</h3>
              <p className="text-sm text-ink-700/70">Eligible within 30 days of delivery.</p>
              <textarea
                className="input mt-3 min-h-[80px]"
                placeholder="Reason for return"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
              />
              <div className="mt-3 flex gap-2">
                <button className="btn-primary" disabled={busy}>
                  Submit request
                </button>
                <button type="button" className="btn-ghost" onClick={() => setShowReturn(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Summary + shipping */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display text-lg text-ink-900">Payment</h3>
            <dl className="mt-3 space-y-1.5 text-sm text-ink-700">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatINR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{order.shippingFee === 0 ? "Free" : formatINR(order.shippingFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-cream-200 pt-2 font-medium text-ink-900">
                <dt>Total</dt>
                <dd>{formatINR(order.total)}</dd>
              </div>
            </dl>
          </div>
          <div className="card p-5">
            <h3 className="font-display text-lg text-ink-900">Shipping to</h3>
            <address className="mt-2 text-sm not-italic text-ink-700">
              {order.shipName}
              <br />
              {order.shipLine1}
              {order.shipLine2 && <>, {order.shipLine2}</>}
              <br />
              {order.shipCity}, {order.shipState} {order.shipPostalCode}
              <br />
              {order.shipPhone}
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}
