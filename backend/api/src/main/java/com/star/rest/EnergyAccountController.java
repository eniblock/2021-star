package com.star.rest;

import com.star.dto.energyaccount.EnergyAccountDTO;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.energyaccount.EnergyAccountMapper;
import com.star.models.common.FichierImportation;
import com.star.models.energyaccount.EnergyAccountCriteria;
import com.star.models.energyaccount.ImportEnergyAccountResult;
import com.star.security.SecurityComponent;
import com.star.service.EnergyAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

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

    @Autowired
    private EnergyAccountMapper energyAccountMapper;

    @Autowired
    private EnergyAccountService energyAccountService;

    @Autowired
    private SecurityComponent securityComponent;

    /**
     * API de création des energy accounts.
     *
     * @param files
     * @return
     */
    @Operation(summary = "Post an Energy Account. (DSO, TSO)")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Create successfully an energy Account", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportEnergyAccountResult> createEnergyAccount(
            @Parameter(description = "CSV file containing energy account data")
            @RequestParam MultipartFile[] files) throws BusinessException {
        return importEnergyAccount(files, true);
    }

    /**
     * API de modification des energy accounts contenus dans des fichiers JSON
     *
     * @param files fichiers JSON contenant les energy accounts.
     * @return
     * @throws BusinessException
     */
    @Operation(summary = "Update an Energy Account. (DSO, TSO)")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "200", description = "Update successfully an energy Account", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PutMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportEnergyAccountResult> updateEnergyAccount(
            @Parameter(description = "CSV file containing energy account data to update")
            @RequestParam MultipartFile[] files) throws BusinessException {
        return importEnergyAccount(files, false);
    }

    /**
     * API de recherche multi-critère des courbes de comptage
     *
     * @param meteringPointMrid
     * @param startCreatedDateTime
     * @param endCreatedDateTime
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    @Operation(summary = "Find energy account by criteria. (DSO, TSO, PRODUCER)",
            description = "Find energy account that are posted by DSO or TSO.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "200", description = "Found energy account", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @GetMapping
    public ResponseEntity<EnergyAccountDTO[]> findEnergyAccount(
            @Parameter(description = "meteringPointMrid search criteria", example = "PDL00000000289772")
            @RequestParam(value = "meteringPointMrid", required = false) String meteringPointMrid,
            @Parameter(description = "startCreatedDateTime search criteria", example = "2019-09-07T15:52:15Z")
            @RequestParam(value = "startCreatedDateTime", required = false) String startCreatedDateTime,
            @Parameter(description = "endCreatedDateTime search criteria", example = "2019-09-08T15:52:15Z")
            @RequestParam(value = "endCreatedDateTime", required = false) String endCreatedDateTime) throws BusinessException, TechnicalException {
        EnergyAccountCriteria energyAccountCriteria = EnergyAccountCriteria.builder().meteringPointMrid(meteringPointMrid)
                .startCreatedDateTime(startCreatedDateTime).endCreatedDateTime(endCreatedDateTime).build();
        if (InstanceEnum.PRODUCER.equals(instance)) {
            energyAccountCriteria.setProducerMarketParticipantMrid(securityComponent.getProducerMarketParticipantMrid(true));
        }
        return ResponseEntity.status(HttpStatus.OK).body(energyAccountMapper.beanToDtos(energyAccountService.findEnergyAccount(energyAccountCriteria)));
    }

    private ResponseEntity<ImportEnergyAccountResult> importEnergyAccount(MultipartFile[] files, boolean create) throws BusinessException {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Files must not be empty");
        }
        ImportEnergyAccountResult importEnergyAccountResult;
        try {
            List<FichierImportation> fichiers = new ArrayList<>();
            for (MultipartFile file : files) {
                fichiers.add(new FichierImportation(file.getOriginalFilename(), file.getInputStream()));
            }
            if (create) {
                importEnergyAccountResult = energyAccountService.createEnergyAccount(fichiers);
            } else {
                importEnergyAccountResult = energyAccountService.updateEnergyAccount(fichiers);
            }
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        HttpStatus httpStatus = create ? HttpStatus.CREATED : HttpStatus.OK;
        return ResponseEntity.status(CollectionUtils.isEmpty(importEnergyAccountResult.getDatas()) ? HttpStatus.CONFLICT : httpStatus).body(importEnergyAccountResult);
    }
}
