package com.star.rest;

import com.star.dto.ordrelimitation.OrdreLimitationEligibilityStatusDTO;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.ordrelimitation.OrdreLimitationEligibilityStatusMapper;
import com.star.models.common.FichierImportation;
import com.star.models.limitation.ImportOrdreLimitationResult;
import com.star.models.limitation.OrdreLimitation;
import com.star.models.limitation.OrdreLimitationCriteria;
import com.star.service.OrdreLimitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

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
    public static final String COUPLE = "/couple";
    public static final String FIN = "/fin";
    public static final String ELIGIBILITY_STATUS = "/eligibilityStatus";

    @Value("${instance}")
    private InstanceEnum instance;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private OrdreLimitationService ordreLimitationService;

    @Autowired
    private OrdreLimitationEligibilityStatusMapper ordreLimitationEligibilityStatusMapper;

    @Operation(summary = "Post start limitation order.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Post successfully start limitation order", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping(DEBUT)
    @PreAuthorize("@securityComponent.isInstance('TSO')")
    public ResponseEntity<ImportOrdreLimitationResult> importOrdreDebutLimitation(
            @Parameter(description = "JSON file containing start limitation order data.")
            @RequestParam MultipartFile[] files) throws BusinessException {
        Assert.notEmpty(files, messageSource.getMessage("import.files.empty", new String[]{}, null));
        ImportOrdreLimitationResult importOrdreLimitationResult;
        try {
            List<FichierImportation> fichierOrdreLimitations = new ArrayList<>();
            for (MultipartFile file : files) {
                fichierOrdreLimitations.add(new FichierImportation(file.getOriginalFilename(), file.getInputStream()));
            }
            importOrdreLimitationResult = ordreLimitationService.importOrdreDebutLimitation(fichierOrdreLimitations, instance);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importOrdreLimitationResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importOrdreLimitationResult);
    }

    @Operation(summary = "List of start limitation orders.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of start limitation orders", content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @GetMapping(DEBUT)
    @PreAuthorize("@securityComponent.isInstance('TSO')")
    public ResponseEntity<List<OrdreLimitation>> getOrdreDebutLimitation() throws BusinessException, TechnicalException {
        return ResponseEntity.ok(ordreLimitationService.getOrdreDebutLimitation(instance));
    }

    @Operation(summary = "Post couple Start/End limit order.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Post  successfully couple Start/End limit order",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping(COUPLE)
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportOrdreLimitationResult> importCoupleOrdreDebutFinLimitation(
            @Parameter(description = "JSON file containing couple Start/End limit order data.")
            @RequestParam MultipartFile[] files) throws BusinessException {
        Assert.notEmpty(files, messageSource.getMessage("import.files.empty", new String[]{}, null));
        ImportOrdreLimitationResult importMarketParticipantResult;
        try {
            List<FichierImportation> fichierCoupleOrdreLimitations = new ArrayList<>();
            for (MultipartFile file : files) {
                fichierCoupleOrdreLimitations.add(new FichierImportation(file.getOriginalFilename(), file.getInputStream()));
            }
            importMarketParticipantResult = ordreLimitationService.importCoupleOrdreDebutFin(fichierCoupleOrdreLimitations, instance);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importMarketParticipantResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importMarketParticipantResult);
    }


    @Operation(summary = "Post end limitation order.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Post successfully end limitation order", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping(FIN)
    @PreAuthorize("@securityComponent.isInstance('TSO')")
    public ResponseEntity<ImportOrdreLimitationResult> importOrdreFinLimitation(
            @Parameter(description = "JSON file containing end limitation order data.")
            @RequestParam MultipartFile[] files) throws BusinessException {
        Assert.notEmpty(files, messageSource.getMessage("import.files.empty", new String[]{}, null));
        ImportOrdreLimitationResult importOrdreLimitationResult;
        try {
            List<FichierImportation> fichierOrdreLimitations = new ArrayList<>();
            for (MultipartFile file : files) {
                fichierOrdreLimitations.add(new FichierImportation(file.getOriginalFilename(), file.getInputStream()));
            }
            importOrdreLimitationResult = ordreLimitationService.importOrdreFinLimitation(fichierOrdreLimitations, instance);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importOrdreLimitationResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importOrdreLimitationResult);
    }


    @Operation(summary = "Get limit orders.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Get limit orders", content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @GetMapping()
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<List<OrdreLimitation>> findLimitationOrder(
            @Parameter(description = "activationDocumentMrid search criteria")
            @RequestParam(value = "activationDocumentMrid", required = false, defaultValue = "") String activationDocumentMrid
    ) throws TechnicalException {
        var criteria = OrdreLimitationCriteria.builder().activationDocumentMrid(activationDocumentMrid).build();
        return ResponseEntity.ok(ordreLimitationService.findLimitationOrders(criteria));
    }


    @Operation(summary = "Change eligibility status.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Post successfully start limitation order", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping(ELIGIBILITY_STATUS)
    public ResponseEntity<OrdreLimitation> ordreDebutEligibilityStatus(@RequestBody OrdreLimitationEligibilityStatusDTO ordreLimitationEligibilityStatusDTO) throws BusinessException, TechnicalException {
        return ResponseEntity.ok(ordreLimitationService.ordreDebutEligibilityStatus(
                ordreLimitationEligibilityStatusMapper.dtoToBean(ordreLimitationEligibilityStatusDTO)));
    }

}
