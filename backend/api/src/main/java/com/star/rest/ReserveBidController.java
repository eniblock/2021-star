package com.star.rest;

import com.star.dto.reservebid.ReserveBidCreationDTO;
import com.star.dto.reservebid.ReserveBidDTO;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.reservebid.ReserveBidMapper;
import com.star.models.common.FichierImportation;
import com.star.models.reservebid.AttachmentFile;
import com.star.models.reservebid.ImportReserveBidResult;
import com.star.service.ReserveBidService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.TimeoutException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(ReserveBidController.PATH)
@Tag(name="Reserve Bid")
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
    @Operation(summary = "Post an Reserve Bid. (PRODUCER)",
            description = "Post a Reserve Bid (and its pdf) that will be validated (or not) by the market participant.")
    @PostMapping
    @PreAuthorize("@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportReserveBidResult> createReserveBid(
            @Parameter(description = "The Reserve Bid to create")
            @RequestPart(name = "reserveBid", value = "reserveBid", required = false) @Valid ReserveBidCreationDTO reserveBidCreationDTO,
            @Parameter(description = "PDF files")
            @RequestPart(name = "files", value = "files", required = false) MultipartFile[] files) throws BusinessException {
        log.debug("Import du reservebid DTO {}", reserveBidCreationDTO);
        log.debug("Traitement de(s) fichier(s) pour le reservebid DTO {}", files);
        ImportReserveBidResult importReserveBidResult = new ImportReserveBidResult();
        List<FichierImportation> fichiers = new ArrayList<>();
        try {
            if (files != null && files.length > 0) {
                for (MultipartFile file : files) {
                    fichiers.add(new FichierImportation(file.getOriginalFilename(), file.getInputStream()));
                }
            }
            importReserveBidResult = reserveBidService.createReserveBid(reserveBidMapper.dtoToBean(reserveBidCreationDTO), fichiers);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du reserveBid {}. Erreur : ", exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(importReserveBidResult.getReserveBid() == null ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importReserveBidResult);
    }

    @Operation(summary = "Get reserveBids. (TSO, DSO, PRODUCER)",
            description = "Find Reserve Bids by meteringPointMrid.")
    @GetMapping("/{meteringPointMrid}")
    public ResponseEntity<List<ReserveBidDTO>> getReserveBidsBySite(
            @Parameter(description = "MeteringPointMrid of the reserveBids", example = "PRM30001510803649")
            @PathVariable String meteringPointMrid) throws TechnicalException {
        return ResponseEntity.status(HttpStatus.OK).body(reserveBidMapper.beansToDtos(reserveBidService.getReserveBid(meteringPointMrid)));
    }

    @Operation(summary = "Get file. (TSO, DSO, PRODUCER)",
            description = "Get a file that has been uploaded with a reserveBid.")
    @GetMapping(value = "/file", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> getDocument(
            @Parameter(description = "the fileId of the file", example = "8bf6ea00-6dd6-46d7-9a60-32431ca76834_my-file.pdf")
            @RequestParam(value = "fileId") String fileId) throws TechnicalException {

        AttachmentFile attachmentFile = reserveBidService.getFile(fileId);
        var fileName = fileId.substring(fileId.indexOf('_') + 1);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData(fileName, fileName);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(Base64.getDecoder().decode(attachmentFile.getFileContent()), headers, HttpStatus.OK);
    }

    @Operation(summary = "Update an reserveBid's status. (TSO, DSO)")
    @PutMapping(value = "/{reserveBidMrid}/{newStatus}")
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<Void> updateStatusReserveBid(
            @Parameter(description = "Reserve bid Id to update")
            @PathVariable("reserveBidMrid") String reserveBidMrid,
            @Parameter(description = "New status of the reserveBid")
            @PathVariable("newStatus") String newStatus) throws BusinessException, TechnicalException, ContractException, InterruptedException, TimeoutException {
        reserveBidService.updateStatus(reserveBidMrid, newStatus);
        return  new ResponseEntity<>(HttpStatus.OK);
    }
}
