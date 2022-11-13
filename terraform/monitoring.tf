resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"

    labels = {
      name = "monitoring"
    }
  }
}

resource "helm_release" "monitoring" {
  name             = "prometheus"
  namespace        = "monitoring"
  create_namespace = true
  chart            = "kube-prometheus-stack"
  version          = "39.5.0"
  repository       = "https://prometheus-community.github.io/helm-charts"
  values = [
    templatefile("${path.module}/helm/prometheus.tpl", {
      alerting_username      = data.vault_generic_secret.monitoring.data["username"],
      alerting_password      = data.vault_generic_secret.monitoring.data["password"],
      app_name               = local.name,
      environment            = local.env,
      grafana_admin_password = random_password.grafana_password.result
      domain                 = "${local.monitoring_domain}"
    })
  ]
  depends_on = [
    kubernetes_namespace.monitoring,
    helm_release.letsencrypt,
    helm_release.ingress,
  ]
  provisioner "local-exec" {
    # give some time to gke to have a valid certificate
    command = "sleep 60"
  }
}

resource "random_password" "grafana_password" {
  length  = 20
  number  = true
  special = true
  lower   = true
  upper   = true
}

resource "vault_generic_secret" "grafana" {
  path = "secret/projects/${local.name}/${local.env}/grafana"

  data_json = <<EOT
{
  "username": "admin",
  "password": "${random_password.grafana_password.result}",
  "url": "https://obs.${local.env}.${local.name}.eniblock.fr"
}
EOT
}

data "vault_generic_secret" "monitoring" {
  path = var.vault_alertmanager_secret
}

data "vault_generic_secret" "grafana_permission_sync" {
  path = "secret/projects/xdevit"
}
