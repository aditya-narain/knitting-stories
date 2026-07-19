export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-ink-700/70">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cream-200 border-t-terracotta-500" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
