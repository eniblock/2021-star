package com.star.rest;

import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.limitation.FichierOrdreLimitation;
import com.star.models.limitation.ImportOrdreDebutLimitationResult;
import com.star.service.OrdreLimitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.apache.commons.collections4.CollectionUtils.isEmpty;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(OrdreLimitationController.PATH)
public class OrdreLimitationController {
    public static final String PATH = ApiRestVersion.VERSION + "/ordreLimitations";

    @Value("${instance}")
    private InstanceEnum instance;

    @Autowired
    private OrdreLimitationService ordreLimitationService;

    @Operation(summary = "Post ordre Debut limitation JSON file.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Create successfully ordre debut limitation",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "409", description = "Error in the file"),
            @ApiResponse(responseCode = "500", description = "Internal error")})
    @PostMapping("/debut/files")
    public ResponseEntity<ImportOrdreDebutLimitationResult> importOrdreDebutLimitation(@RequestParam MultipartFile[] files) throws BusinessException {
        if (!InstanceEnum.TSO.equals(instance)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Files must not be empty");
        }
        ImportOrdreDebutLimitationResult importMarketParticipantResult;
        try {
            List<FichierOrdreLimitation> fichierOrdreLimitations = new ArrayList<>();
            for (MultipartFile file : files) {
                fichierOrdreLimitations.add(new FichierOrdreLimitation(file.getOriginalFilename(), file.getInputStream()));
            }
            importMarketParticipantResult = ordreLimitationService.importOrdreDebutLimitation(fichierOrdreLimitations);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importMarketParticipantResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importMarketParticipantResult);
    }
}
