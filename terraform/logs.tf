resource "kubernetes_namespace" "logging" {
  metadata {
    name = "logging"

    labels = {
      name = "logging"
    }
  }
}

resource "helm_release" "logging" {
  name       = "loki"
  namespace  = "logging"
  chart      = "loki-stack"
  version    = "2.4.1"
  repository = "https://grafana.github.io/helm-charts"
  values = [
    templatefile("${path.module}/helm/loki.tpl", {
      s3_key             = data.vault_generic_secret.log_s3_key.data["log_s3_key"],
      s3_secret          = data.vault_generic_secret.log_s3_key.data["log_s3_secret"],
      container_region     = "${local.s3_container_region}",
    })
  ]
  timeout    = 3000
  depends_on = [
    kubernetes_namespace.logging,
  ]
}

data "vault_generic_secret" "log_s3_key" {
  path = "secret/projects/${local.name}/${local.env}/log_s3"
}
