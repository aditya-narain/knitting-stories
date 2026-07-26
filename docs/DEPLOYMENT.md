# Deployment

Three environments, each a separate Google Cloud project, all inside free tiers.
No domain purchase is required to start.

| Environment | Frontend | API | Database |
| --- | --- | --- | --- |
| dev | `https://<dev-project>.web.app` | Cloud Run `ks-api` | Neon project `ks-dev` |
| staging | `https://<staging-project>.web.app` | Cloud Run `ks-api` | Neon project `ks-staging` |
| prod | `https://<prod-project>.web.app` | Cloud Run `ks-api` | Neon project `ks-prod` |

Merging to `main` deploys dev. Promotion to staging and then prod redeploys the
**same container image**, so what you tested in UAT is what ships.

## Why this shape

- **Cloud Run** in `asia-south1` (Mumbai) — customers are in India, and the
  service scales to zero so an idle environment is free.
- **Firebase Hosting** — free global CDN, free TLS, and a free `*.web.app`
  hostname per project, which is also a real HTTPS origin that Google and
  Facebook OAuth accept.
- **Neon** rather than Cloud SQL — Cloud SQL has no free tier and would cost
  roughly $10-15/month *per environment*. Neon's free plan gives each
  environment its own project with TLS enforced and scale-to-zero. Closest free
  region is AWS Singapore, about 50 ms from India.
- **Workload Identity Federation** — GitHub Actions authenticates without any
  service-account JSON key, so there is no long-lived credential to leak.

Cloud Run requires a billing account even while you stay inside the free tier,
so Terraform creates a $1 budget alert per project before anything else.

## One-time setup

### 1. Databases

Create three Neon projects — `ks-dev`, `ks-staging`, `ks-prod` — in AWS
**Asia Pacific (Singapore)**, each with a database named `knitting_stories`.
Three projects rather than three branches of one, because the free quota
(0.5 GB storage, 100 compute-hours) is per project.

Copy the **pooled** connection string, the host containing `-pooler`. Cloud Run
starts many instances and each opens its own pool, so the pooler matters.
Convert it for Spring:

```
Neon:  postgresql://user:PASS@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/knitting_stories?sslmode=require
JDBC:  jdbc:postgresql://ep-xxx-pooler.ap-southeast-1.aws.neon.tech/knitting_stories?sslmode=require
```

Create a separate role per environment rather than reusing the owner role, and
never point a non-prod environment at the prod database.

### 2. Infrastructure

```bash
brew install --cask google-cloud-sdk terraform
gcloud auth application-default login
gcloud billing accounts list        # note the account ID

cd infra/terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars   # fill in; git-ignored
terraform init && terraform apply
terraform output github_variables
```

Repeat for `staging` and `prod`, which also need `artifact_registry_project` set
to the dev project ID. Details and caveats: [`infra/terraform/README.md`](../infra/terraform/README.md).

### 3. GitHub

Create three Environments under **Settings → Environments**: `dev`, `staging`,
`production`. In each, add the variables printed by `terraform output
github_variables`:

| Variable | Example |
| --- | --- |
| `GCP_PROJECT_ID` | `ks-dev-a1b2` |
| `GCP_REGION` | `asia-south1` |
| `WIF_PROVIDER` | `projects/123.../workloadIdentityPools/github/providers/github` |
| `DEPLOYER_SA` | `ks-deployer@ks-dev-a1b2.iam.gserviceaccount.com` |
| `API_SERVICE` | `ks-api` |
| `ARTIFACT_REPO` | `asia-south1-docker.pkg.dev/ks-dev-a1b2/ks` |

`ARTIFACT_REPO` points at the **dev** project in all three environments — that
is what makes promotion reuse the tested image.

On the `production` environment add yourself under **Required reviewers**, so a
prod deploy is always a deliberate approval. Protect `main` with the CI check
while you are there.

## Day-to-day

```
merge to main  →  Deploy dev (build + push + deploy + smoke test)
                     ↓ test on the dev URL
Actions → Promote → commit SHA + staging   →  UAT on the staging URL
                     ↓
Actions → Promote → commit SHA + production →  approve  →  live
```

The commit SHA is the image tag. `Promote` refuses to run if that image is not
already in the registry, so you cannot promote something dev never built.

The frontend is rebuilt per environment because `VITE_API_BASE_URL` is baked in
at build time, but it is rebuilt from the same commit the promoted image came
from.

## Workflows

| File | Trigger | Does |
| --- | --- | --- |
| `ci.yml` | PR, push to `main` | `mvn verify`, `npm run lint`, `npm run build`, `terraform fmt`/`validate` |
| `deploy-dev.yml` | push to `main` | Builds the image and deploys dev |
| `promote.yml` | manual | Deploys an existing image to staging or production |
| `deploy.yml` | called by the two above | The single shared deploy path |

## Configuration

Terraform owns the Cloud Run environment variables and secret bindings; CI only
changes the image. To change a runtime setting, edit the module and re-apply
rather than clicking in the console, otherwise the next apply reverts it.

Deployed environments run with `SPRING_PROFILES_ACTIVE=cloud`
(`backend/src/main/resources/application-cloud.yml`), which sizes the Hikari pool
for Neon's pooler and disables the demo seeder — the demo accounts have a
published password and must never exist in a deployed environment.

Secrets live in Secret Manager: `DATABASE_URL`, `DATABASE_USERNAME`,
`DATABASE_PASSWORD`, `JWT_SECRET`, and the Razorpay keys when set. Rotate with:

```bash
gcloud secrets versions add JWT_SECRET --data-file=- --project <project>
gcloud run services update ks-api --project <project> --region asia-south1
```

Rotating `JWT_SECRET` invalidates every issued token, which is exactly what you
want if it leaks.

## Google and Facebook SSO

Each environment has a real HTTPS origin, which is all the providers require.
Use **one OAuth client per environment** and never share prod credentials with
dev.

- **Google**: authorized JavaScript origin `https://<project>.web.app`, plus
  `http://localhost:5173` on the dev client only. Keep scopes to `openid`,
  `email`, `profile` so no verification review is needed. Publish the prod
  client; leave dev and staging in Testing with your address as a test user.
- **Facebook**: two apps, one for dev + staging and one for prod, since a single
  app cannot cleanly separate environments. Add the `web.app` hostnames under
  allowed domains for the JavaScript SDK. Advanced Access for `email` needs App
  Review plus Business Verification — start it early, it takes 1-2 weeks, and it
  is only needed for the prod app.

Client IDs are public and go into the frontend build; the Facebook app secret
goes into Secret Manager alongside the others.

## When you outgrow the free tier

1. **Domain** (~$10-14/year): add `knittingstories.com`, `staging.` and `dev.`
   as custom domains in Firebase Hosting — free TLS, one DNS record each.
2. **API on your own domain** (`api.knittingstories.com`) needs a global external
   Application Load Balancer, about $18-25/month; Cloud Run's own domain mapping
   is still Preview and is not offered in Mumbai. Until then the `run.app` URL
   is fine.
3. **`min_instances = 1`** on prod removes the 10-20 second cold start for about
   $8-10/month.
4. **Database**: either move prod to Cloud SQL in Mumbai (~$10-25/month, private
   IP, PITR) if you want data physically in India, or stay on Neon and add a
   nightly `pg_dump` to Cloud Storage.
5. **Razorpay live keys** need a registered Indian business entity and KYC —
   worth starting early, since it gates real payments regardless of hosting.
