locals {
  name = "star"
  env  = terraform.workspace # sbg5 || gra7
  workspace_config = {


    sbg5 = {
      monitoring_domain = "obs.${local.env}.star.eniblock.fr"
      project_fqdn_testing = [
        "enedis.testing.star.eniblock.fr",
        "producer.testing.star.eniblock.fr",
        "orderer1.orderer.testing.star.eniblock.fr",
        "orderer2.orderer.testing.star.eniblock.fr",
        "peer1.enedis.testing.star.eniblock.fr",
        "peer1.producer.testing.star.eniblock.fr",
        "peer2.rte.testing.star.eniblock.fr",
      ]
      project_fqdn_staging = [
        "enedis.staging.star.eniblock.fr",
        "producer.staging.star.eniblock.fr",
        "orderer1.orderer.staging.star.eniblock.fr",
        "orderer2.orderer.staging.star.eniblock.fr",
        "peer1.enedis.staging.star.eniblock.fr",
        "peer1.producer.staging.star.eniblock.fr",
        "peer2.rte.staging.star.eniblock.fr",
      ]
      project_fqdn_prod = [
        "enedis.star.eniblock.fr",
        "orderer1.orderer.prod.star.eniblock.fr",
        "peer1.enedis.prod.star.eniblock.fr",
        "peer2.producer.prod.star.eniblock.fr",
      ]
      s3_container_region = "sbg"
    }

    gra7 = {
      monitoring_domain = "obs.${local.env}.star.eniblock.fr"
      project_fqdn_testing = [
        "peer2.enedis.testing.star.eniblock.fr",
        "peer2.producer.testing.star.eniblock.fr",
        "rte.testing.star.eniblock.fr",
        "peer1.rte.testing.star.eniblock.fr",
        "orderer3.orderer.testing.star.eniblock.fr",
      ]
      project_fqdn_staging = [
        "peer2.enedis.staging.star.eniblock.fr",
        "peer2.producer.staging.star.eniblock.fr",
        "rte.staging.star.eniblock.fr",
        "orderer3.orderer.staging.star.eniblock.fr",
        "peer1.rte.staging.star.eniblock.fr",
      ]
      project_fqdn_prod = [
        "peer2.enedis.prod.star.eniblock.fr",
        "producer.star.eniblock.fr",
        "orderer2.orderer.prod.star.eniblock.fr",
        "peer1.producer.prod.star.eniblock.fr",
      ]
      s3_container_region = "gra"
    }
  }


  monitoring_domain    = local.workspace_config[terraform.workspace]["monitoring_domain"]
  project_fqdn_testing = local.workspace_config[terraform.workspace]["project_fqdn_testing"]
  project_fqdn_staging = local.workspace_config[terraform.workspace]["project_fqdn_staging"]
  project_fqdn_prod    = local.workspace_config[terraform.workspace]["project_fqdn_prod"]
  s3_container_region  = local.workspace_config[terraform.workspace]["s3_container_region"]
  environment_config = terraform.workspace != "sbg5" ? {} : {
    # testing
    "enedis-testing" = {
      "branch"      = "develop"
      "kubeconfig"  = "sbg5.yaml"
      "kubeconfig2" = "gra7.yaml"
    }
    "producer-testing" = {
      "branch"      = "develop"
      "kubeconfig"  = "sbg5.yaml"
      "kubeconfig2" = "gra7.yaml"
    }
    "rte-testing" = {
      "branch"      = "develop"
      "kubeconfig"  = "gra7.yaml"
      "kubeconfig2" = "sbg5.yaml"
    }
    # staging
    "enedis-staging" = {
      "branch"      = "staging"
      "kubeconfig"  = "sbg5.yaml"
      "kubeconfig2" = "gra7.yaml"
    }
    "producer-staging" = {
      "branch"      = "staging"
      "kubeconfig"  = "sbg5.yaml"
      "kubeconfig2" = "gra7.yaml"
    }
    "rte-staging" = {
      "branch"      = "staging"
      "kubeconfig"  = "gra7.yaml"
      "kubeconfig2" = "sbg5.yaml"
    }
    # prod
    "enedis-prod" = {
      "branch"      = "prod"
      "kubeconfig"  = "sbg5.yaml"
      "kubeconfig2" = "gra7.yaml"
    }
    "producer-prod" = {
      "branch"      = "prod"
      "kubeconfig"  = "sbg5.yaml"
      "kubeconfig2" = "gra7.yaml"
    }
    "rte-prod" = {
      "branch"      = "prod"
      "kubeconfig"  = "rte.yaml"
      "kubeconfig2" = "rte.yaml"
    }
  }
}
