provider "kubernetes" {
  config_path = "~/.kube/star.yaml"
}

provider "helm" {
  kubernetes {
      config_path = "~/.kube/star.yaml"
  }
}

provider "vault" {
}

provider "google" {
  region = "europe-west1"
  zone   = "europe-west1-d"
}
