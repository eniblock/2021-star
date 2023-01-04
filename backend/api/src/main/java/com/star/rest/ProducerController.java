package com.star.rest;


import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.producer.ImportProducerResult;
import com.star.models.producer.Producer;
import com.star.security.SecurityComponent;
import com.star.service.ProducerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static com.star.enums.InstanceEnum.PRODUCER;
import static java.util.Arrays.asList;
import static org.apache.commons.collections4.CollectionUtils.isEmpty;
import static org.springframework.http.ResponseEntity.ok;


/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(ProducerController.PATH)
public class ProducerController {
    public static final String PATH = ApiRestVersion.VERSION + "/producer";

    @Value("${instance}")
    private InstanceEnum instance;

    @Autowired
    private ProducerService producerService;

    @Autowired
    private SecurityComponent securityComponent;

    @Operation(summary = "Post a producer CSV file. (TSO, DSO)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Create successfully producer", content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportProducerResult> importProducer(@RequestParam MultipartFile file) throws BusinessException {
        ImportProducerResult importProducerResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importProducerResult = producerService.importProducers(file.getOriginalFilename(), streamReader);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importProducerResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importProducerResult);
    }

    @Operation(summary = "Get list of producers. (TSO, DSO, PRODUCER)",
            description = "Get the list of producers.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Get list of producer", content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @GetMapping
    public ResponseEntity<List<Producer>> getMarketParticipants() throws TechnicalException, BusinessException {
        if (PRODUCER.equals(instance)) {
            return ok(asList(producerService.getProducer(securityComponent.getProducerMarketParticipantMrid(true))));
        } else {
            return ok(producerService.getProducers());
        }
    }

}
