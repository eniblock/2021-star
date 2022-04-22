package com.star.rest;

import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import static com.star.enums.InstanceEnum.PRODUCER;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(EnergyAccountController.PATH)
public class EnergyAccountController {
    public static final String PATH = ApiRestVersion.VERSION + "/energyAccounts";

    @Value("${instance}")
    private InstanceEnum instance;

    @Operation(summary = "Post an Energy Account.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Post successfully start limitation order",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "409", description = "Error in the file"),
            @ApiResponse(responseCode = "500", description = "Internal error")})
    @PostMapping
    public ResponseEntity<Object> importEnergyAccount(@RequestParam MultipartFile[] files) throws BusinessException {
        if (PRODUCER.equals(instance)) { // Onle RTE and Enedis can send energy accounts
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Files must not be empty");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

}
