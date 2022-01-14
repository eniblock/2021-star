package com.star.rest;


import com.star.exception.TechnicalException;
import com.star.models.participant.MarketParticipant;
import com.star.models.participant.dso.ImportMarketParticipantDsoResult;
import com.star.models.participant.tso.ImportMarketParticipantTsoResult;
import com.star.rest.enums.InstanceEnum;
import com.star.service.MarketParticipantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import static com.star.rest.enums.InstanceEnum.DSO;
import static com.star.rest.enums.InstanceEnum.PRODUCER;
import static com.star.rest.enums.InstanceEnum.TSO;
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

    @Value("${instance}")
    private InstanceEnum instance;


    @Autowired
    private MarketParticipantService marketParticipantService;

    @Operation(summary = "Post a market participant DSO CSV file.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Create successfully market participant DSO",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "409", description = "Error in the file"),
            @ApiResponse(responseCode = "500", description = "Internal error")})
    @PostMapping("/dso")
    public ResponseEntity<ImportMarketParticipantDsoResult> importMarketParticipantDso(@RequestParam MultipartFile file) {
        // Un acteur TSO ou producer n'a pas le droit de charger des fichiers participants de DSO
        if (TSO.equals(instance) || PRODUCER.equals(instance)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        ImportMarketParticipantDsoResult importMarketParticipantDsoResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importMarketParticipantDsoResult = marketParticipantService.importMarketParticipantDso(file.getOriginalFilename(), streamReader);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importMarketParticipantDsoResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importMarketParticipantDsoResult);
    }

    @Operation(summary = "Post a market participant TSO CSV file.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Create successfully market participant TSO",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "409", description = "Error in the file"),
            @ApiResponse(responseCode = "500", description = "Internal error")})
    @PostMapping("/tso")
    public ResponseEntity<ImportMarketParticipantTsoResult> importMarketParticipantTso(@RequestParam MultipartFile file) {
        // Un acteur DSO ou producer n'a pas le droit de charger des fichiers participants de TSO
        if (DSO.equals(instance) || PRODUCER.equals(instance)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        ImportMarketParticipantTsoResult importMarketParticipantTsoResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importMarketParticipantTsoResult = marketParticipantService.importMarketParticipantTso(file.getOriginalFilename(), streamReader);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importMarketParticipantTsoResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importMarketParticipantTsoResult);

    }

    @Operation(summary = "Get list of market participant")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Get list of market participant",
            content = {@Content(mediaType = "application/json")})})
    @GetMapping
    public ResponseEntity<MarketParticipant> getMarketParticipantDsos() throws TechnicalException {
        return ResponseEntity.ok(marketParticipantService.getMarketParticipant());
    }

}
