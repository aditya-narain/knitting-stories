export default function Footer() {
  return (
    <footer className="mt-20 border-t border-cream-200 bg-cream-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <span className="font-display text-lg text-ink-900">Knitting Stories</span>
          </div>
          <p className="mt-3 max-w-xs font-serif text-lg text-ink-700/80">
            Lovingly handmade crochet, one stitch at a time.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sage-600">Shop</h4>
          <ul className="space-y-2 text-sm text-ink-700">
            <li>Blankets &amp; Throws</li>
            <li>Amigurumi &amp; Toys</li>
            <li>Accessories</li>
            <li>Bags</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sage-600">Care</h4>
          <ul className="space-y-2 text-sm text-ink-700">
            <li>30-day returns</li>
            <li>Secure payments</li>
            <li>Made to order</li>
            <li>support@knittingstories.example</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-200 py-4 text-center text-xs text-ink-700/60">
        © {new Date().getFullYear()} Knitting Stories. Crafted with care.
      </div>
    </footer>
  );
}
