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
      s3_key             = var.log_s3_key,
      s3_secret          = var.log_s3_secret,
    })
  ]
  depends_on = [
    kubernetes_namespace.logging,
  ]
}
