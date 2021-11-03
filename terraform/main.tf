provider "kubernetes" {
  config_path = "~/.kube/star.yml"
}

provider "helm" {
  kubernetes {
      config_path = "~/.kube/star.yml"
  }
}

provider "vault" {
}
