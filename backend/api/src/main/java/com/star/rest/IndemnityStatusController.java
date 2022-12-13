package com.star.rest;

import com.star.dto.indemnityStatus.IndemnityStatusUpdateDTO;
import com.star.exception.TechnicalException;
import com.star.service.IndemnityStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(IndemnityStatusController.PATH)
public class IndemnityStatusController {
    public static final String PATH = ApiRestVersion.VERSION + "/indemnityStatus";

    @Autowired
    private IndemnityStatusService indemnityStatusService;

    /**
     * API de modification statut d'indemnité
     *
     * @return le nouveau statut (voir l'enum "IndemnityStatus")
     */
    @Operation(summary = "Update an indemnity status.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "200", description = "Update successfully an energy Account", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PutMapping
    public ResponseEntity<String> updateEnergyAccount(
            @Valid @RequestBody IndemnityStatusUpdateDTO indemnityStatusUpdateDTO) throws TechnicalException {
        var result = indemnityStatusService.updateIndemnityStatus(indemnityStatusUpdateDTO.getActivationDocumentMrid());
        if (result == null || result.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("");
        }
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

}
