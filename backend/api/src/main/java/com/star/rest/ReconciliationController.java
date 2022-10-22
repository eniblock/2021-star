package com.star.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.exception.BusinessException;
import com.star.service.ReconciliationService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeoutException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Hidden
@Slf4j
@RestController
@RequestMapping(ReconciliationController.PATH)
public class ReconciliationController {

    public static final String PATH = ApiRestVersion.VERSION + "/reconciliation";

    @Autowired
    private ReconciliationService reconciliationService;

    /**
     * API de recherche de l'état de la réconciliation
     * @return
     * @throws BusinessException
     * @throws JsonProcessingException
     * @throws ContractException
     */
    @GetMapping
    public ResponseEntity<String> getReconciliation() throws BusinessException, JsonProcessingException, ContractException {
        return ResponseEntity.status(HttpStatus.OK).body(reconciliationService.getReconciliation());
    }

    @Operation(summary = "Post a reconciliation.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Create successfully reconciliation", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping
    public ResponseEntity<Void> reconciliate() throws BusinessException, InterruptedException, TimeoutException, ContractException {
        reconciliationService.reconciliate();
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
}