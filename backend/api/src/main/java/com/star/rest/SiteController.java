package com.star.rest;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.dto.site.SiteDTOResponse;
import com.star.enums.TechnologyTypeEnum;
import com.star.exception.TechnicalException;
import com.star.mapper.site.SiteResponseMapper;
import com.star.models.site.SiteCrteria;
import com.star.models.site.dso.ImportSiteDsoResult;
import com.star.models.site.tso.ImportSiteTsoResult;
import com.star.rest.enums.InstanceEnum;
import com.star.service.SiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
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
@RequestMapping(SiteController.PATH)
public class SiteController {
    public static final String PATH = ApiRestVersion.VERSION + "/site";

    @Value("${instance}")
    private InstanceEnum instance;

    @Autowired
    private SiteService siteService;

    @Autowired
    private SiteResponseMapper siteResponseMapper;

    @Operation(summary = "Post a Site DSO CSV file.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Create successfully site DSO",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "409", description = "Error in the file"),
            @ApiResponse(responseCode = "500", description = "Internal error")})
    @PostMapping("/dso")
    public ResponseEntity<ImportSiteDsoResult> importSiteDso(@RequestParam MultipartFile file) {
        // Un acteur TSO ou producer n'a pas le droit d'importer des fichiers de site DSO
        if (TSO.equals(instance) || PRODUCER.equals(instance)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        ImportSiteDsoResult importSiteDsoResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importSiteDsoResult = siteService.importSiteDso(file.getOriginalFilename(), streamReader);
        } catch (IOException | TechnicalException | ContractException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importSiteDsoResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importSiteDsoResult);
    }

    @Operation(summary = "Post a site TSO CSV file.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Create successfully site TSO",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "409", description = "Error in the file"),
            @ApiResponse(responseCode = "500", description = "Internal error")})
    @PostMapping("/tso")
    public ResponseEntity<ImportSiteTsoResult> importSiteTso(@RequestParam MultipartFile file) {
        // Un acteur DSO ou producer n'a pas le droit d'importer des fichiers de site TSO
        if (DSO.equals(instance) || PRODUCER.equals(instance)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        ImportSiteTsoResult importSiteTsoResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importSiteTsoResult = siteService.importSiteTso(file.getOriginalFilename(), streamReader);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importSiteTsoResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importSiteTsoResult);

    }

    /**
     * Recherche multi-critère de site HTA
     *
     * @param page
     * @param pageSize
     * @param order
     * @param bookmark
     * @param technologyType
     * @param producerMarketParticipantMrid
     * @param producerMarketParticipantName
     * @param siteName
     * @param substationName
     * @param substationMrid
     * @param siteIecCode
     * @param meteringPointMrId
     * @return
     * @throws JsonProcessingException
     * @throws ContractException
     */
    @RequestMapping(value = "/dso")
    public ResponseEntity<SiteDTOResponse> findSiteDso(
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSize,
            @RequestParam(value = "order", required = false) String order,
            @RequestParam(value = "bookmark", required = false, defaultValue = "") String bookmark,
            @RequestParam(value = "technologyType", required = false) List<TechnologyTypeEnum> technologyType,
            @RequestParam(value = "producerMarketParticipantMrid", required = false) String producerMarketParticipantMrid,
            @RequestParam(value = "producerMarketParticipantName", required = false) String producerMarketParticipantName,
            @RequestParam(value = "siteName", required = false) String siteName,
            @RequestParam(value = "substationName", required = false) String substationName,
            @RequestParam(value = "substationMrid", required = false) String substationMrid,
            @RequestParam(value = "siteIecCode", required = false) String siteIecCode,
            @RequestParam(value = "meteringPointMrId", required = false) String meteringPointMrId) throws JsonProcessingException, ContractException, TechnicalException {
        if (TSO.equals(instance) || PRODUCER.equals(instance)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        SiteDTOResponse siteDTOResponse = findSite(order, page, pageSize, bookmark, technologyType, producerMarketParticipantMrid,
                producerMarketParticipantName, siteName, substationName, substationMrid, siteIecCode, meteringPointMrId);
        return ResponseEntity.status(HttpStatus.OK).body(siteDTOResponse);
    }

    /**
     * Recherche multi-critère de site HTB
     *
     * @param page
     * @param pageSize
     * @param order
     * @param bookmark
     * @param technologyType
     * @param producerMarketParticipantMrid
     * @param producerMarketParticipantName
     * @param siteName
     * @param substationName
     * @param substationMrid
     * @param siteIecCode
     * @param meteringPointMrId
     * @return
     * @throws JsonProcessingException
     * @throws ContractException
     * @throws TechnicalException
     */
    @RequestMapping(value = "/tso")
    public ResponseEntity<SiteDTOResponse> findSiteTso(
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSize,
            @RequestParam(value = "order", required = false) String order,
            @RequestParam(value = "bookmark", required = false, defaultValue = "") String bookmark,
            @RequestParam(value = "technologyType", required = false) List<TechnologyTypeEnum> technologyType,
            @RequestParam(value = "producerMarketParticipantMrid", required = false) String producerMarketParticipantMrid,
            @RequestParam(value = "producerMarketParticipantName", required = false) String producerMarketParticipantName,
            @RequestParam(value = "siteName", required = false) String siteName,
            @RequestParam(value = "substationName", required = false) String substationName,
            @RequestParam(value = "substationMrid", required = false) String substationMrid,
            @RequestParam(value = "siteIecCode", required = false) String siteIecCode,
            @RequestParam(value = "meteringPointMrId", required = false) String meteringPointMrId) throws JsonProcessingException, ContractException, TechnicalException {
        if (DSO.equals(instance) || PRODUCER.equals(instance)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        SiteDTOResponse siteDTOResponse = findSite(order, page, pageSize, bookmark, technologyType, producerMarketParticipantMrid,
                producerMarketParticipantName, siteName, substationName, substationMrid, siteIecCode, meteringPointMrId);
        return ResponseEntity.status(HttpStatus.OK).body(siteDTOResponse);
    }

    private SiteDTOResponse findSite(String order, int page, int pageSize, String bookmark, List<TechnologyTypeEnum> technologyType, String producerMarketParticipantMrid,
                                     String producerMarketParticipantName, String siteName, String substationName, String substationMrid, String siteIecCode, String meteringPointMrId) throws JsonProcessingException, ContractException, TechnicalException {
        Assert.notNull(order, "Order must not be null");
        Sort sort = Sort.by(order);
        PageRequest pageRequest = PageRequest.of(page, pageSize, sort);
        SiteCrteria criteria = SiteCrteria.builder().meteringPointMrId(meteringPointMrId).producerMarketParticipantMrid(producerMarketParticipantMrid)
                .producerMarketParticipantName(producerMarketParticipantName).siteIecCode(siteIecCode).substationMrid(substationMrid)
                .substationName(substationName).siteName(siteName).technologyType(technologyType).build();
        return DSO.equals(instance) ? siteResponseMapper.beanDsoToDto(siteService.findSiteDso(criteria, bookmark, pageRequest)) :
                siteResponseMapper.beanTsoToDto(siteService.findSiteTso(criteria, bookmark, pageRequest));
    }
}