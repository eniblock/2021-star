resource "kubernetes_namespace" "ingress" {
  metadata {
    name = "ingress"

    labels = {
      name = "ingress"
    }
  }
}

resource "helm_release" "ingress" {
  name       = "ingress"
  namespace  = "ingress"
  chart      = "ingress-nginx"
  version    = "3.34.0"
  repository = "https://kubernetes.github.io/ingress-nginx"
  values = [
    templatefile("${path.module}/helm/ingress.tpl", {
    })
  ]
  depends_on = [
    kubernetes_namespace.ingress,
  ]
}
