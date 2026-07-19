# Knitting Stories — Self-Service Crochet Marketplace: Plan

A multi-vendor e-commerce platform for browsing, selling, and managing handmade
crochet products. Three roles: **Customer**, **Seller**, **Admin**.

---

## 0. Final decisions (as implemented in this repo)

The sections below capture the original exploration. The **actual build** uses the
choices the team confirmed:

| Area | Decision |
|---|---|
| Backend | **Java 21 + Spring Boot 3.4** (Maven), Spring Security + JWT, Spring Data JPA, Flyway |
| Frontend | **React + TypeScript + Vite + Tailwind CSS** |
| Database | **PostgreSQL** (serverless — Neon/Supabase — in prod) |
| Payments | **Razorpay**, currency **INR** (mock mode locally when keys absent) |
| Hosting | **Cloud Run** (both services) + serverless Postgres |
| Scope (MVP) | **Customer + Seller** portals. Admin deferred. |

See [`README.md`](./README.md) for how to run and deploy.

---

## 1. Recommended Tech Stack (optimized for low cost + fast build)

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js (React + TypeScript)** | SSR/SSG for product SEO (matters for a shop), one framework for web app + API routes, huge ecosystem |
| Styling/UI | **Tailwind CSS + shadcn/ui** | Fast, consistent, no design overhead |
| Backend API | **Next.js API routes** (start) → split to a dedicated service only if needed | Fewer moving parts = cheaper + simpler to deploy |
| Database | **PostgreSQL** | Relational data (orders, variants, inventory) fits SQL well; free tiers widely available |
| ORM | **Prisma** | Type-safe, migrations, great DX |
| Auth | **Auth.js (NextAuth)** with email + Google, OR **Firebase Auth** | Role-based (customer/seller/admin) |
| File/Image storage | **Google Cloud Storage** (+ image CDN) | Product photos |
| Search | **Postgres full-text** to start → **Typesense/Algolia** later | Avoid extra cost early |
| Payments | **Stripe** (global) or **Razorpay** (if India-based) | Cart checkout, refunds for returns |
| Email/notifications | **Resend** or **SendGrid** free tier | Order confirmations, seller comms |

> If you prefer a fully managed DB with a generous free tier to avoid Cloud SQL
> cost early on, **Supabase** or **Neon** (serverless Postgres) pair well and can
> later migrate to Cloud SQL.

---

## 2. Core Domain Model (high level)

- **User** (role: customer | seller | admin, status: active | blacklisted)
- **Seller** (shop profile, payout info) → belongs to User
- **Product** (title, description, category, base price, seller_id, status, rating_avg)
- **ProductVariant** (SKU, attributes e.g. color/size/yarn, price, stock)
- **ProductImage**
- **Review** (rating 1–5, comment, user_id, product_id)
- **Cart / CartItem** (variant_id, qty)
- **Order / OrderItem** (status: placed → confirmed → shipped → delivered; cancel/return)
- **Return** (reason, status, within-30-day rule, refund ref)
- **Promotion** (admin-driven product/seller promotion, discounts, featured)
- **Message** (customer ↔ seller thread)

---

## 3. Feature Scope by Role

**Customer:** browse/search with filters, product detail + variants, ratings &
reviews, cart with qty management, checkout, order tracking, cancel (pre-ship),
returns (≤30 days), order history.

**Seller:** product CRUD with SKU + variants + stock, order fulfillment
(confirm/ship), sales analytics dashboard, customer messaging.

**Admin:** seller management + blacklisting, product promotion/featuring,
platform analytics, content moderation (products/reviews).

---

## 4. Suggested Build Phases (ship incrementally)

1. **Foundation** — repo scaffold, Next.js + Prisma + Postgres, auth with roles, base UI/layout.
2. **Catalog** — products, variants, images, categories, browse + search + product detail.
3. **Commerce** — cart, checkout, payments, order creation + tracking.
4. **Post-order** — cancellation, returns (30-day), order history.
5. **Seller portal** — product management, fulfillment, basic sales analytics, messaging.
6. **Admin portal** — seller mgmt/blacklist, promotions, platform analytics, moderation.
7. **Reviews & polish** — ratings/reviews, notifications, SEO, hardening.

---

## 5. Low-Cost GCP Infrastructure

**Guiding principle:** use **serverless that scales to zero** so you pay ~nothing
when idle, and avoid always-on VMs/DBs early.

### Recommended (serverless, cheapest to start)
- **Cloud Run** — host the Next.js app (containerized). Scales to zero; generous
  free tier (2M requests/mo). Pay only for actual usage.
- **Artifact Registry** — store the Docker image (tiny cost).
- **Cloud Build** — CI/CD: build image + deploy to Cloud Run on git push (free tier: 120 build-min/day).
- **Database**:
  - *Cheapest:* **Neon** or **Supabase** free tier (serverless Postgres, scales to zero) — $0 to start.
  - *All-GCP:* **Cloud SQL Postgres** smallest shared-core (`db-f1-micro`) — ~$8–10/mo (always-on; main fixed cost).
- **Cloud Storage (GCS)** — product images; pennies/GB. Serve via Cloud CDN or signed URLs.
- **Secret Manager** — API keys / DB creds (near-free).

**Estimated starting cost:** ~$0–5/mo with Neon/Supabase + Cloud Run at low
traffic; ~$10–20/mo if using Cloud SQL.

### Alternative (single cheap VM — simplest mentally)
- One **e2-micro** VM (in a free-tier-eligible US region: us-west1/us-central1/us-east1)
  running the app + Postgres via Docker Compose, Nginx + Let's Encrypt for TLS.
- Free-tier e2-micro is ~$0 (1 instance) but always-on and you self-manage
  backups/updates. Good for a demo; less scalable than Cloud Run.

**My recommendation:** **Cloud Run + Neon/Supabase Postgres + GCS**. Best
cost/scalability/effort tradeoff, and easy to migrate DB to Cloud SQL later.

### Getting started on GCP (once you pick the stack)
1. Create a GCP project + enable billing (get $300 free credit for 90 days).
2. Enable APIs: Cloud Run, Artifact Registry, Cloud Build, Secret Manager, (Cloud SQL if used).
3. Create a GCS bucket for images + Artifact Registry repo.
4. Provision Postgres (Neon/Supabase or Cloud SQL).
5. Add a `Dockerfile` + Cloud Build trigger on the GitHub repo → auto-deploy to Cloud Run.
6. Point a domain (Cloud Run domain mapping) + managed TLS.

I can automate steps 3–6 with Terraform or gcloud scripts in the repo.

---

## 6. Open Questions (need your input)

1. **Region / audience:** India (→ Razorpay, INR) or global/US (→ Stripe, USD)?
2. **Multi-vendor now, or single seller (just you) first?** Affects seller portal priority.
3. **Payments:** real payment integration in v1, or mock checkout for MVP?
4. **Auth:** email/password + Google sign-in okay? Any social logins required?
5. **GCP infra:** Cloud Run + serverless Postgres (my rec) vs single e2-micro VM vs Cloud SQL?
6. **Tech stack:** happy with Next.js + Postgres + Prisma, or do you prefer another (e.g. Python/FastAPI backend)?
7. **Design:** any brand colors/logo/reference sites, or should I pick a clean default theme?
8. **MVP priority:** which phase do you want first — customer storefront, or seller/admin tooling?
