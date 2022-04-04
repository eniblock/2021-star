package com.star.rest;


import com.star.dto.common.PageResponse;
import com.star.dto.site.SiteDTO;
import com.star.enums.InstanceEnum;
import com.star.enums.TechnologyTypeEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.site.SitePageMapper;
import com.star.models.site.ImportSiteResult;
import com.star.models.site.SiteCrteria;
import com.star.security.SecurityUtils;
import com.star.service.SiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
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
import java.util.List;

import static com.star.enums.InstanceEnum.PRODUCER;
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
    private SitePageMapper siteResponseMapper;

    @Operation(summary = "Post a Site CSV file.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Create successfully site",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "409", description = "Error in the file"),
            @ApiResponse(responseCode = "500", description = "Internal error")})
    @PostMapping("/create")
    public ResponseEntity<ImportSiteResult> importSite(@RequestParam MultipartFile file) throws BusinessException {
        if (PRODUCER.equals(instance)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        ImportSiteResult importSiteResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importSiteResult = siteService.importSite(file.getOriginalFilename(), streamReader, instance);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importSiteResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importSiteResult);
    }


    @Operation(summary = "Update a Site CSV file.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Update successfully site",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "409", description = "Error in the file"),
            @ApiResponse(responseCode = "500", description = "Internal error")})
    @PostMapping("/update")
    public ResponseEntity<ImportSiteResult> updateSite(@RequestParam MultipartFile file) throws BusinessException {
        if (PRODUCER.equals(instance)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        ImportSiteResult importSiteResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importSiteResult = siteService.updateSite(file.getOriginalFilename(), streamReader, instance);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importSiteResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.OK).body(importSiteResult);
    }


    /**
     * Recherche multi-critère de site
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
     * @throws BusinessException
     * @throws TechnicalException
     */
    @GetMapping
    public ResponseEntity<PageResponse<SiteDTO>> findSite(
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSize,
            @RequestParam(value = "order") String order,
            @RequestParam(value = "bookmark", required = false, defaultValue = "") String bookmark,
            @RequestParam(value = "technologyType", required = false) List<TechnologyTypeEnum> technologyType,
            @RequestParam(value = "producerMarketParticipantMrid", required = false) String producerMarketParticipantMrid,
            @RequestParam(value = "producerMarketParticipantName", required = false) String producerMarketParticipantName,
            @RequestParam(value = "siteName", required = false) String siteName,
            @RequestParam(value = "substationName", required = false) String substationName,
            @RequestParam(value = "substationMrid", required = false) String substationMrid,
            @RequestParam(value = "siteIecCode", required = false) String siteIecCode,
            @RequestParam(value = "meteringPointMrId", required = false) String meteringPointMrId) throws BusinessException, TechnicalException {
        Assert.notNull(order, "Order must not be null");
        Sort sort = Sort.by(order);
        PageRequest pageRequest = PageRequest.of(page, pageSize, sort);
        SiteCrteria criteria = SiteCrteria.builder().meteringPointMrId(meteringPointMrId).producerMarketParticipantMrid(producerMarketParticipantMrid)
                .producerMarketParticipantName(producerMarketParticipantName).siteIecCode(siteIecCode).substationMrid(substationMrid)
                .substationName(substationName).siteName(siteName).technologyType(technologyType).instance(instance).build();
        if (PRODUCER.equals(instance)) {
            criteria.setProducerMarketParticipantMrid(SecurityUtils.getProducerMarketParticipantMrid());
        }
        return ResponseEntity.status(HttpStatus.OK).body(siteResponseMapper.beanToDto(siteService.findSite(criteria, bookmark, pageRequest)));
    }
}
