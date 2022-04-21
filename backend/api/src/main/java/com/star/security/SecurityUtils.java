package com.star.security;

import org.keycloak.KeycloakPrincipal;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.security.Principal;
import java.util.Map;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static KeycloakAuthenticationToken getKeycloakAuthenticationToken() {
        var securityContext = SecurityContextHolder.getContext();
        if (securityContext == null) {
            return null;
        }
        var authentication = securityContext.getAuthentication();
        if (authentication == null) {
            return null;
        }
        if (authentication.getClass() == KeycloakAuthenticationToken.class) {
            return (KeycloakAuthenticationToken) authentication;
        } else {
            return null;
        }
    }

    public static String getProducerMarketParticipantMrid() {
        var keycloakAuthenticationToken = getKeycloakAuthenticationToken();
        if (keycloakAuthenticationToken == null) {
            return null;
        }
        Principal principal = (Principal) keycloakAuthenticationToken.getPrincipal();
        String producerMarketParticipantMrid = null;
        if (principal instanceof KeycloakPrincipal) {
            KeycloakPrincipal keycloakPrincipal = (KeycloakPrincipal) principal;
            AccessToken accessToken = keycloakPrincipal.getKeycloakSecurityContext().getToken();
            Map<String, Object> customClaims = accessToken.getOtherClaims();
            if (customClaims.containsKey("producerMarketParticipantMrid")) {
                producerMarketParticipantMrid = String.valueOf(customClaims.get("producerMarketParticipantMrid"));
            }
        }
        return producerMarketParticipantMrid;
    }

}