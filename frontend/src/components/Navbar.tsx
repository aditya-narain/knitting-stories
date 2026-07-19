import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const isSeller = user?.role === "SELLER";

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-9 w-9" />
          <div className="leading-tight">
            <span className="block font-display text-xl text-ink-900">Knitting Stories</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-sage-600">
              Handmade Crochet
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/products">Shop</NavItem>
          {isSeller && <NavItem to="/seller">Seller Studio</NavItem>}
        </nav>

        <div className="flex items-center gap-2">
          {!isSeller && (
            <Link to="/cart" className="relative rounded-full p-2 hover:bg-cream-200" aria-label="Cart">
              <BagIcon />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta-500 px-1 text-[11px] font-semibold text-cream-50">
                  {count}
                </span>
              )}
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {!isSeller && (
                <Link to="/orders" className="hidden text-sm text-ink-700 hover:text-terracotta-600 sm:block">
                  My Orders
                </Link>
              )}
              <div className="hidden text-right sm:block">
                <span className="block text-xs text-ink-700/60">Hi,</span>
                <span className="block text-sm font-medium text-ink-800">
                  {user?.fullName.split(" ")[0]}
                </span>
              </div>
              <button
                className="btn-ghost text-sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `text-sm font-medium transition-colors ${
          isActive ? "text-terracotta-600" : "text-ink-700 hover:text-terracotta-600"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 7h12l-1 13H7L6 7z" strokeLinejoin="round" />
      <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
    </svg>
  );
}
