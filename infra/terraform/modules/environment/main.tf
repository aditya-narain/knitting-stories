locals {
  # Cloud Run needs an image at creation time, but images are published by CI.
  # The service is created with Google's sample container and every later
  # deploy swaps the image; `ignore_changes` below stops Terraform reverting it.
  placeholder_image = "us-docker.pkg.dev/cloudrun/container/hello"

  hosting_origins = "https://${var.project_id}.web.app,https://${var.project_id}.firebaseapp.com"
  cors_origins    = var.cors_allowed_origins != "" ? var.cors_allowed_origins : local.hosting_origins

  create_registry  = var.artifact_registry_project == null
  registry_project = local.create_registry ? var.project_id : var.artifact_registry_project

  # Cloud Run pulls images as this agent, so it needs read access when the
  # registry lives in another project.
  run_service_agent = "serviceAccount:service-${data.google_project.this.number}@serverless-robot-prod.iam.gserviceaccount.com"

  services = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com",
    "billingbudgets.googleapis.com",
    "firebase.googleapis.com",
    "firebasehosting.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
  ]

  # Secrets whose value is supplied by the operator. Razorpay keys are omitted
  # when empty so the API keeps using the built-in mock payment flow.
  optional_secrets = merge(
    var.razorpay_key_id != "" ? { RAZORPAY_KEY_ID = var.razorpay_key_id } : {},
    var.razorpay_key_secret != "" ? { RAZORPAY_KEY_SECRET = var.razorpay_key_secret } : {},
  )

  managed_secrets = merge({
    DATABASE_URL      = var.database_url
    DATABASE_USERNAME = var.database_username
    DATABASE_PASSWORD = var.database_password
    JWT_SECRET        = random_id.jwt_secret.b64_std
  }, local.optional_secrets)

  labels = {
    app         = "knitting-stories"
    environment = var.environment
    managed-by  = "terraform"
  }
}

# --- Project ---------------------------------------------------------------

resource "google_project" "this" {
  count = var.create_project ? 1 : 0

  name            = "Knitting Stories ${var.environment}"
  project_id      = var.project_id
  billing_account = var.billing_account
  labels          = local.labels
  deletion_policy = var.environment == "prod" ? "PREVENT" : "DELETE"
}

data "google_project" "this" {
  project_id = var.project_id

  depends_on = [google_project.this]
}

resource "google_project_service" "this" {
  for_each = toset(local.services)

  project = data.google_project.this.project_id
  service = each.value

  # Keep APIs enabled on destroy: disabling them can break sibling resources
  # that are still shutting down.
  disable_on_destroy = false
}

resource "google_firebase_project" "this" {
  count    = var.enable_firebase ? 1 : 0
  provider = google-beta

  project = data.google_project.this.project_id

  depends_on = [google_project_service.this]
}

# --- Cost guardrail --------------------------------------------------------

resource "google_billing_budget" "this" {
  count = var.enable_budget ? 1 : 0

  billing_account = var.billing_account
  display_name    = "knitting-stories-${var.environment}"

  budget_filter {
    projects = ["projects/${data.google_project.this.number}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = tostring(var.budget_amount)
    }
  }

  threshold_rules {
    threshold_percent = 0.5
  }

  threshold_rules {
    threshold_percent = 1.0
  }

  depends_on = [google_project_service.this]
}

# --- Container images ------------------------------------------------------

resource "google_artifact_registry_repository" "this" {
  count = local.create_registry ? 1 : 0

  project       = data.google_project.this.project_id
  location      = var.region
  repository_id = var.artifact_registry_name
  format        = "DOCKER"
  description   = "Knitting Stories container images"
  labels        = local.labels

  # Free tier includes 0.5 GB of storage, and a Java image is a few hundred MB,
  # so old revisions are pruned aggressively.
  cleanup_policies {
    id     = "keep-recent"
    action = "KEEP"

    most_recent_versions {
      keep_count = 10
    }
  }

  cleanup_policies {
    id     = "delete-stale"
    action = "DELETE"

    condition {
      older_than = "2592000s" # 30 days
    }
  }

  depends_on = [google_project_service.this]
}

