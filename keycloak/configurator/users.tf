resource "keycloak_user" "init" {
  for_each = { for user in var.users : user["username"] => user }
  realm_id = keycloak_realm.main.id
  username = each.value["username"]
  enabled  = true

  email      = each.value["email"]
  first_name = each.value["first_name"]
  last_name  = each.value["last_name"]
  attributes = {
    "producerMarketParticipantMrid" = lookup(each.value, "producerMarketParticipantMrid", "undefined")
  }

  initial_password {
    value     = each.value["initial_password"]
    temporary = false
  }
}

variable "users" {
  type        = list(map(any))
  description = "a list of users as a dict with username, email, first_name, last_name, initial_password and optionally producerMarketParticipantMrid"
  default     = []
}
