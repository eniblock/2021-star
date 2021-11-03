resource "google_dns_record_set" "domains" {
  for_each     = toset([
      "*.testing.${var.name}.eniblock.fr",
      "obs.${var.name}.eniblock.fr",
  ])
  project      = "xdevit"
  name         = "${each.value}."
  type         = "A"
  ttl          = 300
  managed_zone = "eniblockfr"
  rrdatas      = [var.ip_address]
}
