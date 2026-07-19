import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/seller", label: "Dashboard", end: true },
  { to: "/seller/products", label: "Products", end: false },
  { to: "/seller/orders", label: "Orders", end: false },
];

export default function SellerNav() {
  const { user } = useAuth();
  return (
    <div className="mb-8 border-b border-cream-200">
      <div className="flex flex-col gap-1 pb-4">
        <span className="eyebrow tracking-[0.2em]">Seller Studio</span>
        <h1 className="title-section">{user?.shopName || "Your Shop"}</h1>
      </div>
      <nav className="flex gap-1">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `tab ${
                isActive
                  ? "border-terracotta-500 text-terracotta-600"
                  : "border-transparent text-ink-700 hover:text-terracotta-600"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
