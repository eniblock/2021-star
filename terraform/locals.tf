locals {
  name = "star"
  env  = terraform.workspace # sbg5 || gra7
  workspace_config = {


      sbg5 = {
        monitoring_domain      = "obs.${local.env}.star.eniblock.fr"
        project_fqdn_testing   = [
            "*.testing.star.eniblock.fr",
            "orderer1.orderer.testing.star.eniblock.fr", 
            "orderer2.orderer.testing.star.eniblock.fr", 
            "orderer3.orderer.testing.star.eniblock.fr",
            "peer1.enedis.testing.star.eniblock.fr", 
            "peer1.producer.testing.star.eniblock.fr", 
            "peer1.rte.testing.star.eniblock.fr",
            "peer2.enedis.testing.star.eniblock.fr", 
            "peer2.producer.testing.star.eniblock.fr", 
            "peer2.rte.testing.star.eniblock.fr"
        ]
        project_fqdn_staging   = [
            "*.staging.star.eniblock.fr",
            "orderer1.orderer.staging.star.eniblock.fr", 
            "orderer2.orderer.staging.star.eniblock.fr", 
            "orderer3.orderer.staging.star.eniblock.fr",
            "peer1.enedis.staging.star.eniblock.fr", 
            "peer1.producer.staging.star.eniblock.fr", 
            "peer1.rte.staging.star.eniblock.fr",
            "peer2.enedis.staging.star.eniblock.fr", 
            "peer2.producer.staging.star.eniblock.fr", 
            "peer2.rte.staging.star.eniblock.fr"
        ]
        project_fqdn_prod      = [
            "enedis.star.eniblock.fr",
            "producer.star.eniblock.fr",
            "orderer1.orderer.prod.star.eniblock.fr", 
            "orderer2.orderer.prod.star.eniblock.fr", 
            "orderer3.orderer.prod.star.eniblock.fr",
            "peer1.enedis.prod.star.eniblock.fr", 
            "peer1.producer.prod.star.eniblock.fr", 
            "peer1.rte.prod.star.eniblock.fr",
            "peer2.enedis.prod.star.eniblock.fr", 
            "peer2.producer.prod.star.eniblock.fr", 
            "peer2.rte.prod.star.eniblock.fr"
        ]
        s3_container_region    = "sbg"
      }


      gra7 = {
        monitoring_domain      = "obs.${local.env}.star.eniblock.fr"
         project_fqdn_testing = [
            "peer1.enedis.testing.gra.star.eniblock.fr", 
            "peer1.producer.testing.gra.star.eniblock.fr", 
            "peer1.rte.testing.gra.star.eniblock.fr",
            "peer2.enedis.testing.gra.star.eniblock.fr", 
            "peer2.producer.testing.gra.star.eniblock.fr", 
            "peer2.rte.testing.gra.star.eniblock.fr"
        ]
         project_fqdn_staging = [
        #    "peer2.enedis.staging.star.eniblock.fr", 
        #    "peer2.producer.staging.star.eniblock.fr", 
        #    "peer2.rte.staging.star.eniblock.fr"
        ]
        project_fqdn_prod      = [
        ]
        s3_container_region    = "gra"
      }
  }


  monitoring_domain      = "${local.workspace_config[terraform.workspace]["monitoring_domain"]}"
  project_fqdn_testing   = "${local.workspace_config[terraform.workspace]["project_fqdn_testing"]}"
  project_fqdn_staging   = "${local.workspace_config[terraform.workspace]["project_fqdn_staging"]}"
  project_fqdn_prod      = "${local.workspace_config[terraform.workspace]["project_fqdn_prod"]}"
  s3_container_region = "${local.workspace_config[terraform.workspace]["s3_container_region"]}"
}
