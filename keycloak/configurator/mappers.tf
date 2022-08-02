resource "keycloak_generic_client_protocol_mapper" "producerMarketParticipantMrid" {
  realm_id        = keycloak_realm.main.id
  client_id       = keycloak_openid_client.frontend.id
  name            = "producerMarketParticipantMrid"
  protocol        = "openid-connect"
  protocol_mapper = "oidc-usermodel-attribute-mapper"
  config = {
    "userinfo.token.claim" = "true"
    "user.attribute"       = "producerMarketParticipantMrid"
    "id.token.claim"       = "true"
    "access.token.claim"   = "true"
    "claim.name"           = "producerMarketParticipantMrid"
    "jsonType.label"       = "String"
  }
}


