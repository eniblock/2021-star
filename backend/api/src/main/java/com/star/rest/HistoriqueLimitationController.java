package com.star.rest;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.dto.historiquelimitation.HistoriqueLimitationDTO;
import com.star.enums.InstanceEnum;
import com.star.exception.TechnicalException;
import com.star.mapper.historiquelimitation.HistoriqueLimitationMapper;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;
import com.star.models.historiquelimitation.TypeCriteria;
import com.star.security.SecurityComponent;
import com.star.service.HistoriqueLimitationService;
import io.micrometer.core.annotation.Counted;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

import static com.star.enums.InstanceEnum.PRODUCER;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(HistoriqueLimitationController.PATH)
@Tag(name = "Limitation History")
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

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * API de recherche multi-critères des historiques de limitation
     *
     * @param originAutomationRegisteredResourceMrid
     * @param producerMarketParticipantMrid
     * @param siteName
     * @param startCreatedDateTime
     * @param endCreatedDateTime
     * @param activationDocumentMrid
     * @return
     * @throws TechnicalException
     */
    @Operation(summary = "Get limitation history. (TSO, DSO, PRODUCER)")
    @Counted
    @GetMapping()
    public ResponseEntity<HistoriqueLimitationDTO[]> findLimitationHistory(
            @Parameter(description = "originAutomationRegisteredResourceMrid search criteria", example = "LONGC")
            @RequestParam(required = false, defaultValue = "") String originAutomationRegisteredResourceMrid,
            @Parameter(description = "producerMarketParticipantMrid search criteria", example = "17Y100A101R0629X")
            @RequestParam(required = false, defaultValue = "") String producerMarketParticipantMrid,
            @Parameter(description = "producerMarketParticipantName search criteria", example = "myProducerName")
            @RequestParam(required = false, defaultValue = "") String producerMarketParticipantName,
            @Parameter(description = "siteName search criteria", example = "mySiteName")
            @RequestParam(required = false, defaultValue = "") String siteName,
            @Parameter(description = "startCreatedDateTime search criteria", example = "2022-11-30T23:00:00Z")
            @RequestParam(required = false, defaultValue = "") String startCreatedDateTime,
            @Parameter(description = "endCreatedDateTime search criteria", example = "2022-12-31T23:00:00Z")
            @RequestParam(required = false, defaultValue = "") String endCreatedDateTime,
            @Parameter(description = "activationDocumentMrid search criteria", example = "3f432650-8b06-40d4-b294-3ed774d57249")
            @RequestParam(required = false, defaultValue = "") String activationDocumentMrid,
            @Parameter(description = "meteringPointMrid search criteria", example = "PRM30001510803649")
            @RequestParam(required = false, defaultValue = "") String meteringPointMrid,
            @Parameter(description = "activationType search criteria", example = "{\"messageType\":\"D01\",\"businessType\":\"Z01\",\"reasonCode\":\"A70\"}")
            @RequestParam(required = false, defaultValue = "") String activationType,
            @Parameter(description = "activationReasonList search criteria", example = "[{\"messageType\":\"D01\",\"businessType\":\"Z01\",\"reasonCode\":\"A70\"}]")
            @RequestParam(required = false, defaultValue = "") String activationReasonList
    ) throws TechnicalException, JsonProcessingException {
        TypeCriteria typeCriteria = null;
        List<TypeCriteria> typeCriteriaList = new ArrayList<>();
        if (StringUtils.isNotBlank(activationType)) {
            typeCriteria = objectMapper.readValue(activationType, TypeCriteria.class);
        }
        if (StringUtils.isNotBlank(activationReasonList)) {
            typeCriteriaList = objectMapper.readValue(activationReasonList, objectMapper.getTypeFactory().constructCollectionType(List.class, TypeCriteria.class));
        }
        var criteria = HistoriqueLimitationCriteria.builder()
                .originAutomationRegisteredResourceMrid(originAutomationRegisteredResourceMrid)
                .producerMarketParticipantName(producerMarketParticipantName)
                .producerMarketParticipantMrid(producerMarketParticipantMrid)
                .siteName(siteName)
                .startCreatedDateTime(startCreatedDateTime)
                .endCreatedDateTime(endCreatedDateTime)
                .activationDocumentMrid(activationDocumentMrid)
                .meteringPointMrid(meteringPointMrid)
                .activationType(typeCriteria)
                .activationReasonList(typeCriteriaList)
                .instance(instance)
                .build();
        log.debug("Recherche des historique de limitation avec les critères : {}", criteria);
        if (PRODUCER.equals(instance)) {
            // A producer can get only his own site data
            criteria.setProducerMarketParticipantMrid(securityComponent.getProducerMarketParticipantMrid(true));
        }
        HistoriqueLimitationDTO[] returnedDtos = historiqueLimitationMapper.beanToDtos(historiqueLimitationService.findHistorique(criteria));
        return ResponseEntity.status(HttpStatus.OK).body(returnedDtos);
    }
}
