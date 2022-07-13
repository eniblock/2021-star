resource "cloudflare_record" "domains" {
  for_each     = setunion(
      "${local.project_fqdn_testing}",
      "${local.project_fqdn_staging}",
      "${local.project_fqdn_prod}",
      ["${local.monitoring_domain}"],
  )
  zone_id  = data.cloudflare_zone.eniblock_fr.id
  name     = replace(each.value, "/\\.eniblock\\.fr$/", "")
  value    = "141.95.163.210"
  type     = "A"
  ttl      = 300
  depends_on  = [
    null_resource.lb_ingress_ip_address,
  ]
}

data "cloudflare_zone" "eniblock_fr" {
  name = "eniblock.fr"
}
