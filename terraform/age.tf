resource "age_secret_key" "main" {
  for_each = toset(keys(local.environment_config))
}
