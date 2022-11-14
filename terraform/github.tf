resource "github_repository_environment" "environment" {
  for_each = terraform.workspace != "sbg5" ? {} : local.environment_config
  environment = each.key
  repository  = "2021-star"
  deployment_branch_policy {
    protected_branches     = true
    custom_branch_policies = false
  }
}

resource "github_actions_environment_secret" "kubeconfig" {
  for_each = terraform.workspace != "sbg5" ? {} : local.environment_config
  environment     = github_repository_environment.environment[each.key].environment
  repository      = "2021-star"
  secret_name     = "KUBECONFIG"
  plaintext_value = templatefile("${path.module}/kubeconfig/${each.value["kubeconfig"]}", {})
}

resource "github_actions_environment_secret" "kubeconfig2" {
  for_each = terraform.workspace != "sbg5" ? {} : local.environment_config
  environment     = github_repository_environment.environment[each.key].environment
  repository      = "2021-star"
  secret_name     = "KUBECONFIG2"
  plaintext_value = templatefile("${path.module}/kubeconfig/${each.value["kubeconfig2"]}", {})
}

resource "github_actions_environment_secret" "age_key" {
  for_each = terraform.workspace != "sbg5" ? {} : local.environment_config
  environment     = github_repository_environment.environment[each.key].environment
  repository      = "2021-star"
  secret_name     = "AGE_KEY"
  plaintext_value = age_secret_key.main[each.key].secret_key
}

resource "github_repository_file" "age_pub_key" {
  for_each = terraform.workspace != "sbg5" ? {} : local.environment_config
  repository          = "2021-star"
  branch              = "develop"
  file                = ".${each.key}.pubkey"
  content             = age_secret_key.main[each.key].public_key
  commit_message      = "add ${each.key} public key"
  commit_author       = "eniblock"
  commit_email        = "it@theblockchainxdev.com"
  overwrite_on_create = true
}
