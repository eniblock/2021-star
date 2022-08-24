provider "kubernetes" {
  config_path = "~/.kube/star-${local.env}.yaml"
}

provider "helm" {
  kubernetes {
      config_path = "~/.kube/${local.name}-${local.env}.yaml"
  }
}

provider "vault" {
}

provider "google" {
  region = "europe-west1"
  zone   = "europe-west1-d"
}

data "vault_generic_secret" "cloudflare" {
  path = "secret/credentials/cloudflare"
}

provider "cloudflare" {
  email     = data.vault_generic_secret.cloudflare.data["username"]
  api_token = data.vault_generic_secret.cloudflare.data["api-token"]
}

terraform {
  required_providers {
    gitlab = {
      source  = "gitlabhq/gitlab"
      version = ">= 3.7.0"
    }
    grafana = {
      source  = "grafana/grafana"
      version = ">= 1.13.4"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "3.18.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 1.4"
    }
  }
}
