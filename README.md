# Knitting Stories 🧶

A self-service marketplace for handmade crochet — browse, sell, and manage
products. Customer + Seller portals (Admin deferred).

- **Backend:** Java 21, Spring Boot 3.4 (Maven), Spring Security + JWT, Spring Data JPA, Flyway, PostgreSQL
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Payments:** Razorpay (INR) — falls back to a mock flow locally when no keys are set
- **Deploy target:** Google Cloud Run + Firebase Hosting + serverless PostgreSQL (Neon)

See [`PLAN.md`](./PLAN.md) for the full architecture and roadmap.

## Features

**Customer:** browse/search/filter catalog, product detail with variants, ratings
& reviews, cart with quantity management, checkout, order history & tracking,
pre-shipment cancellation, and 30-day returns.

**Seller:** product management with SKUs & variants, order fulfilment (confirm →
ship → deliver), and a sales analytics dashboard.

## Prerequisites

- Java 21 (`JAVA_HOME` pointing at a JDK 21)
- Maven 3.9+
- Node.js **≥ 20.19** (Node 22 recommended — see `frontend/.nvmrc`)
- Docker (for local PostgreSQL, or use the full `docker-compose`)

## Quick start (local dev)

### 1. Database

```bash
docker run -d --name ks-postgres \
  -e POSTGRES_DB=knitting_stories \
  -e POSTGRES_USER=knitting \
  -e POSTGRES_PASSWORD=knitting \
  -p 5432:5432 postgres:16
```

Flyway creates the schema on first backend start, and a seeder loads demo
categories, products, a seller, and a customer.

### 2. Backend (port 8080)

```bash
cd backend
mvn spring-boot:run
```

Health check: `http://localhost:8080/actuator/health` · API docs (Swagger UI):
`http://localhost:8080/swagger-ui.html`

### 3. Frontend (port 5173)

```bash
cd frontend
nvm use          # picks Node 22 from .nvmrc
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to the backend.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | `customer@knittingstories.test` | `Password123` |
| Seller | `seller@knittingstories.test` | `Password123` |

## Run everything with Docker Compose

```bash
docker compose up --build
```

- Frontend: `http://localhost:8081`
- Backend: `http://localhost:8080`
- Postgres: `localhost:5432`

## Useful commands

```bash
# Backend
cd backend
mvn clean test        # run tests
mvn clean package     # build the jar

# Frontend
cd frontend
npm run build            # type-check + production build
npm run lint             # oxlint
```

## Configuration (environment variables)

Backend (see `backend/.env.example`):

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/knitting_stories` | |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | `knitting` / `knitting` | |
| `JWT_SECRET` | dev fallback | **Set a long random value in production** |
| `JWT_EXPIRATION_MS` | `86400000` | 24h |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | comma-separated |
| `SEED_DEMO_DATA` | `true` | demo catalog + demo accounts; forced off when deployed |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | empty | empty ⇒ **mock payments** |
| `PORT` | `8080` | Cloud Run injects this |

> **Payments:** with no Razorpay keys, checkout uses a mock flow (auto-approved)
> so you can exercise the full order lifecycle locally. Set real keys to enable
> live Razorpay checkout and server-side signature verification.

## Deploy

Three environments (dev, staging, prod), each its own Google Cloud project, all
inside free tiers and with no domain required: Cloud Run in Mumbai for the API,
Firebase Hosting for the frontend, Neon for Postgres. Infrastructure is
Terraform and deploys are GitHub Actions with no service-account keys.

See **[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)** for the runbook and
[`infra/terraform/`](./infra/terraform) for the code.

Everything scales to zero, so idle cost is ~₹0. Product images currently ship
as bundled SVG placeholders; move real uploads to **Google Cloud Storage** when
ready.

## Project layout

```
backend/    Spring Boot API (Maven)
frontend/   React + Vite storefront and seller studio
infra/      Terraform for the dev / staging / prod projects
docs/       Deployment runbook
PLAN.md     Architecture & roadmap
```
