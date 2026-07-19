import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api";
import type { CheckoutResponse, Order } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatINR } from "../lib/format";

interface RazorpayWindow extends Window {
  Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
}

export default function CheckoutPage() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    shipName: user?.fullName ?? "",
    shipPhone: "",
    shipLine1: "",
    shipLine2: "",
    shipCity: "",
    shipState: "",
    shipPostalCode: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function verifyAndFinish(orderId: string, body: Record<string, string>) {
    const res = await api.post<Order>(`/orders/${orderId}/payment/verify`, body);
    await refresh();
    navigate(`/orders/${res.data.id}`, { state: { justPlaced: true } });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post<CheckoutResponse>("/orders/checkout", form);
      if (data.mockPayment || !data.razorpayKeyId) {
        // Local / demo mode — payment is auto-approved by the backend.
        await verifyAndFinish(data.order.id, {
          razorpayOrderId: data.razorpayOrderId,
          razorpayPaymentId: `mock_pay_${Date.now()}`,
          razorpaySignature: "mock_signature",
        });
        return;
      }
      // Real Razorpay checkout
      const w = window as RazorpayWindow;
      if (!w.Razorpay) {
        setError("Payment library not loaded. Please try again.");
        setBusy(false);
        return;
      }
      const rzp = new w.Razorpay({
        key: data.razorpayKeyId,
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        name: "Knitting Stories",
        order_id: data.razorpayOrderId,
        handler: (resp: Record<string, string>) => {
          void verifyAndFinish(data.order.id, {
            razorpayOrderId: resp.razorpay_order_id,
            razorpayPaymentId: resp.razorpay_payment_id,
            razorpaySignature: resp.razorpay_signature,
          });
        },
        prefill: { name: form.shipName, contact: form.shipPhone },
        theme: { color: "#B5654D" },
      });
      rzp.open();
      setBusy(false);
    } catch (err) {
      setError(apiErrorMessage(err));
      setBusy(false);
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink-900">Your cart is empty</h1>
      </div>
    );
  }

  const shipping = cart.subtotal >= 999 ? 0 : 49;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl text-ink-900">Checkout</h1>
      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display text-xl text-ink-900">Shipping details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={form.shipName} onChange={(v) => set("shipName", v)} required />
            <Field label="Phone" value={form.shipPhone} onChange={(v) => set("shipPhone", v)} required />
            <div className="sm:col-span-2">
              <Field label="Address line 1" value={form.shipLine1} onChange={(v) => set("shipLine1", v)} required />
            </div>
            <div className="sm:col-span-2">
              <Field label="Address line 2 (optional)" value={form.shipLine2} onChange={(v) => set("shipLine2", v)} />
            </div>
            <Field label="City" value={form.shipCity} onChange={(v) => set("shipCity", v)} required />
            <Field label="State" value={form.shipState} onChange={(v) => set("shipState", v)} required />
            <Field label="PIN code" value={form.shipPostalCode} onChange={(v) => set("shipPostalCode", v)} required />
          </div>
          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="font-display text-xl text-ink-900">Summary</h2>
            <div className="mt-4 space-y-2 text-sm text-ink-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-ink-900">{formatINR(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-ink-900">{shipping === 0 ? "Free" : formatINR(shipping)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-cream-200 pt-4">
              <span className="font-display text-lg text-ink-900">Total</span>
              <span className="font-display text-lg text-terracotta-600">
                {formatINR(cart.subtotal + shipping)}
              </span>
            </div>
            <button className="btn-primary mt-6 w-full" disabled={busy}>
              {busy ? "Placing order…" : "Pay & place order"}
            </button>
            <p className="mt-3 text-center text-xs text-ink-700/60">Secured by Razorpay</p>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}
