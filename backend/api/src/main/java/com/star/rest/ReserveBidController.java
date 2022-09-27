package com.star.rest;

import com.star.dto.reservebid.ReserveBidDTO;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.reservebid.ReserveBidMapper;
import com.star.models.common.FichierImportation;
import com.star.models.reservebid.ImportReserveBidResult;
import com.star.service.ReserveBidService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(ReserveBidController.PATH)
public class ReserveBidController {
    public static final String PATH = ApiRestVersion.VERSION + "/reserveBid";

    @Autowired
    private ReserveBidMapper reserveBidMapper;
    @Autowired
    private ReserveBidService reserveBidService;

    /**
     * API de création d'un reserve bid.
     *
     * @param files
     * @return
     */
    @Operation(summary = "Post an Reserve bid.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Create successfully a reserve bid", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping
    @PreAuthorize("@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportReserveBidResult> createReserveBid(
            @Parameter(description = "Energy amount object to create")
            @RequestPart(name = "reserveBid", value = "reserveBid", required = false) @Valid ReserveBidDTO reserveBid,
            @Parameter(description = "PDF files containing reserveBid data")
            @RequestPart(name = "files", value = "files", required = false) MultipartFile[] files) throws BusinessException {
        log.debug("Import du reservebid DTO {}", reserveBid);
        log.debug("Traitement de(s) fichier(s) pour le reservebid DTO {}", files);
        ImportReserveBidResult importReserveBidResult = new ImportReserveBidResult();
        try {
            if (files != null && files.length > 0) {
                List<FichierImportation> fichiers = new ArrayList<>();
                for (MultipartFile file : files) {
                    fichiers.add(new FichierImportation(file.getOriginalFilename(), file.getInputStream()));
                }
                importReserveBidResult = reserveBidService.createReserveBid(reserveBidMapper.dtoToBean(reserveBid), fichiers);
            }
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du reserveBid {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(importReserveBidResult.getReserveBid() == null ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importReserveBidResult);
    }
}
