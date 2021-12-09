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

provider "google" {
  region = "europe-west1"
  zone   = "europe-west1-d"
}
