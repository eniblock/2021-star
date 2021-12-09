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
  default     = "51.91.81.121"
}
