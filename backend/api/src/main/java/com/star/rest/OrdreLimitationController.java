package com.star.rest;

import com.star.dto.limitationorder.LimitationOrderDTOResponse;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.limitation.FichierOrdreLimitation;
import com.star.models.limitation.ImportOrdreLimitationResult;
import com.star.models.limitation.OrdreLimitation;
import com.star.service.OrdreLimitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static com.star.enums.InstanceEnum.DSO;
import static com.star.enums.InstanceEnum.TSO;
import static org.apache.commons.collections4.CollectionUtils.isEmpty;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(OrdreLimitationController.PATH)
public class OrdreLimitationController {
    public static final String PATH = ApiRestVersion.VERSION + "/ordreLimitations";
    public static final String DEBUT = "/debut";

    @Value("${instance}")
    private InstanceEnum instance;

    @Autowired
    private OrdreLimitationService ordreLimitationService;

    @Operation(summary = "Post start limitation order.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Post successfully start limitation order",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "409", description = "Error in the file"),
            @ApiResponse(responseCode = "500", description = "Internal error")})
    @PostMapping(DEBUT)
    public ResponseEntity<ImportOrdreLimitationResult> importOrdreDebutLimitation(@RequestParam MultipartFile[] files) throws BusinessException {
        if (!TSO.equals(instance)) { // Seul RTE peut envoyer des ordres de début
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Files must not be empty");
        }
        ImportOrdreLimitationResult importMarketParticipantResult;
        try {
            List<FichierOrdreLimitation> fichierOrdreLimitations = new ArrayList<>();
            for (MultipartFile file : files) {
                fichierOrdreLimitations.add(new FichierOrdreLimitation(file.getOriginalFilename(), file.getInputStream()));
            }
            importMarketParticipantResult = ordreLimitationService.importOrdreDebutLimitation(fichierOrdreLimitations);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importMarketParticipantResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importMarketParticipantResult);
    }

    @Operation(summary = "List of start limitation orders.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of start limitation orders",
                    content = {@Content(mediaType = "application/json")})})
    @GetMapping(DEBUT)
    public ResponseEntity<List<OrdreLimitation>> getOrdreDebutLimitation() throws BusinessException, TechnicalException {
        if (!TSO.equals(instance)) { // Seul RTE peut obtenir la liste des ordres de début de limitation
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(ordreLimitationService.getOrdreDebutLimitation());
    }

    @Operation(summary = "Post couple Start/End limit order.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Post  successfully couple Start/End limit order",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "409", description = "Error in the file"),
            @ApiResponse(responseCode = "500", description = "Internal error")})
    @PostMapping()
    public ResponseEntity<ImportOrdreLimitationResult> importCoupleOrdreDebutFinLimitation(@RequestParam MultipartFile[] files) throws BusinessException {
        if (!DSO.equals(instance)) { // Seul Enedis peut inscrire des couples d'ordre
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Files must not be empty");
        }
        ImportOrdreLimitationResult importMarketParticipantResult;
        try {
            List<FichierOrdreLimitation> fichierCoupleOrdreLimitations = new ArrayList<>();
            for (MultipartFile file : files) {
                fichierCoupleOrdreLimitations.add(new FichierOrdreLimitation(file.getOriginalFilename(), file.getInputStream()));
            }
            importMarketParticipantResult = ordreLimitationService.importCoupleOrdreDebutFin(fichierCoupleOrdreLimitations);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importMarketParticipantResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importMarketParticipantResult);
    }

    @Operation(summary = "Get limit orders.")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Get limit orders",
            content = {@Content(mediaType = "application/json")})})
    @GetMapping()
    public ResponseEntity<LimitationOrderDTOResponse> findLimitationOrder(
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSize,
            @RequestParam(value = "order") String order,
            @RequestParam(value = "bookmark", required = false, defaultValue = "") String bookmark,
            @RequestParam(value = "originAutomationRegisteredResourceMrid", required = false, defaultValue = "") String originAutomationRegisteredResourceMrid,
            @RequestParam(value = "producerMarketParticipantMrid", required = false, defaultValue = "") String producerMarketParticipantMrid,
            @RequestParam(value = "startCreatedDateTime", required = false, defaultValue = "") String startCreatedDateTime,
            @RequestParam(value = "endCreatedDateTime", required = false, defaultValue = "") String endCreatedDateTime
    ) {
        return null;
    }
}
