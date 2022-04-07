package com.star.rest;

import com.star.dto.common.PageResponse;
import com.star.dto.historiquelimitation.HistoriqueLimitationDTO;
import com.star.enums.InstanceEnum;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

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

    @Operation(summary = "Get limitation history.")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Get limit orders",
            content = {@Content(mediaType = "application/json")})})
    @GetMapping()
    public ResponseEntity<PageResponse<HistoriqueLimitationDTO>> findLimitationOrder(
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSize,
            @RequestParam(value = "order") String order,
            @RequestParam(value = "orderDirection") String orderDirection,
            @RequestParam(value = "bookmark", required = false, defaultValue = "") String bookmark,
            @RequestParam(value = "originAutomationRegisteredResourceMrid", required = false, defaultValue = "") String originAutomationRegisteredResourceMrid,
            @RequestParam(value = "producerMarketParticipantMrid", required = false, defaultValue = "") String producerMarketParticipantMrid,
            @RequestParam(value = "startCreatedDateTime", required = false, defaultValue = "") String startCreatedDateTime,
            @RequestParam(value = "endCreatedDateTime", required = false, defaultValue = "") String endCreatedDateTime,
            @RequestParam(value = "siteName", required = false, defaultValue = "") String siteName,
            @RequestParam(value = "activationDocumentMrid", required = false, defaultValue = "") String activationDocumentMrid
    ) {
        var p = new PageResponse<HistoriqueLimitationDTO>();
        log.info("--------------------------");
        log.info(pageSize + "");
        log.info(page + "originAutomationRegisteredResourceMrid");
        log.info(page + "producerMarketParticipantMrid");
        p.setBookmark("");
        p.setTotalElements(1);
        var h = new HistoriqueLimitationDTO();
        h.setMeteringPointMrid("aze");
        p.setContent(Arrays.asList(h));
        return ResponseEntity.status(HttpStatus.OK).body(p);
    }
}
