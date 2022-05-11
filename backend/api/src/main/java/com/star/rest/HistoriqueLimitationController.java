package com.star.rest;

import com.star.models.common.OrderDirection;
import com.star.dto.common.PageDTO;
import com.star.models.common.PaginationDto;
import com.star.dto.historiquelimitation.HistoriqueLimitationDTO;
import com.star.enums.InstanceEnum;
import com.star.exception.TechnicalException;
import com.star.mapper.historiquelimitation.HistoriqueLimitationPageMapper;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;
import com.star.security.SecurityComponent;
import com.star.service.HistoriqueLimitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @Autowired
    private HistoriqueLimitationPageMapper historiqueLimitationPageMapper;

    @Autowired
    private SecurityComponent securityComponent;

    @Operation(summary = "Get limitation history.")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Get limitation history",
            content = {@Content(mediaType = "application/json")})})
    @GetMapping()
    public ResponseEntity<PageDTO<HistoriqueLimitationDTO>> findLimitationHistory(
            @RequestParam(required = false, defaultValue = "10") int pageSize,
            @RequestParam(required = false) String order,
            @RequestParam(required = false, defaultValue = "asc") OrderDirection orderDirection,
            @RequestParam(required = false, defaultValue = "") String bookmark,
            @RequestParam(required = false, defaultValue = "") String originAutomationRegisteredResourceMrid,
            @RequestParam(required = false, defaultValue = "") String producerMarketParticipantMrid,
            @RequestParam(required = false, defaultValue = "") String siteName,
            @RequestParam(required = false, defaultValue = "") String startCreatedDateTime,
            @RequestParam(required = false, defaultValue = "") String endCreatedDateTime,
            @RequestParam(required = false, defaultValue = "") String activationDocumentMrid
    ) throws TechnicalException {
        var pagination = PaginationDto.builder()
                .pageSize(pageSize)
                .order(order)
                .orderDirection(orderDirection)
                .build();
        var criteria = HistoriqueLimitationCriteria.builder()
                .originAutomationRegisteredResourceMrid(originAutomationRegisteredResourceMrid)
                .producerMarketParticipantMrid(producerMarketParticipantMrid)
                .siteName(siteName)
                .startCreatedDateTime(startCreatedDateTime)
                .endCreatedDateTime(endCreatedDateTime)
                .activationDocumentMrid(activationDocumentMrid)
                .instance(instance)
                .build();
        if (PRODUCER.equals(instance)) {
            // A producer can get only his own site data
            criteria.setProducerMarketParticipantMrid(securityComponent.getProducerMarketParticipantMrid(true));
        }
        return ResponseEntity.status(HttpStatus.OK).body(historiqueLimitationPageMapper.beanToDto(historiqueLimitationService.findHistorique(criteria, bookmark, pagination)));
    }
}
