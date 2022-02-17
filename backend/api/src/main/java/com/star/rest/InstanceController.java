package com.star.rest;

import com.star.enums.InstanceEnum;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@RestController
@RequestMapping(InstanceController.PATH)
public class InstanceController {
    public static final String PATH = ApiRestVersion.VERSION + "/instance";

    @Value("${instance}")
    private InstanceEnum instance;

    @Operation(summary = "Get current backend instance")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Get current backend instance",
            content = {@Content(mediaType = "application/json")})})
    @GetMapping
    public ResponseEntity<InstanceEnum> getCurrentInstance() {
        return ResponseEntity.ok(instance);
    }
}
