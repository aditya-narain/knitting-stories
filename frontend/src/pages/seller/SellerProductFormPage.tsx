import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { apiErrorMessage } from "../../lib/api";
import type { Category, ProductDetail } from "../../types";
import Spinner from "../../components/Spinner";
import SellerNav from "../../components/SellerNav";

interface VariantForm {
  sku: string;
  name: string;
  color: string;
  size: string;
  price: string;
  stock: string;
}

const emptyVariant: VariantForm = { sku: "", name: "", color: "", size: "", price: "", stock: "0" };

export default function SellerProductFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [imageUrls, setImageUrls] = useState<string>("");
  const [variants, setVariants] = useState<VariantForm[]>([{ ...emptyVariant }]);

  useEffect(() => {
    api.get<Category[]>("/categories").then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    if (!id) return;
    api
      .get<ProductDetail>(`/seller/products/${id}`)
      .then((r) => {
        const p = r.data;
        setTitle(p.title);
        setDescription(p.description ?? "");
        setBasePrice(String(p.basePrice));
        setCategoryId(p.categoryId ?? "");
        setStatus(p.status);
        setImageUrls(p.imageUrls.join("\n"));
        setVariants(
          p.variants.length
            ? p.variants.map((v) => ({
                sku: v.sku,
                name: v.name,
                color: v.color ?? "",
                size: v.size ?? "",
                price: String(v.price),
                stock: String(v.stock),
              }))
            : [{ ...emptyVariant }],
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  function setVariant(i: number, key: keyof VariantForm, value: string) {
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      title,
      description,
      basePrice: Number(basePrice),
      categoryId: categoryId || null,
      status,
      imageUrls: imageUrls
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      variants: variants.map((v) => ({
        sku: v.sku,
        name: v.name,
        color: v.color || null,
        size: v.size || null,
        price: Number(v.price),
        stock: Number(v.stock),
      })),
    };
    try {
      if (editing) {
        await api.put(`/seller/products/${id}`, payload);
      } else {
        await api.post("/seller/products", payload);
      }
      navigate("/seller/products");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="center-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="page-slim">
      <SellerNav />
      <h2 className="title-sub">{editing ? "Edit product" : "New product"}</h2>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <div className="panel-lg space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Base price (₹)</label>
              <input className="input" type="number" min="0" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Uncategorised</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Image URLs (one per line)</label>
            <textarea
              className="input min-h-[70px]"
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              placeholder="/products/tote-1.svg"
            />
          </div>
        </div>

        <div className="panel-lg">
          <div className="flex items-center justify-between">
            <h3 className="title-card">Variants</h3>
            <button type="button" className="btn-ghost text-sm" onClick={() => setVariants((v) => [...v, { ...emptyVariant }])}>
              + Add variant
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {variants.map((v, i) => (
              <div key={i} className="rounded-xl border border-cream-200 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="input" placeholder="SKU" value={v.sku} onChange={(e) => setVariant(i, "sku", e.target.value)} required />
                  <input className="input" placeholder="Variant name" value={v.name} onChange={(e) => setVariant(i, "name", e.target.value)} required />
                  <input className="input" placeholder="Color" value={v.color} onChange={(e) => setVariant(i, "color", e.target.value)} />
                  <input className="input" placeholder="Size" value={v.size} onChange={(e) => setVariant(i, "size", e.target.value)} />
                  <input className="input" type="number" min="0" placeholder="Price" value={v.price} onChange={(e) => setVariant(i, "price", e.target.value)} required />
                  <input className="input" type="number" min="0" placeholder="Stock" value={v.stock} onChange={(e) => setVariant(i, "stock", e.target.value)} required />
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    className="mt-2 text-sm text-ink-700/60 hover:text-red-600"
                    onClick={() => setVariants((vs) => vs.filter((_, idx) => idx !== i))}
                  >
                    Remove variant
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="alert-error">{error}</p>}

        <div className="flex gap-3">
          <button className="btn-primary" disabled={busy}>
            {busy ? "Saving…" : editing ? "Save changes" : "Create product"}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate("/seller/products")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
