variable "name" {
  description = "The project name"
  type        = string
}

variable "environment" {
  description = "The project environment"
  type        = string
}

variable "vault_addr" {
  description = "Vault address"
  default     = null
  type        = string
}

variable "vault_alertmanager_secret" {
  description = "Vault path where the alertmanager secret is stored"
  default     = "secret/credentials/monitoring"
}

variable "monitoring_domain" {
  description = "Monitoring domain"
  default     = "obs.star.eniblock.fr"
}

variable "ip_address" {
  description = "IP address for the cluster"
  default     = "141.95.163.97"
}

variable "log_s3_key" {
  type = string
}

variable "log_s3_secret" {
  type = string
  sensitive = true
}
