import { statusLabel } from "../lib/format";

const STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-700",
  PLACED: "bg-sage-100 text-sage-600",
  CONFIRMED: "bg-sage-100 text-sage-600",
  SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURN_REQUESTED: "bg-orange-100 text-orange-700",
  RETURNED: "bg-plum-500/10 text-plum-600",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${STYLES[status] ?? "bg-cream-200 text-ink-700"}`}
    >
      {statusLabel(status)}
    </span>
  );
}
