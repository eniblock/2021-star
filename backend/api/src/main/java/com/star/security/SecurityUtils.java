package com.star.security;

import org.keycloak.KeycloakPrincipal;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    private static Optional<Authentication> getInternalAuthentication() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication());
    }

    public static String getProducerMarketParticipantMrid() {
        KeycloakAuthenticationToken keycloakAuthenticationToken = getKeycloakAuthenticationToken();
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

    private static KeycloakAuthenticationToken getKeycloakAuthenticationToken() {
        Optional<Authentication> authOpt = getInternalAuthentication();
        if (!authOpt.isPresent()) {
            return null;
        }
        return (KeycloakAuthenticationToken) authOpt.get();
    }
}