package com.star.rest;

import com.star.dto.historiquelimitation.BalancingDocumentDTO;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.historiquelimitation.BalancingDocumentMapper;
import com.star.models.balancing.BalancingDocumentCriteria;
import com.star.service.BalancingDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(BalancingDocumentController.PATH)
@Tag(name="Balancing Document")
public class BalancingDocumentController {

    public static final String PATH = ApiRestVersion.VERSION + "/balancingDocument";

    @Autowired
    private BalancingDocumentService balancingDocumentService;

    @Autowired
    private BalancingDocumentMapper balancingDocumentMapper;

    /**
     * API de recherche multi-critère des balancing document
     *
     * @param meteringPointMrid
     * @param startCreatedDateTime
     * @param endCreatedDateTime
     * @param activationDocumentMrid
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    @Operation(summary = "Find balancing document by criteria. (TSO, DSO)",
            description = "Return balancing documents searched by criteria.")
    @GetMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<List<BalancingDocumentDTO>> findBalancingDocument(
            @Parameter(description = "meteringPointMrid search criteria")
            @RequestParam(value = "meteringPointMrid", required = false) String meteringPointMrid,
            @Parameter(description = "startCreatedDateTime search criteria")
            @RequestParam(value = "startCreatedDateTime", required = false) String startCreatedDateTime,
            @Parameter(description = "endCreatedDateTime search criteria")
            @RequestParam(value = "endCreatedDateTime", required = false) String endCreatedDateTime,
            @Parameter(description = "activationDocumentMrid search criteria")
            @RequestParam(value = "activationDocumentMrid", required = false) String activationDocumentMrid) throws BusinessException, TechnicalException {
        BalancingDocumentCriteria balancingDocumentCriteria = BalancingDocumentCriteria.builder().meteringPointMrid(meteringPointMrid)
                .startCreatedDateTime(startCreatedDateTime).endCreatedDateTime(endCreatedDateTime).activationDocumentMrid(activationDocumentMrid).build();
        return ResponseEntity.status(HttpStatus.OK).body(balancingDocumentMapper.beanToDtos(balancingDocumentService.findBalancingDocument(balancingDocumentCriteria)));
    }
}