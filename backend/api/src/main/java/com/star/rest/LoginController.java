package com.star.rest;

import com.star.dto.login.CredentialsDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.authorization.client.AuthzClient;
import org.keycloak.authorization.client.Configuration;
import org.keycloak.representations.AccessTokenResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(LoginController.PATH)
public class LoginController {
    public static final String PATH = ApiRestVersion.VERSION + "/login";

    @Value("${keycloak.auth-server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String clientId;

//    Ressource : https://www.linkedin.com/pulse/use-keycloak-spring-boot-ali-helmy/?trk=public_profile_article_view

//    TODO : il faut définir cette valeur via Kubernetes pour tous les environnements
    @Value("${keycloak.credentials.secret}")
    private String clientSecret;

//    @Autowired
//    private Keycloak keycloak;


    @Operation(summary = "Login and retrieve Token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Get limit orders", content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping
    public ResponseEntity<AccessTokenResponse> signin(@RequestBody @Valid CredentialsDTO credentialsDTO) {
//        Map<String, Object> clientCredentials = new HashMap<>();
//        clientCredentials.put("secret", "OR3344MjFHdTjOjXi6z5BleqDOxRjNEC");
//        clientCredentials.put(OAuth2Constants.GRANT_TYPE, OAuth2Constants.CLIENT_CREDENTIALS);
//        Configuration configuration =
//                new Configuration(serverUrl, realm, clientId, clientCredentials, null);

        Map<String, Object> clientCredentials = new HashMap<>();
        clientCredentials.put("secret", "OR3344MjFHdTjOjXi6z5BleqDOxRjNEC");
        clientCredentials.put("grant_type", "password");

        Configuration configuration =
                new Configuration("https://enedis.testing.star.eniblock.fr/auth", "star", "frontend", clientCredentials, null);
        return ResponseEntity.ok(AuthzClient.create(configuration).obtainAccessToken(credentialsDTO.getUsername(), credentialsDTO.getPassword()));
        }
}