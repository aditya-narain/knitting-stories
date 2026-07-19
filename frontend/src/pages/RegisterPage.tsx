import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";
import { apiErrorMessage } from "../lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", shopName: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role,
        shopName: role === "SELLER" ? form.shopName : undefined,
      });
      navigate(user.role === "SELLER" ? "/seller" : "/", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-auth">
      <h1 className="title-page text-center">Join Knitting Stories</h1>
      <p className="mt-2 text-center text-ink-700/80">Shop handmade, or sell your own creations.</p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-cream-200 p-1">
        <button
          className={`rounded-full py-2 text-sm font-medium transition-colors ${
            role === "CUSTOMER" ? "bg-white text-terracotta-600 shadow-sm" : "text-ink-700"
          }`}
          onClick={() => setRole("CUSTOMER")}
        >
          I'm a shopper
        </button>
        <button
          className={`rounded-full py-2 text-sm font-medium transition-colors ${
            role === "SELLER" ? "bg-white text-terracotta-600 shadow-sm" : "text-ink-700"
          }`}
          onClick={() => setRole("SELLER")}
        >
          I'm a maker
        </button>
      </div>

      <form onSubmit={submit} className="card mt-4 p-7">
        <div className="mb-4">
          <label className="label">Full name</label>
          <input className="input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
        </div>
        {role === "SELLER" && (
          <div className="mb-4">
            <label className="label">Shop name</label>
            <input className="input" value={form.shopName} onChange={(e) => set("shopName", e.target.value)} required />
          </div>
        )}
        <div className="mb-4">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-ink-700/60">At least 8 characters.</p>
        </div>
        {error && <p className="mb-4 alert-error">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-700">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-terracotta-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
