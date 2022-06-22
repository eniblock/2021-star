package com.star.rest;

import com.star.dto.historiquelimitation.HistoriqueLimitationDTO;
import com.star.enums.InstanceEnum;
import com.star.exception.TechnicalException;
import com.star.mapper.historiquelimitation.HistoriqueLimitationMapper;
import com.star.models.common.OrderDirection;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;
import com.star.security.SecurityComponent;
import com.star.service.HistoriqueLimitationService;
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
    private HistoriqueLimitationMapper historiqueLimitationMapper;

    @Autowired
    private SecurityComponent securityComponent;

    /**
     * API de recherche multi-critères des historiques de limitation
     *
     * @param order
     * @param orderDirection
     * @param originAutomationRegisteredResourceMrid
     * @param producerMarketParticipantMrid
     * @param siteName
     * @param startCreatedDateTime
     * @param endCreatedDateTime
     * @param activationDocumentMrid
     * @return
     * @throws TechnicalException
     */
    @Operation(summary = "Get limitation history.")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Get limitation history", content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)
    })
    @GetMapping()
    public ResponseEntity<HistoriqueLimitationDTO[]> findLimitationHistory(
            @Parameter(description = "order search criteria")
            @RequestParam(required = false) String order,
            @Parameter(description = "orderDirection (asc or desc) search criteria")
            @RequestParam(required = false, defaultValue = "asc") OrderDirection orderDirection,
            @Parameter(description = "originAutomationRegisteredResourceMrid search criteria")
            @RequestParam(required = false, defaultValue = "") String originAutomationRegisteredResourceMrid,
            @Parameter(description = "producerMarketParticipantMrid search criteria")
            @RequestParam(required = false, defaultValue = "") String producerMarketParticipantMrid,
            @Parameter(description = "producerMarketParticipantName search criteria")
            @RequestParam(required = false, defaultValue = "") String producerMarketParticipantName,
            @Parameter(description = "siteName search criteria")
            @RequestParam(required = false, defaultValue = "") String siteName,
            @Parameter(description = "startCreatedDateTime search criteria")
            @RequestParam(required = false, defaultValue = "") String startCreatedDateTime,
            @Parameter(description = "endCreatedDateTime search criteria")
            @RequestParam(required = false, defaultValue = "") String endCreatedDateTime,
            @Parameter(description = "activationDocumentMrid search criteria")
            @RequestParam(required = false, defaultValue = "") String activationDocumentMrid
    ) throws TechnicalException {
        var criteria = HistoriqueLimitationCriteria.builder()
                .originAutomationRegisteredResourceMrid(originAutomationRegisteredResourceMrid)
                .producerMarketParticipantName(producerMarketParticipantName)
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
        return ResponseEntity.status(HttpStatus.OK).body(historiqueLimitationMapper.beanToDtos(historiqueLimitationService.findHistorique(criteria, order, orderDirection)));
    }
}