# Staging and prod deploy the image that was built and tested for dev, so they
# read from the dev project's registry rather than rebuilding.
resource "google_artifact_registry_repository_iam_member" "run_agent_reader" {
  for_each = local.create_registry ? {} : {
    run      = local.run_service_agent
    deployer = "serviceAccount:${google_service_account.deployer.email}"
  }

  project    = var.artifact_registry_project
  location   = var.region
  repository = var.artifact_registry_name
  role       = "roles/artifactregistry.reader"
  member     = each.value
}

# --- Secrets ---------------------------------------------------------------

resource "random_id" "jwt_secret" {
  # JwtService base64-decodes this value, and HS256 needs 256 bits of key.
  byte_length = 32
}

resource "google_secret_manager_secret" "this" {
  for_each = local.managed_secrets

  project   = data.google_project.this.project_id
  secret_id = each.key
  labels    = local.labels

  replication {
    auto {}
  }

  depends_on = [google_project_service.this]
}

resource "google_secret_manager_secret_version" "this" {
  for_each = local.managed_secrets

  secret      = google_secret_manager_secret.this[each.key].id
  secret_data = each.value
}

# --- Identities ------------------------------------------------------------

resource "google_service_account" "api" {
  project      = data.google_project.this.project_id
  account_id   = "ks-api"
  display_name = "Knitting Stories API runtime"

  depends_on = [google_project_service.this]
}

resource "google_secret_manager_secret_iam_member" "api_access" {
  for_each = local.managed_secrets

  project   = data.google_project.this.project_id
  secret_id = google_secret_manager_secret.this[each.key].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.api.email}"
}

resource "google_service_account" "deployer" {
  project      = data.google_project.this.project_id
  account_id   = "ks-deployer"
  display_name = "Knitting Stories GitHub Actions deployer"

  depends_on = [google_project_service.this]
}

resource "google_project_iam_member" "deployer" {
  for_each = toset([
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/firebasehosting.admin",
    "roles/iam.serviceAccountUser",
  ])

  project = data.google_project.this.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.deployer.email}"
}

# --- Keyless CI authentication --------------------------------------------

resource "google_iam_workload_identity_pool" "github" {
  project                   = data.google_project.this.project_id
  workload_identity_pool_id = "github"
  display_name              = "GitHub Actions"

  depends_on = [google_project_service.this]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = data.google_project.this.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub Actions OIDC"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
  }

  # Without this condition any GitHub repository could exchange a token for
  # these credentials.
  attribute_condition = "assertion.repository == \"${var.github_repository}\""

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "deployer_wif" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repository}"
}

# --- API service -----------------------------------------------------------

resource "google_cloud_run_v2_service" "api" {
  project             = data.google_project.this.project_id
  name                = var.service_name
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_ALL"
  labels              = local.labels
  deletion_protection = var.environment == "prod"

  template {
    service_account = google_service_account.api.email

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = local.placeholder_image

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
        cpu_idle          = var.min_instances == 0
        startup_cpu_boost = true
      }

      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "cloud"
      }

      env {
        name  = "CORS_ALLOWED_ORIGINS"
        value = local.cors_origins
      }

      dynamic "env" {
        for_each = local.managed_secrets

        content {
          name = env.key

          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.this[env.key].secret_id
              version = "latest"
            }
          }
        }
      }

      # Spring Boot on a cold start takes a while; without a generous startup
      # probe Cloud Run kills the revision before Flyway finishes.
      startup_probe {
        http_get {
          path = "/actuator/health"
        }
        initial_delay_seconds = 10
        period_seconds        = 5
        timeout_seconds       = 3
        failure_threshold     = 30
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }

  depends_on = [
    google_project_service.this,
    google_secret_manager_secret_iam_member.api_access,
  ]
}

# Public API guarded by the application's own JWT filter.
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = data.google_project.this.project_id
  location = google_cloud_run_v2_service.api.location
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
