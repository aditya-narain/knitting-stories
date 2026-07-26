variable "project_id" {
  description = "Google Cloud project ID, e.g. ks-dev-a1b2. Must be globally unique."
  type        = string
}

variable "billing_account" {
  description = "Billing account ID from `gcloud billing accounts list`."
  type        = string
}

variable "region" {
  description = "Cloud Run region."
  type        = string
  default     = "asia-south1"
}

variable "github_repository" {
  description = "Repository allowed to deploy, as owner/repo."
  type        = string
  default     = "aditya-narain/knitting-stories"
}

variable "database_url" {
  description = "JDBC URL of this environment's Neon database."
  type        = string
  sensitive   = true
}

variable "database_username" {
  type      = string
  sensitive = true
}

variable "database_password" {
  type      = string
  sensitive = true
}

variable "razorpay_key_id" {
  description = "Leave empty to keep mock payments."
  type        = string
  sensitive   = true
  default     = ""
}

variable "razorpay_key_secret" {
  description = "Leave empty to keep mock payments."
  type        = string
  sensitive   = true
  default     = ""
}

variable "budget_amount" {
  description = "Budget in USD before you get an alert email."
  type        = number
  default     = 1
}
