terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
    }
  }

  # State holds the generated JWT secret and the database password, so once the
  # project is real, move it off your laptop:
  #
  # backend "gcs" {
  #   bucket = "ks-tfstate-<suffix>"
  #   prefix = "dev"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

module "environment" {
  source = "../../modules/environment"

  environment       = "dev"
  project_id        = var.project_id
  billing_account   = var.billing_account
  region            = var.region
  github_repository = var.github_repository

  database_url      = var.database_url
  database_username = var.database_username
  database_password = var.database_password

  razorpay_key_id     = var.razorpay_key_id
  razorpay_key_secret = var.razorpay_key_secret

  budget_amount = var.budget_amount

  # dev owns the shared registry; staging and prod promote images out of it.
  artifact_registry_project = null

  providers = {
    google      = google
    google-beta = google-beta
  }
}

output "github_variables" {
  description = "Copy into GitHub → Settings → Environments → dev → variables."
  value       = module.environment.github_variables
}

output "api_url" {
  value = module.environment.api_url
}

output "hosting_url" {
  value = module.environment.hosting_url
}
