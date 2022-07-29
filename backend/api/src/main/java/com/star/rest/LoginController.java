package com.star.rest;

import com.star.dto.login.AuthToken;
import com.star.dto.login.CredentialsDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.OAuth2Constants;
import org.keycloak.authorization.client.AuthzClient;
import org.keycloak.authorization.client.Configuration;
import org.keycloak.representations.AccessTokenResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    private static final String SECRET = "secret";
    public static final String PATH = ApiRestVersion.VERSION + "/login";

    @Value("${keycloak.auth-server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String clientId;

    @Value("${keycloak.credentials.secret}")
    private String clientSecret;

    @Operation(summary = "Login and retrieve Token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Get limit orders", content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping
    public ResponseEntity<AuthToken> signin(@RequestBody CredentialsDTO credentialsDTO) {
        log.info("Authentification par login mot de passe sur le realm {}, l'url {}, le cilent ID {} et le client secret {}.", realm, serverUrl, clientId, clientSecret);
        Assert.notNull(credentialsDTO, "Credentials is required");
        Assert.hasLength(credentialsDTO.getUsername(), "Username is required");
        Assert.hasLength(credentialsDTO.getPassword(), "Password is required");
        try {
            Map<String, Object> clientCredentials = new HashMap<>();
            clientCredentials.put(SECRET, clientSecret);
            clientCredentials.put(OAuth2Constants.GRANT_TYPE, OAuth2Constants.PASSWORD);
            Configuration configuration = new Configuration(serverUrl, realm, clientId, clientCredentials, null);
            AccessTokenResponse accessTokenResponse = AuthzClient.create(configuration).obtainAccessToken(credentialsDTO.getUsername(), credentialsDTO.getPassword());
            return ResponseEntity.ok(new AuthToken(accessTokenResponse.getToken()));
        } catch (Exception ex) {
            throw new BadCredentialsException(ex.getMessage());
        }
    }
}