package com.star.rest;

import com.star.dto.common.PageDTO;
import com.star.dto.energyamount.EnergyAmountDTO;
import com.star.dto.energyamount.EnergyAmountFormDTO;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.energyamount.EnergyAmountMapper;
import com.star.mapper.energyamount.EnergyAmountPageMapper;
import com.star.models.common.FichierImportation;
import com.star.models.common.PaginationDto;
import com.star.models.energyamount.EnergyAmountCriteria;
import com.star.models.energyamount.ImportEnergyAmountResult;
import com.star.service.EnergyAmountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
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
@RequestMapping(EnergyAmountController.PATH)
public class EnergyAmountController {
    public static final String PATH = ApiRestVersion.VERSION + "/energyAmounts";

    @Value("${instance}")
    private InstanceEnum instance;

    @Autowired
    private EnergyAmountMapper energyAmountMapper;

    @Autowired
    private EnergyAmountPageMapper energyAmountPageMapper;

    @Autowired
    private EnergyAmountService energyAmountService;

    @Operation(summary = "Post an energy amount (file or energy amount object).")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Create successfully an energy Amount", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportEnergyAmountResult> createEnergyAmount(
            @Parameter(description = "Energy amount object to create")
            @RequestPart(name = "energyAmount", value = "energyAmount", required = false) @Valid EnergyAmountFormDTO energyAmount,
            @Parameter(description = "CSV file containing energy amount data")
            @RequestPart(name = "files", value = "files", required = false) MultipartFile[] files) throws BusinessException {
        ImportEnergyAmountResult importEnergyAmountResult = new ImportEnergyAmountResult();
        try {
            if (files != null && files.length > 0) {
                List<FichierImportation> fichiers = new ArrayList<>();
                for (MultipartFile file : files) {
                    fichiers.add(new FichierImportation(file.getOriginalFilename(), file.getInputStream()));
                }
                importEnergyAmountResult = energyAmountService.createEnergyAmounts(fichiers, instance);
            }
            if (energyAmount != null) {
                importEnergyAmountResult = energyAmountService.saveEnergyAmount(energyAmountMapper.formDtoToBean(energyAmount), instance, true);
            }
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importEnergyAmountResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importEnergyAmountResult);
    }

    @Operation(summary = "Update an energy amount (file or energy amount object).")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "200", description = "Update successfully an energy Amount", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PutMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportEnergyAmountResult> updateEnergyAmount(
            @Parameter(description = "Energy amount object to update")
            @RequestPart(name = "energyAmount", value = "energyAmount", required = false) @Valid EnergyAmountFormDTO energyAmount,
            @Parameter(description = "CSV file containing energy amount data")
            @RequestPart(name = "files", value = "files", required = false) MultipartFile[] files) throws BusinessException {
        ImportEnergyAmountResult importEnergyAmountResult = new ImportEnergyAmountResult();
        try {
            if (files != null && files.length > 0) {
                List<FichierImportation> fichiers = new ArrayList<>();
                for (MultipartFile file : files) {
                    fichiers.add(new FichierImportation(file.getOriginalFilename(), file.getInputStream()));
                }
                importEnergyAmountResult = energyAmountService.updateEnergyAmounts(fichiers, instance);
            }
            if (energyAmount != null) {
                importEnergyAmountResult = energyAmountService.saveEnergyAmount(energyAmountMapper.formDtoToBean(energyAmount), instance, false);
            }
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importEnergyAmountResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.OK).body(importEnergyAmountResult);
    }

    /**
     * Recherche multi-critère des energy amount
     *
     * @param pageSize
     * @param bookmark
     * @param energyAmountMarketDocumentMrid
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    @Operation(summary = "Find energy amount by criteria.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "200", description = "Found energy amount", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @GetMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<PageDTO<EnergyAmountDTO>> findEnergyAmount(
            @Parameter(description = "Number of responses per page")
            @RequestParam(required = false, defaultValue = "10") int pageSize,
            @Parameter(description = "bookmark search criteria")
            @RequestParam(required = false, defaultValue = "") String bookmark,
            @Parameter(description = "energyAmountMarketDocumentMrid search criteria")
            @RequestParam(value = "energyAmountMarketDocumentMrid", required = false) String energyAmountMarketDocumentMrid) throws BusinessException, TechnicalException {
        PaginationDto paginationDto = PaginationDto.builder().pageSize(pageSize).build();
        EnergyAmountCriteria energyAmountCriteria = EnergyAmountCriteria.builder().energyAmountMarketDocumentMrid(energyAmountMarketDocumentMrid).build();
        return ResponseEntity.status(HttpStatus.OK).body(energyAmountPageMapper.beanToDto(energyAmountService.findEnergyAmount(
                energyAmountCriteria, bookmark, paginationDto)));
    }
}