variable "environment" {
  description = "Environment name (dev, staging, prod). Used for labels and display names."
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "project_id" {
  description = "Google Cloud project ID for this environment. Must be globally unique."
  type        = string
}

variable "billing_account" {
  description = "Billing account ID (gcloud billing accounts list), e.g. 0X0X0X-0X0X0X-0X0X0X."
  type        = string
}

variable "create_project" {
  description = "Create the project. Set to false if the project already exists and is linked to billing."
  type        = bool
  default     = true
}

variable "region" {
  description = "Cloud Run region. asia-south1 (Mumbai) keeps latency low for customers in India."
  type        = string
  default     = "asia-south1"
}

variable "github_repository" {
  description = "GitHub repository allowed to deploy via Workload Identity Federation, as owner/repo."
  type        = string
}

variable "service_name" {
  description = "Cloud Run service name for the API."
  type        = string
  default     = "ks-api"
}

# --- Database (Neon) -------------------------------------------------------

variable "database_url" {
  description = "JDBC URL for the environment's Neon database, e.g. jdbc:postgresql://ep-xxx-pooler.ap-southeast-1.aws.neon.tech/knitting_stories?sslmode=require"
  type        = string
  sensitive   = true

  validation {
    condition     = startswith(var.database_url, "jdbc:postgresql://")
    error_message = "database_url must be a JDBC URL starting with jdbc:postgresql://."
  }
}

variable "database_username" {
  description = "Database role for this environment. Use a per-environment role, not the Neon owner role."
  type        = string
  sensitive   = true
}

variable "database_password" {
  description = "Password for database_username."
  type        = string
  sensitive   = true
}

# --- Optional payment credentials -----------------------------------------

variable "razorpay_key_id" {
  description = "Razorpay key ID. Leave empty to keep the mock payment flow."
  type        = string
  sensitive   = true
  default     = ""
}

variable "razorpay_key_secret" {
  description = "Razorpay key secret. Leave empty to keep the mock payment flow."
  type        = string
  sensitive   = true
  default     = ""
}

# --- Runtime ---------------------------------------------------------------

variable "cors_allowed_origins" {
  description = "Comma-separated frontend origins allowed to call the API. Defaults to this project's Firebase Hosting URL."
  type        = string
  default     = ""
}

variable "min_instances" {
  description = "Cloud Run minimum instances. 0 stays inside the free tier at the cost of cold starts; use 1 for production once you can spend."
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Cloud Run maximum instances. Acts as a spend guard."
  type        = number
  default     = 3
}

variable "cpu" {
  description = "Cloud Run CPU allocation per instance."
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Cloud Run memory per instance. Spring Boot needs at least 512Mi; 1Gi keeps startup comfortable."
  type        = string
  default     = "1Gi"
}

# --- Artifact Registry -----------------------------------------------------

variable "artifact_registry_project" {
  description = "Project hosting the shared Docker registry. When null, a registry is created in this project; otherwise this project is granted read access to that registry so promotions reuse the exact image built for dev."
  type        = string
  default     = null
}

variable "artifact_registry_name" {
  description = "Artifact Registry repository name."
  type        = string
  default     = "ks"
}

# --- Cost guardrails -------------------------------------------------------

variable "enable_budget" {
  description = "Create a billing budget with email alerts. Requires the Billing Account Costs Manager role on the billing account."
  type        = bool
  default     = true
}

variable "budget_amount" {
  description = "Budget in USD. On a correctly configured free-tier setup this should never be reached."
  type        = number
  default     = 1
}

variable "enable_firebase" {
  description = "Enable Firebase on the project so the frontend can be served from <project-id>.web.app."
  type        = bool
  default     = true
}
