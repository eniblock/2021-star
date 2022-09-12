package com.star.rest;

import com.star.enums.InstanceEnum;
import com.star.exception.TechnicalException;
import com.star.models.participant.SystemOperator;
import com.star.security.SecurityComponent;
import com.star.service.MarketParticipantService;
import com.star.service.ProducerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.star.enums.InstanceEnum.DSO;
import static com.star.enums.InstanceEnum.TSO;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(InstanceController.PATH)
public class InstanceController {
    public static final String PATH = ApiRestVersion.VERSION + "/instance";

    @Value("${instance}")
    private InstanceEnum instance;

    @Autowired
    private ProducerService producerService;

    @Autowired
    private MarketParticipantService marketParticipantService;

    @Autowired
    private SecurityComponent securityComponent;

    /**
     * API indiquant l'instance (TSO ou DSO) du backend
     *
     * @return
     */
    @Operation(summary = "Get current backend instance")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Get current backend instance",
            content = {@Content(mediaType = "application/json")})})
    @GetMapping
    public ResponseEntity<InstanceEnum> getCurrentInstance() {
        return ResponseEntity.ok(instance);
    }

    /**
     * API indiquant le nom du participant
     *
     * @return
     */
    @Operation(summary = "Get the participant name")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Get the participant name",
            content = {@Content(mediaType = "application/json")})})
    @GetMapping("/participantName")
    public ResponseEntity<String> getParticipantName() throws TechnicalException {
        if (instance == InstanceEnum.PRODUCER) {
            return ResponseEntity.ok(producerService
                    .getProducer(securityComponent.getProducerMarketParticipantMrid(true))
                    .getProducerMarketParticipantName());
        } else {
            var systemOperatorMarketParticipantMrid = securityComponent.getSystemOperatorMarketParticipantMrid(true);
            return ResponseEntity.ok(marketParticipantService
                    .getSystemOperators().stream()
                    .filter(so -> so.getSystemOperatorMarketParticipantMrid().equals(systemOperatorMarketParticipantMrid))
                    .findFirst()
                    .orElse(new SystemOperator())
                    .getSystemOperatorMarketParticipantName()
            );
        }
    }

}
