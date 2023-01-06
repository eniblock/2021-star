package com.star.rest;


import com.star.dto.site.SiteDTO;
import com.star.enums.InstanceEnum;
import com.star.enums.TechnologyTypeEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.site.SiteMapper;
import com.star.models.site.ImportSiteResult;
import com.star.models.site.SiteCrteria;
import com.star.security.SecurityComponent;
import com.star.service.SiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@Tag(name="Site")
public class SiteController {
    public static final String PATH = ApiRestVersion.VERSION + "/site";

    @Value("${instance}")
    private InstanceEnum instance;
    @Autowired
    private SiteService siteService;
    @Autowired
    private SiteMapper siteMapper;
    @Autowired
    private SecurityComponent securityComponent;

    @Operation(summary = "Post a Site CSV file. (TSO, DSO)")
    @PostMapping("/create")
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportSiteResult> importSite(@Parameter(description = "CSV file containing site data.")
                                                       @RequestParam MultipartFile file) throws BusinessException {
        ImportSiteResult importSiteResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importSiteResult = siteService.importSite(file.getOriginalFilename(), streamReader, instance);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importSiteResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importSiteResult);
    }


    @Operation(summary = "Update a Site CSV file. (TSO, DSO)")
    @PostMapping("/update")
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportSiteResult> updateSite(@Parameter(description = "CSV file containing site to update.")
                                                       @RequestParam MultipartFile file) throws BusinessException {
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
     * @param order
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
    @Operation(summary = "Find sites by criteria. (TSO, DSO, PRODUCER)",
            description = "Find sites according to the search criteria.")
    @GetMapping
    public ResponseEntity<SiteDTO[]> findSite(
            @Parameter(description = "The field used to sort", example = "producerMarketParticipantName")
            @RequestParam(value = "order", required = false) String order,
            @Parameter(description = "'EOLIEN' or 'PHOTOVOLTAIQUE'", example = "PHOTOVOLTAIQUE")
            @RequestParam(value = "technologyType", required = false) List<TechnologyTypeEnum> technologyType,
            @Parameter(description = "producerMarketParticipantMrid search criteria", example = "17Y100A103R0629X")
            @RequestParam(value = "producerMarketParticipantMrid", required = false) String producerMarketParticipantMrid,
            @Parameter(description = "producerMarketParticipantName search criteria", example = "MyProducer")
            @RequestParam(value = "producerMarketParticipantName", required = false) String producerMarketParticipantName,
            @Parameter(description = "siteName search criteria", example = "siteDpt")
            @RequestParam(value = "siteName", required = false) String siteName,
            @Parameter(description = "substationName search criteria", example = "CONFOLENS")
            @RequestParam(value = "substationName", required = false) String substationName,
            @Parameter(description = "substationMrid search criteria", example = "CONF6")
            @RequestParam(value = "substationMrid", required = false) String substationMrid,
            @Parameter(description = "siteIecCode search criteria", example = "MySiteIecCode")
            @RequestParam(value = "siteIecCode", required = false) String siteIecCode,
            @Parameter(description = "meteringPointMrId search criteria", example = "PDL00000000289774")
            @RequestParam(value = "meteringPointMrId", required = false) String meteringPointMrId) throws BusinessException, TechnicalException {
        Sort sort = order == null ? Sort.by("producerMarketParticipantName") : Sort.by(order);
        SiteCrteria criteria = SiteCrteria.builder().meteringPointMrId(meteringPointMrId).producerMarketParticipantMrid(producerMarketParticipantMrid)
                .producerMarketParticipantName(producerMarketParticipantName).siteIecCode(siteIecCode).substationMrid(substationMrid)
                .substationName(substationName).siteName(siteName).technologyType(technologyType).instance(instance).build();
        if (PRODUCER.equals(instance)) {
            criteria.setProducerMarketParticipantMrid(securityComponent.getProducerMarketParticipantMrid(true));
        }
        return ResponseEntity.status(HttpStatus.OK).body(siteMapper.beanToDtos(siteService.findSite(criteria, sort)));
    }
}
