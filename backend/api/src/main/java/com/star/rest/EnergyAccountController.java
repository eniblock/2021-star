package com.star.rest;

import com.star.dto.common.PageDTO;
import com.star.dto.energyaccount.EnergyAccountDTO;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.energyaccount.EnergyAccountPageMapper;
import com.star.models.common.FichierImportation;
import com.star.models.common.PaginationDto;
import com.star.models.energyaccount.EnergyAccountCriteria;
import com.star.models.energyaccount.ImportEnergyAccountResult;
import com.star.service.EnergyAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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

    @Autowired
    private EnergyAccountPageMapper energyAccountPageMapper;
    @Autowired
    private EnergyAccountService energyAccountService;

    /**
     * API de création des energy accounts.
     *
     * @param files
     * @return
     * @throws BusinessException
     */
    @Operation(summary = "Post an Energy Account.")
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
    @Operation(summary = "Update an Energy Account.")
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
     * @param pageSize
     * @param bookmark
     * @param meteringPointMrid
     * @param startCreatedDateTime
     * @param endCreatedDateTime
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    @Operation(summary = "Find energy account by criteria.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "200", description = "Found energy account", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @GetMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<PageDTO<EnergyAccountDTO>> findEnergyAccount(
            @Parameter(description = "Number of responses per page")
            @RequestParam(required = false, defaultValue = "10") int pageSize,
            @Parameter(description = "bookmark search criteria")
            @RequestParam(required = false, defaultValue = "") String bookmark,
            @Parameter(description = "meteringPointMrid search criteria")
            @RequestParam(value = "meteringPointMrid", required = false) String meteringPointMrid,
            @Parameter(description = "startCreatedDateTime search criteria")
            @RequestParam(value = "startCreatedDateTime", required = false) String startCreatedDateTime,
            @Parameter(description = "endCreatedDateTime search criteria")
            @RequestParam(value = "endCreatedDateTime", required = false) String endCreatedDateTime) throws BusinessException, TechnicalException {
        PaginationDto paginationDto = PaginationDto.builder()
                .pageSize(pageSize)
                .build();
        EnergyAccountCriteria energyAccountCriteria = EnergyAccountCriteria.builder().meteringPointMrid(meteringPointMrid)
                .startCreatedDateTime(startCreatedDateTime).endCreatedDateTime(endCreatedDateTime).build();

        return ResponseEntity.status(HttpStatus.OK).body(energyAccountPageMapper.beanToDto(energyAccountService.findEnergyAccount(energyAccountCriteria, bookmark, paginationDto)));
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
