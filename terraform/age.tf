resource "age_secret_key" "main" {
  for_each = terraform.workspace != "sbg5" ? {} : local.environment_config
}

resource "vault_kv_secret_v2" "age" {
  for_each = terraform.workspace != "sbg5" ? {} : local.environment_config
  mount = "secret"
  name  = "projects/star/${each.key}/age.key"
  data_json = jsonencode(
    {
      public_key  = age_secret_key.main[each.key].public_key,
      private_key = age_secret_key.main[each.key].secret_key,
    }
  )
}
