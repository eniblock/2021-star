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
  version    = "4.4.0"
  repository = "https://kubernetes.github.io/ingress-nginx"
  values = [
    templatefile("${path.module}/helm/ingress.tpl", {
    })
  ]
  timeout = 3000
  depends_on = [
    kubernetes_namespace.ingress,
    null_resource.prometheus_crds_apply,
  ]
}

resource "null_resource" "prometheus_crds_apply" {
  triggers = {
    kubeconfig_path = "~/.kube/${local.name}-${local.env}.yaml"
  }
  provisioner "local-exec" {
    command = "kubectl --kubeconfig ${self.triggers.kubeconfig_path} apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.50.0/example/prometheus-operator-crd/monitoring.coreos.com_servicemonitors.yaml"
  }
}

#resource "null_resource" "prometheus_crds_delete" {
#  triggers = {
#    kubeconfig_path = "~/.kube/star-${local.env}.yaml"
#  }
#  provisioner "local-exec" {
#    when    = destroy
#    working_dir = "${path.module}"
#    command = "kubectl --kubeconfig ${self.triggers.kubeconfig_path} delete -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.50.0/example/prometheus-operator-crd/monitoring.coreos.com_servicemonitors.yaml"
#  }
#}

resource "null_resource" "lb_ingress_ip_address" {
  triggers = {
    kubeconfig_path = "~/.kube/${local.name}-${local.env}.yaml"
  }
  provisioner "local-exec" {
    command = "kubectl --kubeconfig ${self.triggers.kubeconfig_path} get svc ingress-ingress-nginx-controller -n ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}' > ${path.module}/lb_ingress_ip_${local.env}.txt"
  }
  depends_on = [
    helm_release.ingress,
  ]
}

data "local_file" "lb_ingress_ip_address_file" {
  filename = "${path.module}/lb_ingress_ip_${local.env}.txt"
  depends_on = [
    null_resource.lb_ingress_ip_address,
  ]
}

output "lb_ingress_ip_address" {
  value = data.local_file.lb_ingress_ip_address_file.content
}
