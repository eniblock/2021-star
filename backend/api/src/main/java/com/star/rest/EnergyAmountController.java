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

    @Operation(summary = "Post an Energy Amount.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Post successfully an Energy Amount",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "409", description = "Error in the file"),
            @ApiResponse(responseCode = "500", description = "Internal error")})
    @PostMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportEnergyAmountResult> createEnergyAmount(@RequestPart(name = "energyAmount", value = "energyAmount", required = false) @Valid EnergyAmountFormDTO energyAmount,
                                                                       @RequestPart(name = "files", value = "files", required = false) MultipartFile[] files) throws BusinessException {
        ImportEnergyAmountResult importEnergyAmountResult = new ImportEnergyAmountResult();
        try {
            if (files != null && files.length > 0) {
                List<FichierImportation> fichiers = new ArrayList<>();
                for (MultipartFile file : files) {
                    fichiers.add(new FichierImportation(file.getOriginalFilename(), file.getInputStream()));
                }
                importEnergyAmountResult = energyAmountService.createEnergyAmount(fichiers, instance);
            }
            if (energyAmount != null) {
                importEnergyAmountResult = energyAmountService.createEnergyAmount(energyAmountMapper.formDtoToBean(energyAmount), instance);
            }
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importEnergyAmountResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importEnergyAmountResult);

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
    @GetMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<PageDTO<EnergyAmountDTO>> findEnergyAmount(
            @RequestParam(required = false, defaultValue = "10") int pageSize,
            @RequestParam(required = false, defaultValue = "") String bookmark,
            @RequestParam(value = "energyAmountMarketDocumentMrid", required = false) String energyAmountMarketDocumentMrid) throws BusinessException, TechnicalException {

        PaginationDto paginationDto = PaginationDto.builder()
                .pageSize(pageSize)
                .build();
        EnergyAmountCriteria energyAmountCriteria = EnergyAmountCriteria.builder().energyAmountMarketDocumentMrid(energyAmountMarketDocumentMrid).build();

        return ResponseEntity.status(HttpStatus.OK).body(energyAmountPageMapper.beanToDto(energyAmountService.findEnergyAmount(
                energyAmountCriteria, bookmark, paginationDto)));
    }

}
