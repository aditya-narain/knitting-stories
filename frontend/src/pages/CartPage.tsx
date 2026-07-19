import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatINR } from "../lib/format";
import Spinner from "../components/Spinner";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 49;

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();

  if (loading && !cart) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-ink-900">Your cart is empty</h1>
        <p className="mt-3 text-ink-700/80">Let's find something handmade you'll love.</p>
        <Link to="/products" className="btn-primary mt-6">
          Browse the collection
        </Link>
      </div>
    );
  }

  const shipping = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = cart.subtotal + shipping;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl text-ink-900">Your Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div key={item.id} className="card flex gap-4 p-4">
              <img
                src={item.imageUrl || "/products/marketbag-1.svg"}
                alt={item.productTitle}
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link to={`/products/${item.productId}`} className="font-display text-lg text-ink-900 hover:text-terracotta-600">
                      {item.productTitle}
                    </Link>
                    <p className="text-sm text-ink-700/70">{item.variantName}</p>
                  </div>
                  <button
                    className="text-sm text-ink-700/60 hover:text-red-600"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-cream-200">
                    <button
                      className="px-3 py-1 text-ink-700"
                      onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      className="px-3 py-1 text-ink-700 disabled:opacity-40"
                      disabled={item.quantity >= item.availableStock}
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="font-medium text-ink-900">{formatINR(item.lineTotal)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="font-display text-xl text-ink-900">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={formatINR(cart.subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : formatINR(shipping)} />
              {shipping > 0 && (
                <p className="text-xs text-sage-600">
                  Add {formatINR(FREE_SHIPPING_THRESHOLD - cart.subtotal)} more for free shipping.
                </p>
              )}
            </dl>
            <div className="mt-4 flex justify-between border-t border-cream-200 pt-4">
              <span className="font-display text-lg text-ink-900">Total</span>
              <span className="font-display text-lg text-terracotta-600">{formatINR(total)}</span>
            </div>
            <Link to="/checkout" className="btn-primary mt-6 w-full">
              Proceed to checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-700">
      <dt>{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}
