package com.star.security;

import com.star.enums.InstanceEnum;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessToken;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Map;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Component
@Slf4j
public class SecurityComponent {

    @Value("${instance}")
    private InstanceEnum instance;

    private KeycloakAuthenticationToken getKeycloakAuthenticationToken() {
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

    public String getProducerMarketParticipantMrid(boolean throwExceptionIfNotExists) {
        var producerMarketParticipantMrid = getClaimInKeycloakToken("producerMarketParticipantMrid");
        if (throwExceptionIfNotExists && (producerMarketParticipantMrid == null || producerMarketParticipantMrid.isBlank())) {
            throw new IllegalArgumentException("Le token de l'utilisateur n'a pas d'attribut \"producerMarketParticipantMrid\" !");
        }
        return producerMarketParticipantMrid;
    }

    public String getSystemOperatorMarketParticipantMrid(boolean throwExceptionIfNotExists) {
        var systemOperatorMarketParticipantMrid = getClaimInKeycloakToken("systemOperatorMarketParticipantMrid");
        if (throwExceptionIfNotExists && (systemOperatorMarketParticipantMrid == null || systemOperatorMarketParticipantMrid.isBlank())) {
            throw new IllegalArgumentException("Le token de l'utilisateur n'a pas d'attribut \"systemOperatorMarketParticipantMrid\" !");
        }
        return systemOperatorMarketParticipantMrid;
    }

    private String getClaimInKeycloakToken(String claim) {
        var keycloakAuthenticationToken = getKeycloakAuthenticationToken();
        if (keycloakAuthenticationToken == null) {
            return null;
        }
        Principal principal = (Principal) keycloakAuthenticationToken.getPrincipal();
        if (principal instanceof KeycloakPrincipal) {
            KeycloakPrincipal keycloakPrincipal = (KeycloakPrincipal) principal;
            AccessToken accessToken = keycloakPrincipal.getKeycloakSecurityContext().getToken();
            Map<String, Object> customClaims = accessToken.getOtherClaims();
            if (customClaims.containsKey(claim)) {
                return String.valueOf(customClaims.get("systemOperatorMarketParticipantMrid"));
            }
        }
        return null;
    }

    public boolean isInstance(InstanceEnum instanceEnum) {
        return instanceEnum.equals(instance);
    }

}