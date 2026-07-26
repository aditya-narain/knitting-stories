output "project_id" {
  description = "Project ID for this environment."
  value       = data.google_project.this.project_id
}

output "project_number" {
  description = "Project number, used when constructing IAM principals."
  value       = data.google_project.this.number
}

output "api_url" {
  description = "Cloud Run URL of the API. Set VITE_API_BASE_URL to this value with /api appended."
  value       = google_cloud_run_v2_service.api.uri
}

output "api_service_name" {
  description = "Cloud Run service name, for gcloud run deploy."
  value       = google_cloud_run_v2_service.api.name
}

output "hosting_url" {
  description = "Firebase Hosting URL of the frontend."
  value       = "https://${var.project_id}.web.app"
}

output "artifact_registry" {
  description = "Docker repository that CI pushes to and Cloud Run pulls from."
  value       = "${var.region}-docker.pkg.dev/${local.registry_project}/${var.artifact_registry_name}"
}

output "deployer_service_account" {
  description = "Set as the DEPLOYER_SA GitHub Actions variable."
  value       = google_service_account.deployer.email
}

output "workload_identity_provider" {
  description = "Set as the WIF_PROVIDER GitHub Actions variable."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "github_variables" {
  description = "Copy these into the matching GitHub Actions environment variables."
  value = {
    GCP_PROJECT_ID = data.google_project.this.project_id
    GCP_REGION     = var.region
    WIF_PROVIDER   = google_iam_workload_identity_pool_provider.github.name
    DEPLOYER_SA    = google_service_account.deployer.email
    API_SERVICE    = google_cloud_run_v2_service.api.name
    ARTIFACT_REPO  = "${var.region}-docker.pkg.dev/${local.registry_project}/${var.artifact_registry_name}"
  }
}
