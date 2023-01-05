package com.star.rest;


import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.yellowpages.ImportYellowPagesResult;
import com.star.models.yellowpages.YellowPages;
import com.star.service.YellowPagesService;
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

import static org.apache.commons.collections4.CollectionUtils.isEmpty;


/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(YellowPagesController.PATH)
public class YellowPagesController {
    public static final String PATH = ApiRestVersion.VERSION + "/yellow-pages";

    @Autowired
    private YellowPagesService yellowPagesService;

    @Operation(summary = "Post yellow Pages CSV file. (TSO, DSO)")
    @PostMapping
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportYellowPagesResult> importYellowPages(@Parameter(description = "CSV file containing yellow page data.")
                                                                     @RequestParam MultipartFile file) throws BusinessException {
        ImportYellowPagesResult importYellowPagesResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importYellowPagesResult = yellowPagesService.importYellowPages(file.getOriginalFilename(), streamReader);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importYellowPagesResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importYellowPagesResult);
    }

    @Operation(summary = "Get list of yellow pages. (TSO, DSO, PRODUCER)",
            description = "Return the list of all yellow pages of the application.\n\n Yellow pages represent the correspondence between the RTE automatons and the Poste Source Enedis.")
    @GetMapping
    public ResponseEntity<List<YellowPages>> getYellowPages() throws TechnicalException, BusinessException {
        return ResponseEntity.ok(yellowPagesService.getYellowPages());
    }

}
