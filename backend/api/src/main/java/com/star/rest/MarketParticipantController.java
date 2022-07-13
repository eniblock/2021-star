package com.star.rest;


import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.participant.ImportMarketParticipantResult;
import com.star.models.participant.SystemOperator;
import com.star.service.MarketParticipantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.apache.commons.collections4.CollectionUtils.isEmpty;


/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(MarketParticipantController.PATH)
public class MarketParticipantController {
    public static final String PATH = ApiRestVersion.VERSION + "/participant";

    @Autowired
    private MarketParticipantService marketParticipantService;

    @Operation(summary = "Post a market participant CSV file.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Create successfully market participant", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportMarketParticipantResult> importMarketParticipant(@RequestParam MultipartFile file) throws BusinessException {
        ImportMarketParticipantResult importMarketParticipantResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importMarketParticipantResult = marketParticipantService.importMarketParticipant(file.getOriginalFilename(), streamReader);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importMarketParticipantResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importMarketParticipantResult);

    }

    @Operation(summary = "Get list of market participant")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Get list of market participant",
            content = {@Content(mediaType = "application/json")})})
    @GetMapping
    public ResponseEntity<List<SystemOperator>> getMarketParticipants() throws TechnicalException, BusinessException {
        return ResponseEntity.ok(marketParticipantService.getSystemOperators());
    }

}
