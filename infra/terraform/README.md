# Terraform

One module (`modules/environment`) applied three times, once per environment
directory. Each environment is a **separate Google Cloud project**, so a mistake
in dev cannot reach prod's database, secrets or logs.

## What it creates

| Resource | Notes |
| --- | --- |
| Project + enabled APIs | Skip creation with `create_project = false` if it already exists |
| Billing budget | $1 by default, alerts at 50% and 100% |
| Artifact Registry | Only in dev — staging and prod read from it so promotion reuses the tested image |
| Secret Manager secrets | `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET` (generated), Razorpay keys when supplied |
| `ks-api` service account | Runtime identity; may read those secrets and nothing else |
| `ks-deployer` service account | CI identity, reachable only through Workload Identity Federation |
| Workload Identity pool | Restricted to `aditya-narain/knitting-stories` by attribute condition |
| Cloud Run service | Created with a placeholder image; CI owns the image afterwards |
| Firebase | Enabled so the frontend can be served at `<project-id>.web.app` |

## Usage

```bash
cd environments/dev
cp terraform.tfvars.example terraform.tfvars   # fill in, it is git-ignored
terraform init
terraform apply
terraform output github_variables              # paste into the GitHub Environment
```

Then staging and prod, both of which additionally need
`artifact_registry_project` set to the dev project ID.

## Things worth knowing

- **State contains secrets.** The generated `JWT_SECRET` and your database
  password are stored in `terraform.tfstate`. It is git-ignored, but once the
  setup is real, uncomment the GCS backend block in the environment's `main.tf`
  and migrate.
- **Images are not managed here.** `terraform apply` deliberately ignores the
  Cloud Run image so it never rolls a deploy back to the placeholder.
- **Prod is protected.** The prod project has `deletion_policy = "PREVENT"` and
  the Cloud Run service has deletion protection enabled, so `terraform destroy`
  will refuse rather than take the site down.
- **Budgets need permission** on the billing account (Billing Account Costs
  Manager). Set `enable_budget = false` if you would rather add them by hand.
