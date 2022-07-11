resource "helm_release" "cert-manager" {
  name             = "cert-manager"
  namespace        = "cert-manager"
  create_namespace = true
  chart            = "cert-manager"
  version          = "v1.2.0"
  repository       = "https://charts.jetstack.io"
  values = [
    templatefile("${path.module}/helm/cert-manager.tpl", {
    })
  ]
  timeout    = 3000
  provisioner "local-exec" {
    command = "sleep 300"
  }
}

resource "helm_release" "letsencrypt" {
  name             = "letsencrypt"
  namespace        = "cert-manager"
  create_namespace = true
  chart            = "${path.module}/helm/letsencrypt"
  depends_on = [
    helm_release.cert-manager,
  ]
  timeout    = 3000
}
