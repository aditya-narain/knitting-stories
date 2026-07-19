import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(email, password);
      navigate(from ?? (user.role === "SELLER" ? "/seller" : "/"), { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid email or password"));
    } finally {
      setBusy(false);
    }
  }

  function demo(role: "customer" | "seller") {
    setEmail(`${role}@knittingstories.test`);
    setPassword("Password123");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-center font-display text-4xl text-ink-900">Welcome back</h1>
      <p className="mt-2 text-center text-ink-700/80">Sign in to your Knitting Stories account.</p>

      <form onSubmit={submit} className="card mt-8 p-7">
        <div className="mb-4">
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-4 rounded-xl border border-dashed border-cream-200 p-4 text-center text-sm text-ink-700/80">
        <p className="mb-2 font-medium">Try a demo account</p>
        <div className="flex justify-center gap-2">
          <button className="btn-ghost text-xs" onClick={() => demo("customer")}>
            Customer demo
          </button>
          <button className="btn-ghost text-xs" onClick={() => demo("seller")}>
            Seller demo
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-ink-700">
        New here?{" "}
        <Link to="/register" className="font-medium text-terracotta-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
