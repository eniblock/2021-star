package com.star.rest;

import com.star.dto.common.PageResponseDTO;
import com.star.dto.historiquelimitation.HistoriqueLimitationDTO;
import com.star.enums.InstanceEnum;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;
import com.star.security.SecurityUtils;
import com.star.service.HistoriqueLimitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.star.enums.InstanceEnum.PRODUCER;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(HistoriqueLimitationController.PATH)
public class HistoriqueLimitationController {
    public static final String PATH = ApiRestVersion.VERSION + "/historiqueLimitations";

    @Value("${instance}")
    private InstanceEnum instance;

    @Autowired
    private HistoriqueLimitationService historiqueLimitationService;

    @Operation(summary = "Get limitation history.")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Get limit orders",
            content = {@Content(mediaType = "application/json")})})
    @GetMapping()
    public ResponseEntity<PageResponseDTO<HistoriqueLimitationDTO>> findLimitationOrder(
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSize,
            @RequestParam(value = "order") String order,
            @RequestParam(value = "orderDirection") String orderDirection,
            @RequestParam(value = "bookmark", required = false, defaultValue = "") String bookmark,
            @RequestParam(value = "originAutomationRegisteredResourceMrid", required = false, defaultValue = "") String originAutomationRegisteredResourceMrid,
            @RequestParam(value = "producerMarketParticipantMrid", required = false, defaultValue = "") String producerMarketParticipantMrid,
            @RequestParam(value = "siteName", required = false, defaultValue = "") String siteName,
            @RequestParam(value = "startCreatedDateTime", required = false, defaultValue = "") String startCreatedDateTime,
            @RequestParam(value = "endCreatedDateTime", required = false, defaultValue = "") String endCreatedDateTime,
            @RequestParam(value = "activationDocumentMrid", required = false, defaultValue = "") String activationDocumentMrid
    ) {
        Assert.notNull(order, "Order must not be null");
        Sort sort = Sort.by(order);
        PageRequest pageRequest = PageRequest.of(page, pageSize, sort);
        var criteria = HistoriqueLimitationCriteria.builder()
                .originAutomationRegisteredResourceMrid(originAutomationRegisteredResourceMrid)
                .producerMarketParticipantMrid(producerMarketParticipantMrid)
                .siteName(siteName)
                .startCreatedDateTime(startCreatedDateTime)
                .endCreatedDateTime(endCreatedDateTime)
                .activationDocumentMrid(activationDocumentMrid)
                .build();
        if (PRODUCER.equals(instance)) {
            // A producer can get only his own site data
            criteria.setProducerMarketParticipantMrid(SecurityUtils.getProducerMarketParticipantMrid());
        }
        return null;//ResponseEntity.status(HttpStatus.OK).body(siteHistoriqueLimitationMapper.beanToDto(historiqueLimitationService.findSite(criteria, bookmark, pageRequest)));
    }
}
