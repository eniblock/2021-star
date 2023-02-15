package com.star.rest;

import com.star.dto.login.AuthToken;
import com.star.dto.login.AuthTokenForm;
import com.star.dto.login.CredentialsDTO;
import io.micrometer.core.annotation.Counted;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(LoginController.PATH)
@Tag(name = "Login")
public class LoginController {
    public static final String PATH = ApiRestVersion.VERSION + "/login";
    private static final String SECRET = "secret";
    @Value("${keycloak.auth-server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String clientId;

    @Autowired
    private RestTemplate restTemplate;

    @Operation(summary = "Login and retrieve Token.",
            description = "Get a JWT token.")
    @PostMapping
    public ResponseEntity<String> signIn(@RequestBody CredentialsDTO credentialsDTO) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "password");
        map.add("username", credentialsDTO.getUsername());
        map.add("password", credentialsDTO.getPassword());
        map.add("client_id", clientId);

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(map, headers);

        var authTokenForm = new AuthTokenForm(
                "password",
                credentialsDTO.getUsername(),
                credentialsDTO.getPassword(),
                clientId);
        var url = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";
        ResponseEntity<AuthToken> response = restTemplate.postForEntity(url, entity, AuthToken.class);
        return ResponseEntity.ok(response.getBody().getAccess_token());
    }

    @PostMapping("/countConnections")
    @Counted
    @Hidden
    public void countConnections() {
    }
}