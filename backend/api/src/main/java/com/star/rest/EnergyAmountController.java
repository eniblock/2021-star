package com.star.rest;

import com.star.dto.energyamount.EnergyAmountDTO;
import com.star.dto.energyamount.EnergyAmountFormDTO;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.energyamount.EnergyAmountMapper;
import com.star.models.common.FichierImportation;
import com.star.models.energyamount.EnergyAmountCriteria;
import com.star.models.energyamount.ImportEnergyAmountResult;
import com.star.security.SecurityComponent;
import com.star.service.EnergyAmountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name="Energy Amount")
public class EnergyAmountController {
    public static final String PATH = ApiRestVersion.VERSION + "/energyAmounts";

    @Value("${instance}")
    private InstanceEnum instance;

    @Autowired
    private EnergyAmountMapper energyAmountMapper;

    @Autowired
    private EnergyAmountService energyAmountService;

    @Autowired
    private SecurityComponent securityComponent;

    @Operation(summary = "Post an energy amount (file or energy amount object). (DSO, TSO)",
            description = "Create an Energy Amount by posting a JSON file containing energy amount data.")
    @PostMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportEnergyAmountResult> createEnergyAmount(
            @Parameter(description = "Energy amount object to create")
            @RequestPart(name = "energyAmount", value = "energyAmount", required = false) @Valid EnergyAmountFormDTO energyAmount,
            @Parameter(description = "JSON file containing energy amount data")
            @RequestPart(name = "files", value = "files", required = false) MultipartFile[] files) throws BusinessException {
        ImportEnergyAmountResult importEnergyAmountResult = new ImportEnergyAmountResult();
        try {
            if (files != null && files.length > 0) {
                List<FichierImportation> fichiers = new ArrayList<>();
                for (MultipartFile file : files) {
                    fichiers.add(new FichierImportation(file.getOriginalFilename(), file.getInputStream()));
                }
                importEnergyAmountResult = energyAmountService.createEnergyAmounts(fichiers, instance, securityComponent.getSystemOperatorMarketParticipantMrid(true));
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

    @Operation(summary = "Update an energy amount (file or energy amount object). (DSO, TSO)",
            description = "Update an Energy Amount by posting a JSON file containing energy amount data.")
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
                importEnergyAmountResult = energyAmountService.updateEnergyAmounts(fichiers, instance, securityComponent.getSystemOperatorMarketParticipantMrid(true));
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
     * @param energyAmountMarketDocumentMrid
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    @Operation(summary = "Find energy amount by criteria. (DSO, TSO)",
            description = "Get an Energy Amount, searched by energyAmountMarketDocumentMrid.")
    @GetMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<EnergyAmountDTO[]> findEnergyAmount(
            @Parameter(description = "energyAmountMarketDocumentMrid search criteria")
            @RequestParam(value = "energyAmountMarketDocumentMrid", required = false) String energyAmountMarketDocumentMrid) throws BusinessException, TechnicalException {
        EnergyAmountCriteria energyAmountCriteria = EnergyAmountCriteria.builder().energyAmountMarketDocumentMrid(energyAmountMarketDocumentMrid).build();
        return ResponseEntity.status(HttpStatus.OK).body(energyAmountMapper.beanToDtos(energyAmountService.findEnergyAmount(energyAmountCriteria)));
    }
}