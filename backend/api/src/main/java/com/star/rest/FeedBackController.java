package com.star.rest;

import com.star.dto.feedback.FeedBackDTO;
import com.star.dto.feedback.FeedBackPostMessageAnswerDTO;
import com.star.dto.feedback.FeedBackPostMessageDTO;
import com.star.exception.TechnicalException;
import com.star.mapper.feedback.FeedBackMapper;
import com.star.service.FeedBackService;
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
import org.springframework.web.bind.annotation.*;

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
    @PostMapping()
    @PreAuthorize("@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<FeedBackDTO> createFeedbackProducer(@NotNull @RequestBody FeedBackPostMessageDTO feedBackDTO) throws TechnicalException {
        var feedback = feedBackService.postMessage(feedBackMapper.dtoToBean(feedBackDTO));
        return ResponseEntity.ok(feedBackMapper.beanToDto(feedback));
    }

    /**
     * API de création d'un reserve bid.
     *
     * @param feedBackAnswerDTO
     * @return
     */
    @Operation(summary = "Answer a feedback.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Create successfully a feedback", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping("/answer")
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<FeedBackDTO> answerFeedbackProducer(@NotNull @RequestBody FeedBackPostMessageAnswerDTO feedBackAnswerDTO) throws TechnicalException {
        var feedback = feedBackService.postMessageAnswer(feedBackMapper.dtoToBean(feedBackAnswerDTO));
        return ResponseEntity.ok(feedBackMapper.beanToDto(feedback));
    }

    @Operation(summary = "Get a producer feedBack.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "200", description = "Found feedBack", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @GetMapping("/{activationDocumentMrid}")
    public ResponseEntity<FeedBackDTO> getFeedbackProducerByActivationDocumentMrid(
            @Parameter(description = "activationDocumentMrid of the feedback")
            @PathVariable String activationDocumentMrid) throws TechnicalException {
        return ResponseEntity.status(HttpStatus.OK).body(feedBackMapper.beanToDto(feedBackService.findByActivationDocumentMrid(activationDocumentMrid)));
    }

}
