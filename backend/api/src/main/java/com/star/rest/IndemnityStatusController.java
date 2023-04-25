package com.star.rest;

import com.star.dto.indemnityStatus.IndemnityStatusUpdateDTO;
import com.star.exception.TechnicalException;
import com.star.service.IndemnityStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@Tag(name="Indemnity Status")
public class IndemnityStatusController {
    public static final String PATH = ApiRestVersion.VERSION + "/indemnityStatus";

    @Autowired
    private IndemnityStatusService indemnityStatusService;

    /**
     * API de modification statut d'indemnité
     *
     * @return le nouveau statut (voir l'enum "IndemnityStatus")
     */
    @Operation(summary = "Update the indemnity status of limitation order. (TSO, DSO, PRODUCER)",
            description = "The Producers can change the status of a limitation order when they have sent their invoice. Calling this endpoint can be done by a Producer only if the current status is 'WaitingInvoice'. Then the new status become 'InvoiceSent'.")
    @PutMapping
    public ResponseEntity<String> getIndemnityStatus(
            @Valid @RequestBody IndemnityStatusUpdateDTO indemnityStatusUpdateDTO) throws TechnicalException {
        var result = indemnityStatusService.updateIndemnityStatus(indemnityStatusUpdateDTO.getActivationDocumentMrid());
        if (result == null || result.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("");
        }
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    /**
     * API d'abandon d'indemnité
     *
     * @return le nouveau statut (voir l'enum "IndemnityStatus")
     */
    @Operation(summary = "Abandon a limitation order. (TSO, DSO)",
            description = "The Producers can change the status of a limitation order when they have sent their invoice. Calling this endpoint can be done by a Producer only if the current status is 'WaitingInvoice'. Then the new status become 'InvoiceSent'.")
    @PutMapping("/abandon")
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<String> manageActivationDocumentAbandon(
            @Valid @RequestBody IndemnityStatusUpdateDTO indemnityStatusUpdateDTO) throws TechnicalException {
        var result = indemnityStatusService.manageActivationDocumentAbandon(indemnityStatusUpdateDTO.getActivationDocumentMrid());
        if (result == null || result.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("");
        }
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

}
