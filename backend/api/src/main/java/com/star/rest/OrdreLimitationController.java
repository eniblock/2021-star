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
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;
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
@Tag(name = "Limitation Order")
public class OrdreLimitationController {
    public static final String PATH = ApiRestVersion.VERSION + "/ordreLimitations";
    public static final String DEBUT = "/debut";
    public static final String COUPLE = "/couple";
    public static final String FIN = "/fin";
    public static final String ELIGIBILITY_STATUS = "/eligibilityStatus";
    public static final String IMPORT_EMPTY_FILES_ERROR = "import.files.empty";

    @Value("${instance}")
    private InstanceEnum instance;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private OrdreLimitationService ordreLimitationService;

    @Autowired
    private OrdreLimitationEligibilityStatusMapper ordreLimitationEligibilityStatusMapper;

    Counter activationDocumentCounter;

    public OrdreLimitationController(MeterRegistry registry) {
        activationDocumentCounter = Counter.builder("activation_document_counter")
                .description("The number of activation documents")
                .register(registry);
    }


    @Operation(summary = "Post start limitation order. (TSO)",
            description = "Create start limitation orders by posting a json file.")
    @PostMapping(DEBUT)
    @PreAuthorize("@securityComponent.isInstance('TSO')")
    public ResponseEntity<ImportOrdreLimitationResult> importOrdreDebutLimitation(
            @Parameter(description = "JSON file containing start limitation order data.")
            @RequestParam MultipartFile[] files) throws BusinessException {
        Assert.notEmpty(files, messageSource.getMessage(IMPORT_EMPTY_FILES_ERROR, new String[]{}, null));
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
        activationDocumentCounter.increment(importOrdreLimitationResult.getDatas().size());
        return ResponseEntity.status(isEmpty(importOrdreLimitationResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importOrdreLimitationResult);
    }

    @Operation(summary = "List of start limitation orders. (TSO)",
            description = "Get start limitation orders.")
    @GetMapping(DEBUT)
    @PreAuthorize("@securityComponent.isInstance('TSO')")
    public ResponseEntity<List<OrdreLimitation>> getOrdreDebutLimitation() throws BusinessException, TechnicalException {
        return ResponseEntity.ok(ordreLimitationService.getOrdreDebutLimitation(instance));
    }

    @Operation(summary = "Post couple Start/End limit order. (TSO, DSO)",
            description = "Create start and end limitation orders by posting a json file.")
    @PostMapping(COUPLE)
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportOrdreLimitationResult> importCoupleOrdreDebutFinLimitation(
            @Parameter(description = "JSON file containing couple Start/End limit order data.")
            @RequestParam MultipartFile[] files) throws BusinessException {
        Assert.notEmpty(files, messageSource.getMessage(IMPORT_EMPTY_FILES_ERROR, new String[]{}, null));
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
        activationDocumentCounter.increment(importMarketParticipantResult.getDatas().size());
        return ResponseEntity.status(isEmpty(importMarketParticipantResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importMarketParticipantResult);
    }

    @Operation(summary = "Update couple Start/End limit order. (TSO, DSO)",
            description = "Update start and end limitation orders by posting a json file.")
    @PutMapping(COUPLE)
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportOrdreLimitationResult> updateCoupleOrdreDebutFinLimitation(
            @Parameter(description = "JSON file containing couple Start/End limit order data.")
            @RequestParam MultipartFile[] files) throws BusinessException {
        Assert.notEmpty(files, messageSource.getMessage(IMPORT_EMPTY_FILES_ERROR, new String[]{}, null));
        ImportOrdreLimitationResult importMarketParticipantResult;
        try {
            List<FichierImportation> fichierCoupleOrdreLimitations = new ArrayList<>();
            for (MultipartFile file : files) {
                fichierCoupleOrdreLimitations.add(new FichierImportation(file.getOriginalFilename(), file.getInputStream()));
            }
            importMarketParticipantResult = ordreLimitationService.updateCoupleOrdreDebutFin(fichierCoupleOrdreLimitations, instance);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importMarketParticipantResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.OK).body(importMarketParticipantResult);
    }


    @Operation(summary = "Post end limitation order. (TSO)",
            description = "Create an end limitation order.")
    @PostMapping(FIN)
    @PreAuthorize("@securityComponent.isInstance('TSO')")
    public ResponseEntity<ImportOrdreLimitationResult> importOrdreFinLimitation(
            @Parameter(description = "JSON file containing end limitation order data.")
            @RequestParam MultipartFile[] files) throws BusinessException {
        Assert.notEmpty(files, messageSource.getMessage(IMPORT_EMPTY_FILES_ERROR, new String[]{}, null));
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


    @Operation(summary = "Get limit orders. (TSO, DSO)",
            description = "Find limitation orders by activationDocumentMrid.")
    @GetMapping()
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<List<OrdreLimitation>> findLimitationOrder(
            @Parameter(description = "activationDocumentMrid search criteria")
            @RequestParam(value = "activationDocumentMrid", required = false, defaultValue = "") String activationDocumentMrid
    ) throws TechnicalException {
        var criteria = OrdreLimitationCriteria.builder().activationDocumentMrid(activationDocumentMrid).build();
        return ResponseEntity.ok(ordreLimitationService.findLimitationOrders(criteria));
    }


    @Operation(summary = "Change eligibility status. (TSO, DSO)",
            description = "Change eligibility status, that is : \"OUI\" or \"NON\".")
    @PostMapping(ELIGIBILITY_STATUS)
    public ResponseEntity<OrdreLimitation> ordreDebutEligibilityStatus(@RequestBody OrdreLimitationEligibilityStatusDTO ordreLimitationEligibilityStatusDTO) throws BusinessException, TechnicalException {
        return ResponseEntity.ok(ordreLimitationService.ordreDebutEligibilityStatus(
                ordreLimitationEligibilityStatusMapper.dtoToBean(ordreLimitationEligibilityStatusDTO)));
    }

}
