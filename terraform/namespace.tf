resource "kubernetes_namespace" "namespace" {
  for_each = local.environment_config
  metadata {
    name = "${each.key}"

    labels = {
      name = "${each.key}"
    }
  }
}
