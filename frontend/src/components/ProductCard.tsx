import { Link } from "react-router-dom";
import type { ProductSummary } from "../types";
import { formatINR } from "../lib/format";
import StarRating from "./StarRating";

export default function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group card overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-200">
        <img
          src={product.primaryImageUrl || "/products/marketbag-1.svg"}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-plum-500 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-cream-50">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        {product.sellerShopName && (
          <p className="mb-1 eyebrow">{product.sellerShopName}</p>
        )}
        <h3 className="title-card leading-snug line-clamp-2">{product.title}</h3>
        <div className="mt-2">
          <StarRating value={product.ratingAvg} count={product.ratingCount} size={14} />
        </div>
        <p className="mt-3 price">{formatINR(product.basePrice)}</p>
      </div>
    </Link>
  );
}
