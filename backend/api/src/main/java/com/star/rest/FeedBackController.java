package com.star.rest;

import com.star.dto.feedback.FeedBackDTO;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.feedback.FeedBackMapper;
import com.star.security.SecurityComponent;
import com.star.service.FeedBackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.constraints.NotNull;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(FeedBackController.PATH)
public class FeedBackController {
    public static final String PATH = ApiRestVersion.VERSION + "/feedback";

    @Autowired
    private FeedBackService feedBackService;

    @Autowired
    private FeedBackMapper feedBackMapper;

    @Autowired
    private SecurityComponent securityComponent;

    /**
     * API de création d'un reserve bid.
     *
     * @param feedBackDTO
     * @return
     */
    @Operation(summary = "Post a feedback.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Create successfully a feedback", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping
    @PreAuthorize("@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<Void> createFeedback(@NotNull @RequestBody FeedBackDTO feedBackDTO) throws BusinessException, TechnicalException {
        log.info("Traitement du feedback DTO {}", feedBackDTO);
        // TODO : le body ne doit pas avoir cette forme !!!
        var x = 1 / (3 - 3);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

}
