# Knitting Stories 🧶

A self-service marketplace for handmade crochet — browse, sell, and manage
products. Customer + Seller portals (Admin deferred).

- **Backend:** Java 21, Spring Boot 3.4 (Maven), Spring Security + JWT, Spring Data JPA, Flyway, PostgreSQL
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Payments:** Razorpay (INR) — falls back to a mock flow locally when no keys are set
- **Deploy target:** Google Cloud Run + serverless PostgreSQL (Neon/Supabase)

See [`PLAN.md`](./PLAN.md) for the full architecture and roadmap.

## Features

**Customer:** browse/search/filter catalog, product detail with variants, ratings
& reviews, cart with quantity management, checkout, order history & tracking,
pre-shipment cancellation, and 30-day returns.

**Seller:** product management with SKUs & variants, order fulfilment (confirm →
ship → deliver), and a sales analytics dashboard.

## Prerequisites

- Java 21 (`JAVA_HOME` pointing at a JDK 21)
- Maven (or use the bundled `./mvnw` wrapper)
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
./mvnw spring-boot:run
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
./mvnw clean test        # run tests
./mvnw clean package     # build the jar

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
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | empty | empty ⇒ **mock payments** |
| `PORT` | `8080` | Cloud Run injects this |

> **Payments:** with no Razorpay keys, checkout uses a mock flow (auto-approved)
> so you can exercise the full order lifecycle locally. Set real keys to enable
> live Razorpay checkout and server-side signature verification.

## Deploy to Cloud Run (low-cost)

1. **Database:** create a free serverless Postgres (Neon or Supabase); copy the
   JDBC URL / user / password.
2. **Secrets:** store `JWT_SECRET`, `DATABASE_*`, and `RAZORPAY_*` in
   **Secret Manager**.
3. **Build & push images** (Artifact Registry):
   ```bash
   gcloud builds submit backend  --tag REGION-docker.pkg.dev/PROJECT/ks/backend
   gcloud builds submit frontend --tag REGION-docker.pkg.dev/PROJECT/ks/frontend
   ```
4. **Deploy backend:**
   ```bash
   gcloud run deploy ks-backend \
     --image REGION-docker.pkg.dev/PROJECT/ks/backend \
     --region REGION --allow-unauthenticated \
     --set-secrets DATABASE_URL=DATABASE_URL:latest,DATABASE_USERNAME=DB_USER:latest,DATABASE_PASSWORD=DB_PASS:latest,JWT_SECRET=JWT_SECRET:latest,RAZORPAY_KEY_ID=RZP_ID:latest,RAZORPAY_KEY_SECRET=RZP_SECRET:latest \
     --set-env-vars CORS_ALLOWED_ORIGINS=https://YOUR_FRONTEND_URL
   ```
5. **Deploy frontend** (point it at the backend URL):
   ```bash
   gcloud run deploy ks-frontend \
     --image REGION-docker.pkg.dev/PROJECT/ks/frontend \
     --region REGION --allow-unauthenticated \
     --set-env-vars BACKEND_URL=https://YOUR_BACKEND_URL
   ```

Both services scale to zero, so idle cost is ~₹0. Product images currently ship
as bundled SVG placeholders; move real uploads to **Google Cloud Storage** when
ready.

## Project layout

```
backend/    Spring Boot API (Maven)
frontend/   React + Vite storefront and seller studio
PLAN.md     Architecture & roadmap
```
