variable "vault_addr" {
  description = "Vault address"
  default     = null
  type        = string
}

variable "vault_alertmanager_secret" {
  description = "Vault path where the alertmanager secret is stored"
  default     = "secret/credentials/monitoring"
}
